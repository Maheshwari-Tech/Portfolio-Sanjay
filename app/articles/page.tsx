import type { Metadata } from "next";
import blogs from "../../data/source/blogs.json";
import ArticleExplorer from "./ArticleExplorer";
import SiteHeader from "../SiteHeader";
import SiteFooter from "../SiteFooter";

export const metadata: Metadata = {
  title: "Blogs & Articles",
  description: "Writing on software engineering, system design, interviews, and career growth by Sanjay Gandhi.",
  alternates: { canonical: "/articles" },
  openGraph: { url: "/articles", title: "Blogs & Articles — Sanjay Gandhi", description: "Writing on software engineering, system design, interviews, and career growth by Sanjay Gandhi." },
};

export const dynamic = "force-static";

export default function ArticlesPage() {
  return (
    <main className="articles-index-page">
      <SiteHeader />
      <section className="articles-index-hero">
        <p className="eyebrow">Ideas in practice</p>
        <h1>Blogs & Articles.</h1>
        <p>A growing library of practical notes on engineering, interviews, systems, and the work behind the work.</p>
      </section>
      <ArticleExplorer articles={blogs} />
      <SiteFooter />
    </main>
  );
}
