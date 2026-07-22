"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch, ApiUnavailableError, authHeaders } from "../apiClient";
import Wordmark from "../Wordmark";

type Stage = "wishlist" | "researching" | "ready" | "applied" | "recruiter" | "screening" | "interviewing" | "offer" | "rejected" | "paused";
type Priority = "dream" | "high" | "target" | "watch";
type Company = {
  id: number;
  company: string;
  target_role: string;
  priority: Priority;
  status: Stage;
  last_applied?: string | null;
  next_action?: string | null;
  next_action_date?: string | null;
  rounds_information?: string | null;
  company_values?: string | null;
  contacts?: string | null;
  job_url?: string | null;
  notes?: string | null;
  updated_at: string;
};

const stages: Array<[Stage, string]> = [
  ["wishlist", "Wish list"], ["researching", "Researching"], ["ready", "Ready to apply"],
  ["applied", "Applied"], ["recruiter", "Recruiter connect"], ["screening", "Screening"],
  ["interviewing", "Interviewing"], ["offer", "Offer"], ["rejected", "Closed"], ["paused", "Paused"],
];
const priorities: Array<[Priority, string]> = [["dream", "Dream"], ["high", "High"], ["target", "Target"], ["watch", "Watch"]];

const emptyCompany = (): Omit<Company, "id" | "updated_at"> => ({
  company: "", target_role: "Senior Software Engineer / Tech Lead", priority: "target", status: "wishlist",
  last_applied: "", next_action: "", next_action_date: "", rounds_information: "", company_values: "", contacts: "", job_url: "", notes: "",
});

function safeUserName() {
  if (typeof window === "undefined") return "Sanjay";
  try { return JSON.parse(localStorage.getItem("sanjay_portfolio_user") || "{}").name || "Sanjay"; } catch { return "Sanjay"; }
}

export default function InterviewTrackerPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "denied" | "offline">("loading");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [editing, setEditing] = useState<Company | null>(null);
  const [adding, setAdding] = useState(false);
  const [newCompany, setNewCompany] = useState(emptyCompany());
  const [saving, setSaving] = useState(false);
  const userName = safeUserName();

  const loadCompanies = useCallback(async (initial = false) => {
    if (initial) setState("loading");
    setMessage("");
    try {
      const response = await apiFetch("/admin/interview-tracker", { headers: authHeaders() });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        setState("denied");
        setMessage(body.detail || "Admin authentication is required.");
        return;
      }
      setCompanies(body.items || []);
      setState("ready");
    } catch (error) {
      setState(error instanceof ApiUnavailableError ? "offline" : "denied");
      setMessage(error instanceof ApiUnavailableError ? "The private API is unavailable. Tracker data cannot be displayed or changed." : "Admin access could not be verified.");
    }
  }, []);

  useEffect(() => { void loadCompanies(true); }, [loadCompanies]);

  const visibleCompanies = useMemo(() => companies.filter((item) => {
    const haystack = `${item.company} ${item.target_role} ${item.contacts || ""} ${item.notes || ""} ${item.rounds_information || ""}`.toLowerCase();
    return (!search || haystack.includes(search.toLowerCase())) &&
      (stageFilter === "all" || item.status === stageFilter) &&
      (priorityFilter === "all" || item.priority === priorityFilter);
  }), [companies, priorityFilter, search, stageFilter]);

  const activeCount = companies.filter(item => ["applied", "recruiter", "screening", "interviewing"].includes(item.status)).length;
  const interviewCount = companies.filter(item => item.status === "interviewing").length;
  const nextActions = companies.filter(item => item.next_action_date && item.status !== "rejected").length;

  async function updateCompany(id: number, changes: Partial<Company>) {
    const response = await apiFetch(`/admin/interview-tracker/${id}`, { method: "PATCH", headers: authHeaders(), body: JSON.stringify(changes) });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.detail || "The company could not be updated.");
    setCompanies(current => current.map(item => item.id === id ? body : item));
    return body as Company;
  }

  async function saveEdit(event: FormEvent) {
    event.preventDefault();
    if (!editing) return;
    setSaving(true); setMessage("");
    try { await updateCompany(editing.id, editing); setEditing(null); }
    catch (error) { setMessage(error instanceof Error ? error.message : "The company could not be updated."); }
    finally { setSaving(false); }
  }

  async function createCompany(event: FormEvent) {
    event.preventDefault();
    setSaving(true); setMessage("");
    try {
      const response = await apiFetch("/admin/interview-tracker", { method: "POST", headers: authHeaders(), body: JSON.stringify(newCompany) });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.detail || "The company could not be added.");
      setCompanies(current => [...current, body]); setNewCompany(emptyCompany()); setAdding(false);
    } catch (error) { setMessage(error instanceof Error ? error.message : "The company could not be added."); }
    finally { setSaving(false); }
  }

  async function deleteCompany(item: Company) {
    if (!window.confirm(`Remove ${item.company} from the tracker?`)) return;
    const response = await apiFetch(`/admin/interview-tracker/${item.id}`, { method: "DELETE", headers: authHeaders() });
    if (response.ok) { setCompanies(current => current.filter(company => company.id !== item.id)); setEditing(null); }
    else setMessage("The company could not be removed.");
  }

  if (state !== "ready") return <main className="tracker-page">
    <header className="admin-topbar"><Wordmark/><nav><Link href="/admin">Admin portal</Link><Link href="/">Public website</Link></nav><span>{userName}</span></header>
    <section className="admin-empty"><p className="eyebrow">PRIVATE · ADMIN ONLY</p><h1>{state === "loading" ? "Opening your tracker…" : state === "offline" ? "Tracker service unavailable." : "Admin access only."}</h1><p>{message}</p>{state === "offline" ? <button className="button button-dark" onClick={() => void loadCompanies(true)}>Retry connection</button> : state === "denied" ? <Link className="button button-dark" href="/admin/login?next=/interview-tracker">Admin login</Link> : null}</section>
  </main>;

  return <main className="tracker-page">
    <header className="admin-topbar"><Wordmark/><nav><Link href="/admin">Admin portal</Link><a href="#companies">Companies</a><a href="#actions">Next actions</a></nav><span>{userName}</span></header>
    <section className="tracker-shell">
      <header className="tracker-hero">
        <div><p className="eyebrow">PRIVATE CAREER WORKSPACE</p><h1>Top companies.<br/><em>One clear pipeline.</em></h1><p>Track applications, interview loops, people, values, preparation notes, and the next move for every target company.</p></div>
        <button className="tracker-add" onClick={() => setAdding(true)}><span>＋</span>Add company</button>
      </header>

      <section className="tracker-summary" aria-label="Application summary">
        <article><span>Target list</span><strong>{companies.length}</strong><small>companies</small></article>
        <article><span>Active pipeline</span><strong>{activeCount}</strong><small>in progress</small></article>
        <article><span>Interviewing</span><strong>{interviewCount}</strong><small>live loops</small></article>
        <article><span>Dated actions</span><strong>{nextActions}</strong><small>scheduled</small></article>
      </section>

      {message && <div className="tracker-alert">{message}<button onClick={() => setMessage("")}>×</button></div>}

      <section className="tracker-workspace" id="companies">
        <div className="tracker-heading"><div><p className="eyebrow">APPLICATION SHEET</p><h2>Company tracker</h2></div><span>{visibleCompanies.length} of {companies.length}</span></div>
        <div className="tracker-filters">
          <label className="tracker-search">Search<input value={search} onChange={event => setSearch(event.target.value)} placeholder="Company, contact, role or note…"/></label>
          <label>Stage<select value={stageFilter} onChange={event => setStageFilter(event.target.value)}><option value="all">All stages</option>{stages.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
          <label>Priority<select value={priorityFilter} onChange={event => setPriorityFilter(event.target.value)}><option value="all">All priorities</option>{priorities.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
          {(search || stageFilter !== "all" || priorityFilter !== "all") && <button className="tracker-clear" onClick={() => { setSearch(""); setStageFilter("all"); setPriorityFilter("all"); }}>Clear filters</button>}
        </div>

        <div className="tracker-table-wrap">
          <table className="tracker-table">
            <thead><tr><th># / Company</th><th>Priority</th><th>Status</th><th>Target role</th><th>Last applied</th><th>Next action</th><th>Contact</th><th aria-label="Actions"/></tr></thead>
            <tbody>{visibleCompanies.map((item) => <tr key={item.id} onDoubleClick={() => setEditing({...item})}>
              <td><span className="tracker-rank">{String(companies.indexOf(item) + 1).padStart(2, "0")}</span><strong>{item.company}</strong></td>
              <td><span className={`tracker-priority ${item.priority}`}>{item.priority}</span></td>
              <td><select className={`tracker-stage ${item.status}`} value={item.status} aria-label={`${item.company} status`} onChange={event => void updateCompany(item.id, {status: event.target.value as Stage}).catch(error => setMessage(error.message))}>{stages.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></td>
              <td>{item.target_role || <span className="tracker-muted">Add role</span>}</td>
              <td>{item.last_applied || <span className="tracker-muted">Not applied</span>}</td>
              <td><strong className="tracker-action-copy">{item.next_action || "Define next move"}</strong>{item.next_action_date && <small>{item.next_action_date}</small>}</td>
              <td>{item.contacts || <span className="tracker-muted">Add contact</span>}</td>
              <td><button className="tracker-open" onClick={() => setEditing({...item})}>Open →</button></td>
            </tr>)}</tbody>
          </table>
          {visibleCompanies.length === 0 && <div className="tracker-zero"><strong>No companies found.</strong><p>Try clearing a filter or add another target company.</p></div>}
        </div>
      </section>

      <section className="tracker-next-actions" id="actions"><div className="tracker-heading"><div><p className="eyebrow">FOCUS QUEUE</p><h2>What needs attention</h2></div></div><div>{companies.filter(item => item.next_action).slice(0, 6).map(item => <button key={item.id} onClick={() => setEditing({...item})}><span>{item.company}</span><strong>{item.next_action}</strong><small>{item.next_action_date || "No due date"} →</small></button>)}</div></section>
    </section>

    {(editing || adding) && <div className="tracker-overlay" role="presentation" onMouseDown={event => { if (event.currentTarget === event.target) { setEditing(null); setAdding(false); } }}>
      <section className="tracker-editor" role="dialog" aria-modal="true" aria-label={adding ? "Add company" : `Edit ${editing?.company}`}>
        <header><div><p className="eyebrow">{adding ? "NEW TARGET" : "COMPANY DOSSIER"}</p><h2>{adding ? "Add a company" : editing?.company}</h2></div><button aria-label="Close" onClick={() => { setEditing(null); setAdding(false); }}>×</button></header>
        {adding ? <CompanyForm value={newCompany} onChange={setNewCompany} onSubmit={createCompany} saving={saving}/>: editing && <CompanyForm value={editing} onChange={value => setEditing(value as Company)} onSubmit={saveEdit} saving={saving} onDelete={() => void deleteCompany(editing)}/>} 
      </section>
    </div>}
  </main>;
}

function CompanyForm({value, onChange, onSubmit, saving, onDelete}: {value: Omit<Company, "id" | "updated_at"> | Company; onChange: (value: any) => void; onSubmit: (event: FormEvent) => void; saving: boolean; onDelete?: () => void}) {
  const field = (name: keyof Company, next: string) => onChange({...value, [name]: next});
  return <form className="tracker-form" onSubmit={onSubmit}>
    <div className="tracker-form-grid">
      <label>Company<input required minLength={2} value={value.company} onChange={event => field("company", event.target.value)}/></label>
      <label>Target role<input value={value.target_role || ""} onChange={event => field("target_role", event.target.value)}/></label>
      <label>Priority<select value={value.priority} onChange={event => field("priority", event.target.value)}>{priorities.map(([key, label]) => <option value={key} key={key}>{label}</option>)}</select></label>
      <label>Status<select value={value.status} onChange={event => field("status", event.target.value)}>{stages.map(([key, label]) => <option value={key} key={key}>{label}</option>)}</select></label>
      <label>Last applied<input type="date" value={value.last_applied || ""} onChange={event => field("last_applied", event.target.value)}/></label>
      <label>Next action date<input type="date" value={value.next_action_date || ""} onChange={event => field("next_action_date", event.target.value)}/></label>
      <label className="wide">Next action<input value={value.next_action || ""} onChange={event => field("next_action", event.target.value)} placeholder="Apply, ask for referral, prepare design round…"/></label>
      <label className="wide">Contacts<textarea value={value.contacts || ""} onChange={event => field("contacts", event.target.value)} placeholder="Name · role · email/LinkedIn · relationship"/></label>
      <label className="wide">Interview rounds & format<textarea value={value.rounds_information || ""} onChange={event => field("rounds_information", event.target.value)} placeholder="Recruiter → coding → system design → behavioural → hiring manager…"/></label>
      <label className="wide">Company values & culture signals<textarea value={value.company_values || ""} onChange={event => field("company_values", event.target.value)} placeholder="Values to map to stories, leadership principles, product philosophy…"/></label>
      <label className="wide">Role / job link<input type="url" value={value.job_url || ""} onChange={event => field("job_url", event.target.value)} placeholder="https://…"/></label>
      <label className="wide">Preparation notes<textarea className="tracker-notes" value={value.notes || ""} onChange={event => field("notes", event.target.value)} placeholder="Role fit, likely questions, story bank, gaps, compensation notes…"/></label>
    </div>
    <footer>{onDelete && <button type="button" className="tracker-delete" onClick={onDelete}>Remove company</button>}<button type="submit" className="tracker-save" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button></footer>
  </form>;
}
