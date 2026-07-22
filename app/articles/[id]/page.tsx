import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import blogs from "../../../data/source/blogs.json";
import { siteConfig } from "../../siteConfig";
import ContentInteractions from "../../ContentInteractions";
import SiteHeader from "../../SiteHeader";
import SiteFooter from "../../SiteFooter";

export const dynamicParams = true;

type ArticleRecord = {
  id: number; title: string; content_description: string; date: string; tags: string[]; author: string;
  fileType: string; isTextFile: boolean; href?: string; asset_url?: string; blob_key?: string | null;
};

const cachedBlogs = blogs as ArticleRecord[];
const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");

async function availableBlogs(): Promise<ArticleRecord[]> {
  if (!apiBase) return cachedBlogs;
  try {
    const response = await fetch(`${apiBase}/content/blogs`, { cache: "no-store", signal: AbortSignal.timeout(3000) });
    if (!response.ok) return cachedBlogs;
    const remote = await response.json() as ArticleRecord[];
    const merged = new Map(cachedBlogs.map(article => [article.id, article]));
    remote.forEach(article => merged.set(article.id, article));
    return Array.from(merged.values());
  } catch { return cachedBlogs; }
}

export function generateStaticParams() {
  return cachedBlogs.filter((blog) => !blog.href).map((blog) => ({ id: String(blog.id) }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const article = (await availableBlogs()).find((blog) => String(blog.id) === id);
  if (!article) return {};
  const title = cleanTitle(article.title);
  const description = article.content_description.replace(/[#*_`>-]/g, " ").replace(/\s+/g, " ").trim().slice(0, 155);
  const url = `/articles/${article.id}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: "article", url, title, description, publishedTime: article.date, authors: [article.author], tags: article.tags, images: ["/opengraph-image"] },
    twitter: { card: "summary_large_image", title, description, images: ["/twitter-image"] },
  };
}

const articleAssets: Record<number, { svg: string; pdf?: string }> = {
  4: {
    svg: "/blogs/system-design-interview.svg",
    pdf: "/blogs/system-design-interview.pdf",
  },
  6: { svg: "/blogs/typical-days.svg" },
};

const cleanTitle = (title: string) => title.replace(/\.(md|svg|pdf)$/i, "");

function renderInline(text: string): ReactNode[] {
  return text.split(/(\*\*.*?\*\*|`.*?`|\[[^\]]+\]\([^)]+\))/g).filter(Boolean).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={index}>{part.slice(1, -1)}</code>;
    }
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const external = /^https?:\/\//.test(link[2]);
      return <a href={link[2]} key={index} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}>{link[1]}</a>;
    }
    return <span key={index}>{part}</span>;
  });
}

function MarkdownArticle({ content }: { content: string }) {
  const blocks: ReactNode[] = [];
  let unordered: string[] = [];
  let ordered: string[] = [];
  let code: string[] = [];

  const flushLists = () => {
    if (unordered.length) {
      const items = unordered;
      blocks.push(<ul key={`ul-${blocks.length}`}>{items.map((item) => <li key={item}>{renderInline(item)}</li>)}</ul>);
      unordered = [];
    }
    if (ordered.length) {
      const items = ordered;
      blocks.push(<ol key={`ol-${blocks.length}`}>{items.map((item) => <li key={item}>{renderInline(item)}</li>)}</ol>);
      ordered = [];
    }
  };

  content.split("\n").forEach((rawLine) => {
    const line = rawLine.trim();
    if (line.startsWith("```")) {
      flushLists();
      if (code.length) {
        const value = code.join("\n");
        blocks.push(<pre key={`code-${blocks.length}`}><code>{value}</code></pre>);
        code = [];
      } else {
        code = [""];
      }
      return;
    }
    if (code.length) {
      code.push(rawLine);
      return;
    }
    if (!line) {
      flushLists();
      return;
    }
    if (/^#{1,3}\s/.test(line)) {
      flushLists();
      const level = line.match(/^#+/)?.[0].length ?? 2;
      const text = line.replace(/^#{1,3}\s*/, "");
      blocks.push(level === 1 ? <h2 key={`h-${blocks.length}`}>{renderInline(text)}</h2> : <h3 key={`h-${blocks.length}`}>{renderInline(text)}</h3>);
      return;
    }
    if (/^[-*]\s+/.test(line)) {
      if (ordered.length) flushLists();
      unordered.push(line.replace(/^[-*]\s+/, ""));
      return;
    }
    if (/^\d+\.\s+/.test(line)) {
      if (unordered.length) flushLists();
      ordered.push(line.replace(/^\d+\.\s+/, ""));
      return;
    }
    if (/^>\s?/.test(line)) {
      flushLists();
      blocks.push(<blockquote key={`quote-${blocks.length}`}>{renderInline(line.replace(/^>\s?/, ""))}</blockquote>);
      return;
    }
    flushLists();
    blocks.push(<p key={`p-${blocks.length}`}>{renderInline(line)}</p>);
  });
  flushLists();
  if (code.length) blocks.push(<pre key={`code-${blocks.length}`}><code>{code.slice(1).join("\n")}</code></pre>);

  return <div className="article-prose">{blocks}</div>;
}

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const allBlogs = await availableBlogs();
  const article = allBlogs.find((blog) => String(blog.id) === id);
  if (!article) notFound();

  const asset = articleAssets[article.id];
  const importedAsset = typeof article.asset_url === "string" ? article.asset_url : undefined;
  const blobAsset = article.blob_key && apiBase ? `${apiBase}/content/blogs/${article.id}/asset` : undefined;
  const visualAsset = blobAsset ?? importedAsset ?? asset?.svg;
  const isPdf = article.fileType === "pdf";
  const related = allBlogs.filter((blog) => blog.id !== article.id);
  const articleTitle = cleanTitle(article.title);
  let markdownContent = article.content_description;
  if (article.blob_key && article.fileType === "md" && blobAsset) {
    try {
      const response = await fetch(blobAsset, { cache: "no-store", signal: AbortSignal.timeout(5000) });
      if (response.ok) markdownContent = await response.text();
    } catch { /* The summary remains a readable fallback while storage is unavailable. */ }
  }
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: articleTitle,
    description: article.content_description.replace(/[#*_`>-]/g, " ").replace(/\s+/g, " ").trim().slice(0, 220),
    datePublished: article.date,
    author: { "@type": "Person", name: article.author, url: siteConfig.url },
    publisher: { "@type": "Person", name: siteConfig.name, url: siteConfig.url },
    mainEntityOfPage: `${siteConfig.url}/articles/${article.id}`,
    keywords: article.tags.join(", "),
  };

  return (
    <main className="article-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader />

      <article className="article-shell">
        <header className="article-header">
          <p className="eyebrow">Blog & Article</p>
          <h1>{cleanTitle(article.title)}</h1>
          <div className="article-byline">
            <span>By {article.author}</span>
            <time>{article.date}</time>
            <span>{article.tags.join(" · ")}</span>
          </div>
        </header>

        {article.isTextFile ? (
          <MarkdownArticle content={markdownContent} />
        ) : visualAsset ? (
          <div className="visual-article">
            <object type={isPdf ? "application/pdf" : "image/svg+xml"} data={visualAsset} title={cleanTitle(article.title)}>
              <a href={visualAsset} target="_blank" rel="noreferrer">Open the visual article</a>
            </object>
            <div className="visual-article-actions">
              <a href={visualAsset} target="_blank" rel="noreferrer">Open full screen</a>
              {isPdf && <a href={visualAsset} download>Download PDF ↓</a>}
              {!isPdf && asset?.pdf && <a href={asset.pdf} download>Download PDF ↓</a>}
            </div>
          </div>
        ) : null}
        <ContentInteractions contentId={`article-${article.id}`} />
      </article>

      <aside className="related-articles">
        <p className="eyebrow">Keep reading</p>
        <div>
          {related.map((item) => (
            <Link href={item.href ?? `/articles/${item.id}`} key={item.id}>
              <span>{item.date}</span>
              <strong>{cleanTitle(item.title)}</strong>
            </Link>
          ))}
        </div>
      </aside>
      <SiteFooter />
    </main>
  );
}
