"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { apiFetch, ApiUnavailableError, authHeaders } from "../apiClient";
import ContentCreator from "../ContentCreator";

type Overview = {
  submissions: Array<{id:number;type:string;title:string;name:string;email?:string;message?:string;category?:string;rating?:string;project_id?:string;created_at:string}>;
  comments: Array<{id:number;content_id:string;author:string;message:string;created_at:string}>;
  likes: Array<{content_id:string;count:number;people:string[]}>;
  users: Array<{id:number;name:string;phone?:string;email?:string;role:string;access?:string[]}>;
  counts: {requests:number;comments:number;likes:number};
};

export default function AdminPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [state, setState] = useState<"loading" | "offline" | "denied" | "ready">("loading");
  const [message, setMessage] = useState("");
  const storedName = typeof window === "undefined" ? "Sanjay" : (() => { try { return JSON.parse(localStorage.getItem("sanjay_portfolio_user") || "{}").name || "Sanjay"; } catch { return "Sanjay"; } })();

  const load = useCallback(async () => {
    setState("loading");
    setMessage("");
    try {
      const response = await apiFetch("/admin/overview", { headers: authHeaders() });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        setState("denied");
        setMessage(body.detail || "Admin authentication is required.");
        return;
      }
      setData(body);
      setState("ready");
    } catch (error) {
      setState(error instanceof ApiUnavailableError ? "offline" : "denied");
      setMessage(error instanceof ApiUnavailableError ? "The private API is unavailable. No admin data can be displayed or changed." : "Admin access could not be verified.");
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function toggleAccess(userId: number, area: "candidate" | "recruiter", current: string[] = []) {
    const access = current.includes(area) ? current.filter(item => item !== area) : [...current, area];
    const response = await apiFetch(`/admin/users/${userId}/access`, { method: "PATCH", headers: authHeaders(), body: JSON.stringify({ access }) });
    if (response.ok) await load();
  }

  if (state !== "ready" || !data) {
    return <main className="admin-page">
      <header className="article-nav"><Link className="wordmark" href="/">SM<span>.</span></Link><Link href="/">Public website</Link></header>
      <section className="admin-empty">
        <p className="eyebrow">PRIVATE ADMIN</p>
        <h1>{state === "loading" ? "Verifying access…" : state === "offline" ? "Admin service unavailable." : "Admin access only."}</h1>
        {message && <p>{message}</p>}
        {state === "offline" && <button className="button button-dark" type="button" onClick={() => void load()}>Retry connection ↗</button>}
        {state === "denied" && <Link className="button button-dark" href="/admin/login">Admin login ↗</Link>}
      </section>
    </main>;
  }

  return <main className="admin-page">
    <header className="article-nav"><Link className="wordmark" href="/">SM<span>.</span></Link><span>{storedName}</span></header>
    <section className="admin-shell">
      <p className="eyebrow">ADMIN PORTAL</p><h1>Portfolio activity.</h1>
      <div className="admin-counts"><div><strong>{data.counts.requests}</strong><span>Form requests</span></div><div><strong>{data.counts.comments}</strong><span>Comments</span></div><div><strong>{data.counts.likes}</strong><span>Likes</span></div></div>
      <ContentCreator />
      <section className="admin-section"><h2>User access</h2><div className="admin-list">{data.users.map(user => <article key={user.id}><div><span>{user.role}</span><h3>{user.name}</h3><p>{user.phone || user.email}</p></div><div className="admin-access-actions"><button type="button" className={user.access?.includes("candidate") ? "active" : ""} onClick={() => void toggleAccess(user.id,"candidate",user.access)}>Candidate {user.access?.includes("candidate") ? "✓" : "+"}</button><button type="button" className={user.access?.includes("recruiter") ? "active" : ""} onClick={() => void toggleAccess(user.id,"recruiter",user.access)}>Recruiter {user.access?.includes("recruiter") ? "✓" : "+"}</button></div></article>)}</div></section>
      <section className="admin-section"><h2>All requests</h2>{data.submissions.length === 0 ? <p className="admin-empty-copy">No requests yet.</p> : <div className="admin-list">{data.submissions.map(item => <article key={item.id}><div><span>{item.type}</span><h3>{item.title}</h3><p>{item.name}{item.email ? ` · ${item.email}` : ""}</p></div><p>{item.message || item.category || item.rating || "—"}</p><time>{new Date(item.created_at).toLocaleString()}</time></article>)}</div>}</section>
      <section className="admin-section"><h2>Comments</h2>{data.comments.length === 0 ? <p className="admin-empty-copy">No comments yet.</p> : <div className="admin-list">{data.comments.map(item => <article key={`${item.content_id}-${item.id}`}><div><span>{item.content_id}</span><h3>{item.author}</h3></div><p>{item.message}</p><time>{new Date(item.created_at).toLocaleString()}</time></article>)}</div>}</section>
      <section className="admin-section"><h2>Likes</h2>{data.likes.length === 0 ? <p className="admin-empty-copy">No likes yet.</p> : <div className="admin-list">{data.likes.map(item => <article key={item.content_id}><div><span>{item.content_id}</span><h3>{item.count} likes</h3></div><p>{item.people.join(", ")}</p></article>)}</div>}</section>
    </section>
  </main>;
}
