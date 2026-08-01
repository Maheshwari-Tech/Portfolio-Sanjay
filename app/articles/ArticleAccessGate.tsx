"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ApiUnavailableError, apiFetch, authHeaders } from "../apiClient";
import { submissionSourceWebsite } from "../submissionService";
import ArticlePresentation from "./ArticlePresentation";
import RelatedArticles from "./RelatedArticles";
import { articleSummary, cleanArticleTitle, similarArticles, type ArticleRecord } from "./articleData";

type GateState = "checking" | "signed-out" | "denied" | "not-found" | "offline" | "ready";

export default function ArticleAccessGate({ article, initialCandidates }: { article: ArticleRecord; initialCandidates: ArticleRecord[] }) {
  const [state, setState] = useState<GateState>("checking");
  const [resolvedArticle, setResolvedArticle] = useState<ArticleRecord | null>(null);
  const [availableArticles, setAvailableArticles] = useState(initialCandidates);
  const [visualAsset, setVisualAsset] = useState<string>();
  const [requestState, setRequestState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  useEffect(() => {
    let active = true;
    const token = localStorage.getItem("sanjay_portfolio_token");
    if (!token) { setState("signed-out"); return () => { active = false; }; }

    const openArticle = async () => {
      try {
        const response = await apiFetch(`/content/blogs/${article.id}`, { headers: authHeaders() });
        if (!active) return;
        if (response.status === 401) { setState("signed-out"); return; }
        if (response.status === 403) { setState("denied"); return; }
        if (response.status === 404) { setState("not-found"); return; }
        if (!response.ok) throw new Error();
        const detail = await response.json() as ArticleRecord;
        if (!active) return;
        setResolvedArticle(detail);
        if (!detail.isTextFile) {
          if (detail.blob_key) {
            const assetResponse = await apiFetch(`/content/blogs/${detail.id}/asset-url`, { headers: authHeaders() });
            if (assetResponse.ok) {
              const asset = await assetResponse.json() as { url?: string };
              if (active && asset.url) setVisualAsset(asset.url);
            }
          } else if (detail.asset_url) setVisualAsset(detail.asset_url);
        }
        apiFetch("/content/blogs", { headers: authHeaders() }).then((listResponse) => listResponse.ok ? listResponse.json() : Promise.reject()).then((items: ArticleRecord[]) => { if (active) setAvailableArticles(items); }).catch(() => undefined);
        setState("ready");
      } catch (error) {
        if (active) setState(error instanceof ApiUnavailableError ? "offline" : "offline");
      }
    };
    void openArticle();
    return () => { active = false; };
  }, [article.id]);

  const related = useMemo(() => similarArticles(resolvedArticle ?? article, availableArticles), [article, availableArticles, resolvedArticle]);

  async function requestAccess() {
    setRequestState("sending");
    let storedUser: { name?: string } = {};
    try { storedUser = JSON.parse(localStorage.getItem("sanjay_portfolio_user") || "{}"); } catch { /* Backend identity remains authoritative. */ }
    try {
      const noteTitle = cleanArticleTitle(article.title).trim();
      const response = await apiFetch("/submissions", { method: "POST", headers: authHeaders(), body: JSON.stringify({ type: "contact", source_website: submissionSourceWebsite(), title: noteTitle ? `Note access: ${noteTitle}` : `Note access: #${article.id}`, name: storedUser.name || "Portfolio member", category: "Note access", message: noteTitle ? `Please grant access to note ${article.id}: ${noteTitle}.` : `Please grant access to note ${article.id}.` }) });
      if (!response.ok) throw new Error();
      setRequestState("sent");
    } catch { setRequestState("error"); }
  }

  if (state === "ready" && resolvedArticle) return <><ArticlePresentation article={resolvedArticle} markdownContent={resolvedArticle.body ?? resolvedArticle.content_description} visualAsset={visualAsset} /><RelatedArticles articles={related} /></>;

  const isSemiPrivate = article.visibility === "semi-private";
  const visibleTitle = cleanArticleTitle(article.title).trim();
  const loginHref = `/login?next=${encodeURIComponent(`/articles/${article.id}`)}`;
  return <>
    <section className="article-access-gate" aria-live="polite"><div>
      <p className="eyebrow">Protected Second Brain note</p>
      {state === "checking" && <><h1>Checking note access…</h1><p>Your permissions are being verified.</p></>}
      {state === "signed-out" && <><h1>{isSemiPrivate ? visibleTitle : "Sign in to read this."}</h1>{isSemiPrivate && <p>{articleSummary(article)}</p>}<p>This note is available to approved readers.</p><Link className="button button-dark" href={loginHref}>Sign in to continue</Link></>}
      {state === "denied" && <><h1>{visibleTitle || "This note is protected."}</h1><p>This note is available to approved readers.</p>{requestState === "sent" ? <p className="article-access-success">Access request sent. I’ll review it shortly.</p> : <button className="button button-dark" disabled={requestState === "sending"} onClick={() => void requestAccess()} type="button">{requestState === "sending" ? "Sending…" : "Request access"}</button>}{requestState === "error" && <p className="article-access-error">The request could not be sent. Please try again.</p>}</>}
      {state === "not-found" && <><h1>Note not found.</h1><p>This note is unavailable or has been removed.</p><Link className="button button-dark" href="/articles">Explore Second Brain notes</Link></>}
      {state === "offline" && <><h1>Access cannot be verified right now.</h1><p>The note remains locked while the private service is unavailable. Please try again shortly.</p></>}
    </div></section>
    <RelatedArticles articles={similarArticles(article, initialCandidates)} />
  </>;
}
