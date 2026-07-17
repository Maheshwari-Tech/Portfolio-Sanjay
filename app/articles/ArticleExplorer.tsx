"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../apiClient";

type Article = {
  id: number;
  title: string;
  content_description: string;
  date: string;
  tags: string[];
  author: string;
  fileType: string;
  isTextFile: boolean;
  href?: string;
  summary?: string;
  asset_url?: string;
};

const cleanTitle = (title: string) => title.replace(/\.(md|svg|pdf)$/i, "");
const summaries: Record<number, string> = {
  4: "A visual walkthrough of system design interviews, the decisions they test, and lessons from the experience.",
  6: "A visual look at the rhythms, priorities, and everyday systems behind a software engineer’s week.",
};

const excerpt = (article: Article) => summaries[article.id] ?? article.summary ?? article.content_description
  .replace(/[#*_`>-]/g, " ")
  .replace(/\s+/g, " ")
  .trim()
  .slice(0, 190) + "…";

export default function ArticleExplorer({ articles }: { articles: Article[] }) {
  const [availableArticles, setAvailableArticles] = useState(articles);
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState("All");
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => {
    let active = true;
    apiFetch("/content/blogs")
      .then(response => response.ok ? response.json() : Promise.reject())
      .then((remote: Article[]) => {
        if (!active) return;
        const merged = new Map(articles.map(article => [article.id, article]));
        remote.forEach(article => merged.set(article.id, article));
        setAvailableArticles(Array.from(merged.values()));
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, [articles]);

  const tags = useMemo(() => Array.from(new Set(availableArticles.flatMap((article) => article.tags))).sort(), [availableArticles]);
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return availableArticles.filter((article) => {
      const matchesTag = activeTag === "All" || article.tags.includes(activeTag);
      const matchesQuery = !term || cleanTitle(article.title).toLowerCase().includes(term) ||
        article.content_description.toLowerCase().includes(term) ||
        article.tags.some((tag) => tag.toLowerCase().includes(term));
      return matchesTag && matchesQuery;
    });
  }, [activeTag, availableArticles, query]);

  const updateQuery = (value: string) => {
    setQuery(value);
    setVisibleCount(12);
  };

  const updateTag = (tag: string) => {
    setActiveTag(tag);
    setVisibleCount(12);
  };

  return (
    <section className="article-explorer" aria-label="Browse blogs and articles">
      <div className="article-search-row">
        <label>
          <span>Search articles</span>
          <input value={query} onChange={(event) => updateQuery(event.target.value)} placeholder="Search by title, topic, or keyword…" />
        </label>
        <span>{filtered.length} {filtered.length === 1 ? "article" : "articles"}</span>
      </div>

      <div className="article-filters" aria-label="Filter articles by topic">
        {["All", ...tags].map((tag) => (
          <button className={activeTag === tag ? "active" : ""} key={tag} onClick={() => updateTag(tag)} type="button">
            {tag}
          </button>
        ))}
      </div>

      <div className="article-results">
        {filtered.slice(0, visibleCount).map((article) => (
          <article key={article.id}>
            <Link className="article-card-link" href={article.href ?? `/articles/${article.id}`} aria-label={`Read ${cleanTitle(article.title)}`} />
            <div className="article-result-meta"><span>{article.date}</span><span>{article.tags[0]}</span></div>
            <h2>{cleanTitle(article.title)}</h2>
            <p>{excerpt(article)}</p>
            <div className="article-result-footer">
              <span>{article.tags.join(" · ")}</span>
              <Link href={article.href ?? `/articles/${article.id}`}>Read article ↗</Link>
            </div>
          </article>
        ))}
      </div>

      {filtered.length === 0 && <p className="article-empty">No articles match this search yet.</p>}
      {visibleCount < filtered.length && (
        <button className="show-more-articles" type="button" onClick={() => setVisibleCount((count) => count + 12)}>
          Show more articles ↓
        </button>
      )}
    </section>
  );
}
