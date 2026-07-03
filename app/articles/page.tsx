import type { Metadata } from "next";
import Link from "next/link";
import blogs from "../../data/source/blogs.json";
import ArticleExplorer from "./ArticleExplorer";

export const metadata: Metadata = {
  title: "Blogs & Articles — Sanjay Gandhi",
  description: "Writing on software engineering, system design, interviews, and career growth by Sanjay Gandhi.",
};

export const dynamic = "force-static";

export default function ArticlesPage() {
  return (
    <main className="articles-index-page">
      <header className="article-nav">
        <Link className="wordmark" href="/" aria-label="Sanjay Gandhi, home">SM<span>.</span></Link>
        <Link href="/">Back to portfolio</Link>
      </header>
      <section className="articles-index-hero">
        <p className="eyebrow">Ideas in practice</p>
        <h1>Blogs & Articles.</h1>
        <p>A growing library of practical notes on engineering, interviews, systems, and the work behind the work.</p>
      </section>
      <ArticleExplorer articles={blogs} />
    </main>
  );
}
