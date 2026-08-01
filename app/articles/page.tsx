import type { Metadata } from "next";
import blogsFallback from "../../data/source/blogs.json";
import ArticleExplorer from "./ArticleExplorer";
import SiteHeader from "../SiteHeader";
import SiteFooter from "../SiteFooter";
import { backendFirst } from "../serverContent";
import type { ArticleRecord } from "./articleData";

export const metadata: Metadata = {
  title: "Notes & Thoughts",
  description: "Notes on engineering, interviews, systems, and the work behind the work by Sanjay Gandhi.",
  alternates: { canonical: "/articles" },
  openGraph: { url: "/articles", title: "Notes & Thoughts — Sanjay Gandhi", description: "Notes on engineering, interviews, systems, and the work behind the work by Sanjay Gandhi." },
};

export const revalidate = 120;

export default async function ArticlesPage() {
  const blogs = await backendFirst("blogs", blogsFallback);
  return (
    <>
      <SiteHeader />
      <main className="articles-index-page" id="main-content"><section className="articles-index-hero">
        <p className="eyebrow">Notes</p>
        <h1>Notes &amp; Thoughts.</h1>
        <p>Notes on engineering, interviews, systems, and the work behind the work.</p>
      </section>
      <ArticleExplorer articles={blogs as ArticleRecord[]} />
      </main>
      <SiteFooter />
    </>
  );
}
