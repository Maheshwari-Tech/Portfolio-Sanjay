"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch, authHeaders, isLoggedIn } from "./apiClient";
import { submissionSourceWebsite } from "./submissionService";

export default function ProjectDemoRequest({ projectId, projectName }: { projectId: string; projectName: string }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const syncWithHash = () => { if (window.location.hash === "#request-demo") setOpen(true); };
    syncWithHash();
    window.addEventListener("hashchange", syncWithHash);
    return () => window.removeEventListener("hashchange", syncWithHash);
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isLoggedIn()) {
      window.location.href = `/login?next=${encodeURIComponent(`/projects/${projectId}#request-demo`)}`;
      return;
    }
    setBusy(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await apiFetch("/submissions", { method: "POST", headers: authHeaders(), body: JSON.stringify({ type: "demo", source_website: submissionSourceWebsite(), title: `Demo request — ${projectName}`, project_id: projectId, name: form.get("name"), email: form.get("email"), message: form.get("message") }) });
      setStatus(response.ok ? "Request received. Sanjay will get back to you." : "The request was not accepted. Please sign in again and retry.");
    } catch { setStatus("The request service is offline. Your request was not submitted."); }
    finally { setBusy(false); }
  }

  return <section className="demo-request" id="request-demo">
    <div><p className="eyebrow">REQUEST A DEMO</p><h2>Want to see {projectName} in context?</h2><p>Share what you would like to explore.</p></div>
    <button className="button button-dark" onClick={() => setOpen(!open)}>{open ? "Close form" : "Request demo"}</button>
    {open && <form onSubmit={submit}><label>Name<input name="name" required /></label><label>Work email<input name="email" type="email" required /></label><label>Context<textarea name="message" required rows={4} /></label><button disabled={busy} className="button button-dark">{busy ? "Submitting…" : "Submit request"}</button>{!isLoggedIn() && <p>Demo requests require <Link href={`/login?next=${encodeURIComponent(`/projects/${projectId}#request-demo`)}`}>sign in</Link>.</p>}{status && <p className="form-status">{status}</p>}</form>}
  </section>;
}
