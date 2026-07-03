import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import blogs from "../../../data/source/blogs.json";

export const dynamicParams = false;
export const dynamic = "force-static";

export function generateStaticParams() {
  return blogs.map((blog) => ({ id: String(blog.id) }));
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
  return text.split(/(\*\*.*?\*\*|`.*?`)/g).filter(Boolean).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={index}>{part.slice(1, -1)}</code>;
    }
    return <span key={index}>{part}</span>;
  });
}

function MarkdownArticle({ content }: { content: string }) {
  const blocks: ReactNode[] = [];
  let unordered: string[] = [];
  let ordered: string[] = [];

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
    flushLists();
    blocks.push(<p key={`p-${blocks.length}`}>{renderInline(line)}</p>);
  });
  flushLists();

  return <div className="article-prose">{blocks}</div>;
}

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = blogs.find((blog) => String(blog.id) === id);
  if (!article) notFound();

  const asset = articleAssets[article.id];
  const related = blogs.filter((blog) => blog.id !== article.id);

  return (
    <main className="article-page">
      <header className="article-nav">
        <Link className="wordmark" href="/" aria-label="Sanjay Maheshwari, home">SM<span>.</span></Link>
        <Link href="/articles">All blogs & articles</Link>
      </header>

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
          <MarkdownArticle content={article.content_description} />
        ) : asset ? (
          <div className="visual-article">
            <object type="image/svg+xml" data={asset.svg} title={cleanTitle(article.title)}>
              <a href={asset.svg} target="_blank" rel="noreferrer">Open the visual article ↗</a>
            </object>
            <div className="visual-article-actions">
              <a href={asset.svg} target="_blank" rel="noreferrer">Open full screen ↗</a>
              {asset.pdf && <a href={asset.pdf} download>Download PDF ↓</a>}
            </div>
          </div>
        ) : null}
      </article>

      <aside className="related-articles">
        <p className="eyebrow">Keep reading</p>
        <div>
          {related.map((item) => (
            <Link href={`/articles/${item.id}`} key={item.id}>
              <span>{item.date}</span>
              <strong>{cleanTitle(item.title)}</strong>
              <span>↗</span>
            </Link>
          ))}
        </div>
      </aside>
    </main>
  );
}
