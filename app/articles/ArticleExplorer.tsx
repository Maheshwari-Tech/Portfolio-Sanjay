"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../apiClient";
import { submitPortfolioEntry } from "../submissionService";

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
  const [subscriberEmail, setSubscriberEmail] = useState("");
  const [subscriptionStatus, setSubscriptionStatus] = useState("");
  const [subscribing, setSubscribing] = useState(false);

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

  const subscribe = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubscribing(true);
    setSubscriptionStatus("Subscribing…");
    const result = await submitPortfolioEntry({ type: "subscription", title: "Blog updates subscription", category: "Blog updates", name: "Blog reader", email: subscriberEmail.trim(), message: "Requested updates from the blog archive." });
    setSubscriberEmail("");
    setSubscriptionStatus(result.delivery === "api" ? "You’re on the list. Thanks for subscribing." : "The subscription service is offline. Your request is saved on this device.");
    setSubscribing(false);
  };

  const featured = filtered[0];
  const articlesToShow = filtered.slice(featured ? 1 : 0, visibleCount + 1);

  return (
    <section className="article-explorer" aria-label="Browse blogs and articles">
      <div className="article-search-row">
        <label>
          <span>Search articles</span>
          <input value={query} onChange={(event) => updateQuery(event.target.value)} placeholder="Search by title, topic, or keyword…" />
        </label>
        <span role="status" aria-live="polite">{filtered.length} {filtered.length === 1 ? "article" : "articles"}</span>
      </div>

      <div className="article-filters" aria-label="Filter articles by topic">
        {["All", ...tags].map((tag) => (
          <button className={activeTag === tag ? "active" : ""} aria-pressed={activeTag === tag} key={tag} onClick={() => updateTag(tag)} type="button">
            {tag}
          </button>
        ))}
      </div>

      {featured && <article className="featured-article"><div><span className="article-kicker">Featured note</span><span>{featured.date}</span></div><p>{featured.tags[0] || "Engineering"}</p><h2>{cleanTitle(featured.title)}</h2><p>{excerpt(featured)}</p><Link href={featured.href ?? `/articles/${featured.id}`}>Read the article</Link></article>}

      <div className="article-results">
        {articlesToShow.map((article) => (
          <article key={article.id}>
            <div className="article-result-meta"><span>{article.date}</span><span>{article.tags[0]}</span></div>
            <h2>{cleanTitle(article.title)}</h2>
            <p>{excerpt(article)}</p>
            <div className="article-result-footer">
              <span>{article.tags.join(" · ")}</span>
              <Link href={article.href ?? `/articles/${article.id}`}>Read article</Link>
            </div>
          </article>
        ))}
      </div>

      {filtered.length === 0 && <p className="article-empty">No articles match this search yet.</p>}
      {visibleCount + 1 < filtered.length && (
        <button className="show-more-articles" type="button" onClick={() => setVisibleCount((count) => count + 12)}>
          Show more articles ↓
        </button>
      )}
      <section className="article-subscribe" id="subscribe" aria-labelledby="subscribe-title"><div><p className="eyebrow">Stay updated</p><h2 id="subscribe-title">Notes worth saving for later.</h2></div><div><p>Get occasional updates when a new piece on engineering, systems, interviews, or career growth is published.</p><form onSubmit={subscribe}><label><span>Email address</span><input required type="email" value={subscriberEmail} onChange={(event) => setSubscriberEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" /></label><button disabled={subscribing}>{subscribing ? "Subscribing…" : "Subscribe"}</button></form>{subscriptionStatus && <p className="subscription-status" role="status">{subscriptionStatus}</p>}</div></section>
    </section>
  );
}
