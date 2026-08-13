"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch, ApiUnavailableError, authHeaders } from "../apiClient";
import Wordmark from "../Wordmark";
import QuestionBank from "./QuestionBank";

type Stage = "wishlist" | "researching" | "ready" | "applied" | "recruiter" | "screening" | "scheduled" | "interviewing" | "offer" | "rejected" | "paused";
type Priority = "dream" | "high" | "target" | "watch";
type SortKey = "company" | "priority" | "status" | "target_role" | "last_applied" | "next_action" | "contacts" | "updated_at";
type SortDirection = "asc" | "desc";
type AuthenticatedUser = { id: string | number; name?: string; role?: string };
type LeetCodeBrowserPayload = {
  username: string;
  sync_scope?: "company";
  company_name?: string;
  requested_question_slugs?: string[];
  question_statuses: Record<string, "solved" | "attempted" | "not_started">;
  question_statuses_complete?: boolean;
  recent_submissions: Array<{id: string; title: string; title_slug: string; timestamp: number; status: string; language: string}>;
  solved_counts: Array<{difficulty: string; count: number; submissions: number}>;
};
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
  ["scheduled", "Interview scheduled"], ["interviewing", "Interviewing"], ["offer", "Offer"], ["rejected", "Closed"], ["paused", "Paused"],
];
const priorities: Array<[Priority, string]> = [["dream", "Dream"], ["high", "High"], ["target", "Target"], ["watch", "Watch"]];
const activeStages = stages.filter(([value]) => value !== "rejected");
const stageOrder = new Map(stages.map(([value], index) => [value, index]));
const priorityOrder = new Map(priorities.map(([value], index) => [value, index]));

const emptyCompany = (): Omit<Company, "id" | "updated_at"> => ({
  company: "", target_role: "Senior Software Engineer / Tech Lead", priority: "target", status: "wishlist",
  last_applied: "", next_action: "", next_action_date: "", rounds_information: "", company_values: "", contacts: "", job_url: "", notes: "",
});

function companyWritePayload(value: Company) {
  return {
    company: value.company,
    target_role: value.target_role,
    priority: value.priority,
    status: value.status,
    last_applied: value.last_applied || null,
    next_action: value.next_action || null,
    next_action_date: value.next_action_date || null,
    rounds_information: value.rounds_information || null,
    company_values: value.company_values || null,
    contacts: value.contacts || null,
    job_url: value.job_url || null,
    notes: value.notes || null,
  };
}

function safeUserName() {
  if (typeof window === "undefined") return "Sanjay";
  try { return JSON.parse(localStorage.getItem("sanjay_portfolio_user") || "{}").name || "Sanjay"; } catch { return "Sanjay"; }
}

function encodeConnection(value: object) {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  let binary = "";
  bytes.forEach(byte => { binary += String.fromCharCode(byte); });
  return window.btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function companySlug(value: string) {
  return value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function InterviewTracker({initialCompanySlug}: {initialCompanySlug?: string}) {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "offline">("loading");
  const [canManage, setCanManage] = useState(false);
  const [isAdminWorkspace, setIsAdminWorkspace] = useState(false);
  const [workspaceUserName, setWorkspaceUserName] = useState("Candidate");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("active");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("status");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [editing, setEditing] = useState<Company | null>(null);
  const [adding, setAdding] = useState(false);
  const [newCompany, setNewCompany] = useState(emptyCompany());
  const [saving, setSaving] = useState(false);
  const [leetcodePairingToken, setLeetcodePairingToken] = useState<string | null>(null);
  const [leetcodeSyncState, setLeetcodeSyncState] = useState<"idle" | "opening" | "waiting" | "saving" | "done" | "error">("idle");
  const [leetcodeSyncMessage, setLeetcodeSyncMessage] = useState("");
  const [showLeetcodeSetup, setShowLeetcodeSetup] = useState(false);
  const userName = workspaceUserName || safeUserName();
  const trackerApiRoot = isAdminWorkspace ? "/admin/interview-tracker" : "/member/interview-tracker";

  const loadCompanies = useCallback(async (initial = false) => {
    if (initial) setState("loading");
    setMessage("");
    try {
      const token = localStorage.getItem("sanjay_portfolio_token");
      if (!token) {
        const requestedPath = `${window.location.pathname}${window.location.search}`;
        window.location.replace(`/login?next=${encodeURIComponent(requestedPath)}`);
        return;
      }

      const identityResponse = await apiFetch("/auth/me", {headers: authHeaders()});
      const identity = await identityResponse.json().catch(() => ({})) as AuthenticatedUser & {detail?: string};
      if (!identityResponse.ok) {
        if (identityResponse.status === 401) {
          localStorage.removeItem("sanjay_portfolio_token");
          const requestedPath = `${window.location.pathname}${window.location.search}`;
          window.location.replace(`/login?next=${encodeURIComponent(requestedPath)}`);
          return;
        }
        setState("offline");
        setMessage(identity.detail || "Your account could not be verified.");
        return;
      }

      setWorkspaceUserName(identity.name || safeUserName());
      let loadedCompanies: Company[] = [];
      if (identity.role === "admin") {
        const response = await apiFetch("/admin/interview-tracker", {headers: authHeaders()});
        const body = await response.json().catch(() => ({}));
        if (!response.ok) {
          setState("offline");
          setMessage(body.detail || "The tracker could not be loaded.");
          return;
        }
        loadedCompanies = (body.items || []) as Company[];
        setIsAdminWorkspace(true);
      } else {
        const storageKey = `portfolio_interview_tracker:${identity.id}`;
        const stored = localStorage.getItem(storageKey);
        const response = await apiFetch("/member/interview-tracker", {headers: authHeaders()});
        const body = await response.json().catch(() => ({}));
        if (!response.ok) {
          setState("offline");
          setMessage(body.detail || "Your tracker could not be loaded.");
          return;
        }
        loadedCompanies = (body.items || []) as Company[];
        const legacyCompanies = stored ? JSON.parse(stored) as Company[] : [];
        if (loadedCompanies.length === 0 && legacyCompanies.length > 0) {
          const migrated: Company[] = [];
          for (const legacy of legacyCompanies) {
            const migrationResponse = await apiFetch("/member/interview-tracker", {method: "POST", headers: authHeaders(), body: JSON.stringify(companyWritePayload(legacy))});
            const migratedCompany = await migrationResponse.json().catch(() => ({}));
            if (!migrationResponse.ok) throw new Error(migratedCompany.detail || "Your existing tracker could not be moved to your account.");
            migrated.push(migratedCompany as Company);
          }
          loadedCompanies = migrated;
          localStorage.removeItem(storageKey);
        }
        setIsAdminWorkspace(false);
      }
      setCompanies(loadedCompanies);
      if (initialCompanySlug) {
        const selected = loadedCompanies.find(item => companySlug(item.company) === initialCompanySlug.toLowerCase());
        if (selected) setEditing({...selected});
        else setMessage("That company is not available in the interview tracker.");
      }
      setCanManage(true);
      setState("ready");
      if (new URLSearchParams(window.location.search).get("intent") === "add") setAdding(true);
    } catch (error) {
      setState("offline");
      setMessage(error instanceof ApiUnavailableError ? "The tracker service is unavailable." : "The tracker could not be loaded.");
    }
  }, [initialCompanySlug]);

  useEffect(() => {
    const task = window.setTimeout(() => { void loadCompanies(true); }, 0);
    return () => window.clearTimeout(task);
  }, [loadCompanies]);

  useEffect(() => {
    const task = window.setTimeout(() => {
      const pendingToken = localStorage.getItem("portfolio_leetcode_pairing_token");
      if (pendingToken) setLeetcodePairingToken(pendingToken);
    }, 0);
    return () => window.clearTimeout(task);
  }, []);

  useEffect(() => {
    if (!leetcodePairingToken) return;
    async function receiveLeetCodeProgress(event: MessageEvent) {
      if (event.origin !== "https://leetcode.com" && event.origin !== window.location.origin) return;
      const message = event.data as { type?: string; token?: string; payload?: LeetCodeBrowserPayload };
      if (message.type !== "portfolio-leetcode-sync" || message.token !== leetcodePairingToken || !message.payload) return;
      setLeetcodeSyncState("saving");
      setLeetcodeSyncMessage("Saving your LeetCode progress in this browser…");
      try {
        const syncedAt = new Date().toISOString();
        const previous = JSON.parse(localStorage.getItem("portfolio_leetcode_activity") || "null") as (LeetCodeBrowserPayload & {username?: string}) | null;
        const previousStatuses = previous?.username === message.payload.username && previous.sync_scope === "company" ? previous.question_statuses || {} : {};
        const activity = {
          ...message.payload,
          question_statuses: {...previousStatuses, ...message.payload.question_statuses},
          profile_url: `https://leetcode.com/u/${message.payload.username}/`,
          question_progress: {},
          recent_accepted_question_slugs: Object.entries(message.payload.question_statuses).filter(([, status]) => status === "solved").map(([slug]) => slug),
          session_state: "browser_synced",
          coverage: "browser_authenticated_sync",
          coverage_note: message.payload.question_statuses_complete
            ? `All ${message.payload.requested_question_slugs?.length || Object.keys(message.payload.question_statuses).length} ${message.payload.company_name || "company"} question statuses were synchronized.`
            : `LeetCode returned only ${Object.keys(message.payload.question_statuses).length} of ${message.payload.requested_question_slugs?.length || "the requested"} ${message.payload.company_name || "company"} statuses.`,
          synced_at: syncedAt,
        };
        localStorage.setItem("portfolio_leetcode_activity", JSON.stringify(activity));
        setLeetcodeSyncState("done");
        setLeetcodeSyncMessage(`${Object.keys(message.payload.question_statuses).length} ${message.payload.company_name || "company"} question statuses synced for ${message.payload.username}.`);
        setLeetcodePairingToken(null);
        localStorage.removeItem("portfolio_leetcode_pairing_token");
        window.dispatchEvent(new Event("leetcode-progress-synced"));
        (event.source as Window | null)?.postMessage({type: "portfolio-leetcode-sync-ack", token: message.token}, event.origin);
      } catch (error) {
        const detail = error instanceof Error ? error.message : "LeetCode progress could not be saved.";
        setLeetcodeSyncState("error");
        setLeetcodeSyncMessage(detail);
        (event.source as Window | null)?.postMessage({type: "portfolio-leetcode-sync-error", token: message.token, detail}, event.origin);
      }
    }
    window.addEventListener("message", receiveLeetCodeProgress);
    return () => window.removeEventListener("message", receiveLeetCodeProgress);
  }, [leetcodePairingToken]);

  async function connectLeetCode(questionSlugs: string[], companyName: string) {
    setLeetcodeSyncState("opening");
    setLeetcodeSyncMessage("Opening your signed-in LeetCode browser session…");
    try {
      if (questionSlugs.length === 0) throw new Error(`No ${companyName} questions are available to synchronize.`);
      if (document.documentElement.getAttribute("data-portfolio-leetcode-helper") !== "ready") {
        setShowLeetcodeSetup(true);
        throw new Error("The browser helper is not active. Follow the install steps, reload this tracker tab, and try again.");
      }
      const helperCapabilities = new Set((document.documentElement.getAttribute("data-portfolio-leetcode-helper-capabilities") || "").split(/\s+/).filter(Boolean));
      if (!helperCapabilities.has("company-question-sync") || !helperCapabilities.has("cross-tab-ack")) {
        setShowLeetcodeSetup(true);
        throw new Error("The installed browser helper is outdated. Replace it with the latest helper, reload this tracker tab, and try again.");
      }
      const token = `${crypto.randomUUID()}${crypto.randomUUID()}`;
      setLeetcodePairingToken(token);
      localStorage.setItem("portfolio_leetcode_pairing_token", token);
      const connection = encodeConnection({token, callbackOrigin: window.location.origin, companyName, questionSlugs});
      const popup = window.open(`https://leetcode.com/problemset/#portfolio-sync=${connection}`, "portfolio-leetcode-sync", "popup,width=1180,height=820");
      if (!popup) throw new Error("Allow pop-ups for this site, then try again.");
      setLeetcodeSyncState("waiting");
      setLeetcodeSyncMessage(`Checking ${questionSlugs.length} ${companyName} questions in your signed-in LeetCode account…`);
      popup.focus();
    } catch (error) {
      setLeetcodePairingToken(null);
      localStorage.removeItem("portfolio_leetcode_pairing_token");
      setLeetcodeSyncState("error");
      setLeetcodeSyncMessage(error instanceof Error ? error.message : "The LeetCode connection could not be created.");
    }
  }

  function downloadLatestLeetCodeHelper() {
    const link = document.createElement("a");
    link.href = `/leetcode-sync-extension.zip?download=${Date.now()}`;
    link.download = "portfolio-leetcode-sync.zip";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  const visibleCompanies = useMemo(() => companies.filter((item) => {
    const haystack = `${item.company} ${item.target_role} ${item.contacts || ""} ${item.notes || ""} ${item.rounds_information || ""}`.toLowerCase();
    return (!search || haystack.includes(search.toLowerCase())) &&
      (stageFilter === "all" || (stageFilter === "active" ? item.status !== "rejected" : item.status === stageFilter)) &&
      (priorityFilter === "all" || item.priority === priorityFilter);
  }).sort((left, right) => {
    let comparison = 0;
    if (sortKey === "status") comparison = (stageOrder.get(left.status) ?? 99) - (stageOrder.get(right.status) ?? 99);
    else if (sortKey === "priority") comparison = (priorityOrder.get(left.priority) ?? 99) - (priorityOrder.get(right.priority) ?? 99);
    else if (sortKey === "updated_at" || sortKey === "last_applied") comparison = new Date(left[sortKey] || 0).getTime() - new Date(right[sortKey] || 0).getTime();
    else comparison = String(left[sortKey] || "").localeCompare(String(right[sortKey] || ""), undefined, {sensitivity: "base"});
    if (comparison === 0) comparison = left.company.localeCompare(right.company);
    return sortDirection === "asc" ? comparison : -comparison;
  }), [companies, priorityFilter, search, sortDirection, sortKey, stageFilter]);

  function toggleSort(nextKey: SortKey) {
    if (sortKey === nextKey) {
      setSortDirection(current => current === "asc" ? "desc" : "asc");
      return;
    }
    setSortKey(nextKey);
    setSortDirection(nextKey === "updated_at" || nextKey === "last_applied" ? "desc" : "asc");
  }

  const sortHeader = (key: SortKey, label: string) => <th aria-sort={sortKey === key ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}><button className="tracker-sort-header" onClick={() => toggleSort(key)}>{label}<span aria-hidden="true">{sortKey === key ? (sortDirection === "asc" ? "↑" : "↓") : "↕"}</span></button></th>;

  const activeCount = companies.filter(item => ["applied", "recruiter", "screening", "scheduled", "interviewing"].includes(item.status)).length;
  const interviewCount = companies.filter(item => ["scheduled", "interviewing"].includes(item.status)).length;
  const nextActions = companies.filter(item => item.next_action_date && item.status !== "rejected").length;

  async function updateCompany(id: number, changes: Partial<Company>) {
    const response = await apiFetch(`${trackerApiRoot}/${id}`, { method: "PATCH", headers: authHeaders(), body: JSON.stringify(changes) });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.detail || "The company could not be updated.");
    setCompanies(current => current.map(item => item.id === id ? body : item));
    return body as Company;
  }

  async function saveEdit(event: FormEvent) {
    event.preventDefault();
    if (!editing) return;
    setSaving(true); setMessage("");
    try { await updateCompany(editing.id, editing); closeEditor(); }
    catch (error) { setMessage(error instanceof Error ? error.message : "The company could not be updated."); }
    finally { setSaving(false); }
  }

  async function createCompany(event: FormEvent) {
    event.preventDefault();
    setSaving(true); setMessage("");
    try {
      const response = await apiFetch(trackerApiRoot, { method: "POST", headers: authHeaders(), body: JSON.stringify(newCompany) });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.detail || "The company could not be added.");
      setCompanies(current => [...current, body]); setNewCompany(emptyCompany()); setAdding(false);
    } catch (error) { setMessage(error instanceof Error ? error.message : "The company could not be added."); }
    finally { setSaving(false); }
  }

  async function deleteCompany(item: Company) {
    if (!window.confirm(`Remove ${item.company} from the tracker?`)) return;
    const response = await apiFetch(`${trackerApiRoot}/${item.id}`, { method: "DELETE", headers: authHeaders() });
    if (response.ok) { setCompanies(current => current.filter(company => company.id !== item.id)); closeEditor(); }
    else setMessage("The company could not be removed.");
  }

  function openCompany(item: Company) {
    router.push(`/interview-tracker/company/${companySlug(item.company)}`, {scroll: false});
  }

  function closeEditor() {
    setEditing(null);
    setAdding(false);
    if (initialCompanySlug) router.push("/interview-tracker/workspace", {scroll: false});
  }

  const leetcodeSetupDialog = showLeetcodeSetup && <div className="leetcode-setup-overlay" role="presentation" onMouseDown={event => { if (event.currentTarget === event.target) setShowLeetcodeSetup(false); }}>
    <section className="leetcode-setup" role="dialog" aria-modal="true" aria-labelledby="leetcode-setup-title">
      <header><div><p className="eyebrow">ONE-TIME SETUP</p><h2 id="leetcode-setup-title">Connect your browser to LeetCode</h2></div><button aria-label="Close setup" onClick={() => setShowLeetcodeSetup(false)}>×</button></header>
      <p>Always replace an older helper with the latest download. The ZIP does not install when downloaded—unzip it first, then load that folder as an extension.</p>
      <ol>
        <li><button className="button button-dark" onClick={downloadLatestLeetCodeHelper}>1. Download latest helper</button><span>Open your Downloads folder and unzip the newly downloaded package.</span></li>
        <li><strong>2. Open extensions</strong><span>Chrome: <code>chrome://extensions</code> · Edge: <code>edge://extensions</code> · Firefox: <code>about:debugging#/runtime/this-firefox</code></span></li>
        <li><strong>3. Replace the old helper</strong><span>Remove the existing Portfolio LeetCode Sync extension first. Then choose “Load unpacked” and select the newly downloaded folder. Firefox: choose “Load Temporary Add-on” and select its <code>manifest.json</code>.</span></li>
        <li><strong>4. Reload this tracker tab</strong><span>The helper cannot activate in a tab that was already open when it was installed.</span></li>
      </ol>
      <div className="leetcode-setup-actions"><button className="button button-dark" onClick={() => window.location.reload()}>Reload tracker</button><button className="button" onClick={() => setShowLeetcodeSetup(false)}>Close setup</button></div>
      <small>The helper reads only progress from the LeetCode account signed in within this browser. It never sends your LeetCode cookies to this site.</small>
    </section>
  </div>;

  if (state !== "ready") return <main className="tracker-page">
    <header className="admin-topbar"><Wordmark/><nav><Link href="/interview-tracker">Preparation home</Link></nav></header>
    <section className="admin-empty"><p className="eyebrow">PRIVATE PREPARATION WORKSPACE</p><h1>{state === "loading" ? "Opening your workspace…" : "Workspace unavailable."}</h1><p>{message}</p>{state === "offline" && <button className="button button-dark" onClick={() => void loadCompanies(true)}>Retry connection</button>}</section>
  </main>;

  if (initialCompanySlug) {
    if (!editing) return <main className="tracker-page">
      <header className="admin-topbar"><Wordmark/><nav><Link href="/interview-tracker/workspace">← All companies</Link></nav><span>{userName}</span></header>
      <section className="admin-empty"><p className="eyebrow">COMPANY PREPARATION</p><h1>Company not found.</h1><p>{message || "This company is not part of your tracker."}</p><Link className="button button-dark" href="/interview-tracker/workspace">Return to the tracker</Link></section>
    </main>;

    return <main className="tracker-page company-tracker-page">
      <header className="admin-topbar"><Wordmark/><nav><Link href="/interview-tracker/workspace">← All companies</Link>{isAdminWorkspace && <Link href="/admin">Admin portal</Link>}</nav><span>{userName}</span></header>
      <section className="company-tracker-shell">
        <header className="company-tracker-heading">
          <div><p className="eyebrow">COMPANY PREPARATION</p><h1>{editing.company}</h1><p>{editing.target_role}</p></div>
          <div className="company-tracker-heading-actions"><span className={`tracker-stage tracker-stage-readonly ${editing.status}`}>{stages.find(([value]) => value === editing.status)?.[1] || editing.status}</span><button className="tracker-delete" onClick={() => void deleteCompany(editing)}>Remove company</button></div>
        </header>

        {leetcodeSyncMessage && <div className={`tracker-sync-status ${leetcodeSyncState}`} role="status"><strong>{leetcodeSyncState === "done" ? "LeetCode connected" : leetcodeSyncState === "error" ? "Connection needs attention" : "LeetCode connection"}</strong><span>{leetcodeSyncMessage}</span>{leetcodeSyncState === "error" && <button onClick={() => { setLeetcodeSyncState("idle"); setLeetcodeSyncMessage(""); }}>Dismiss</button>}</div>}

        <QuestionBank company={editing.company} onRefresh={(questionSlugs, companyName) => void connectLeetCode(questionSlugs, companyName)}/>

        <section className="company-tracker-details">
          <div className="tracker-heading"><div><p className="eyebrow">COMPANY DETAILS</p><h2>Application and preparation notes</h2></div></div>
          <CompanyForm value={editing} onChange={value => setEditing(value as Company)} onSubmit={saveEdit} saving={saving}/>
        </section>
        {message && <div className="tracker-alert">{message}<button onClick={() => setMessage("")}>×</button></div>}
      </section>
      {leetcodeSetupDialog}
    </main>;
  }

  return <main className="tracker-page">
    <header className="admin-topbar"><Wordmark/><nav><Link href="/interview-tracker">Preparation home</Link>{isAdminWorkspace && <Link href="/admin">Admin portal</Link>}<a href="#companies">Companies</a><a href="#actions">Next actions</a></nav><span>{userName}</span></header>
    <section className="tracker-shell">
      <header className="tracker-hero">
        <div><p className="eyebrow">YOUR INTERVIEW PREPARATION</p><h1>Your companies.<br/><em>Your preparation plan.</em></h1><p>Add the companies you are targeting, track each application, and prepare with company-wise questions in one private workspace.</p></div>
        <div className="tracker-hero-actions"><span className="tracker-sync-hint">Open a company to synchronize only its question bank.</span><button className="tracker-extension-download" onClick={() => setShowLeetcodeSetup(true)}>Set up browser helper</button>{canManage && <button className="tracker-add" onClick={() => setAdding(true)}><span>＋</span>Add company</button>}</div>
      </header>

      {leetcodeSyncMessage && <div className={`tracker-sync-status ${leetcodeSyncState}`} role="status"><strong>{leetcodeSyncState === "done" ? "LeetCode connected" : leetcodeSyncState === "error" ? "Connection needs attention" : "LeetCode connection"}</strong><span>{leetcodeSyncMessage}</span>{leetcodeSyncState === "error" && <button onClick={() => { setLeetcodeSyncState("idle"); setLeetcodeSyncMessage(""); }}>Dismiss</button>}</div>}

      {leetcodeSetupDialog}

      <section className="tracker-summary" aria-label="Application summary">
        <article><span>Target list</span><strong>{companies.length}</strong><small>companies</small></article>
        <article><span>Active pipeline</span><strong>{activeCount}</strong><small>in progress</small></article>
        <article><span>Interviewing</span><strong>{interviewCount}</strong><small>live loops</small></article>
        <article><span>Dated actions</span><strong>{nextActions}</strong><small>scheduled</small></article>
      </section>

      <section className="tracker-lifecycle" aria-label="Interview stage lifecycle">
        <div><p className="eyebrow">ACTIVE LIFECYCLE</p><strong>Progress from target to offer</strong><small>Closed companies are excluded from this view.</small></div>
        <ol>{activeStages.map(([value, label]) => <li key={value}><button className={stageFilter === value ? "active" : ""} onClick={() => setStageFilter(value)}><span>{companies.filter(item => item.status === value).length}</span>{label}</button></li>)}</ol>
      </section>

      {message && <div className="tracker-alert">{message}<button onClick={() => setMessage("")}>×</button></div>}

      <section className="tracker-workspace" id="companies">
        <div className="tracker-heading"><div><p className="eyebrow">APPLICATION SHEET</p><h2>Company tracker</h2></div><span>{visibleCompanies.length} of {companies.length}</span></div>
        <div className="tracker-filters">
          <label className="tracker-search">Search<input value={search} onChange={event => setSearch(event.target.value)} placeholder="Company, contact, role or note…"/></label>
          <label>Stage<select value={stageFilter} onChange={event => setStageFilter(event.target.value)}><option value="active">Active · excludes closed</option><option value="all">All stages</option>{stages.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
          <label>Priority<select value={priorityFilter} onChange={event => setPriorityFilter(event.target.value)}><option value="all">All priorities</option>{priorities.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
          {(search || stageFilter !== "active" || priorityFilter !== "all" || sortKey !== "status" || sortDirection !== "asc") && <button className="tracker-clear" onClick={() => { setSearch(""); setStageFilter("active"); setPriorityFilter("all"); setSortKey("status"); setSortDirection("asc"); }}>Reset view</button>}
        </div>

        <div className="tracker-table-wrap">
          <table className="tracker-table">
            <thead><tr>{sortHeader("company", "# / Company")}{sortHeader("priority", "Priority")}{sortHeader("status", "Status")}{sortHeader("target_role", "Target role")}{canManage && <>{sortHeader("last_applied", "Last applied")}{sortHeader("next_action", "Next action")}{sortHeader("contacts", "Contact")}</>}{sortHeader("updated_at", "Last modified")}<th>Preparation</th></tr></thead>
            <tbody>{visibleCompanies.map((item) => <tr key={item.id} onDoubleClick={() => openCompany(item)}>
              <td><span className="tracker-rank">{String(companies.indexOf(item) + 1).padStart(2, "0")}</span><strong>{item.company}</strong></td>
              <td><span className={`tracker-priority ${item.priority}`}>{item.priority}</span></td>
              <td>{canManage ? <select className={`tracker-stage ${item.status}`} value={item.status} aria-label={`${item.company} status`} onChange={event => void updateCompany(item.id, {status: event.target.value as Stage}).catch(error => setMessage(error.message))}>{stages.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select> : <span className={`tracker-stage tracker-stage-readonly ${item.status}`}>{stages.find(([value]) => value === item.status)?.[1] || item.status}</span>}</td>
              <td>{item.target_role || <span className="tracker-muted">Add role</span>}</td>
              {canManage && <><td>{item.last_applied || <span className="tracker-muted">Not applied</span>}</td><td><strong className="tracker-action-copy">{item.next_action || "Define next move"}</strong>{item.next_action_date && <small>{item.next_action_date}</small>}</td><td>{item.contacts || <span className="tracker-muted">Add contact</span>}</td></>}
              <td><time dateTime={item.updated_at}>{item.updated_at ? new Date(item.updated_at).toLocaleDateString(undefined, {day: "2-digit", month: "short", year: "numeric"}) : "—"}</time></td>
              <td><div className="tracker-preparation-actions"><button className="tracker-open" onClick={() => openCompany(item)}>Questions →</button><button className="tracker-remove-row" onClick={() => void deleteCompany(item)} aria-label={`Remove ${item.company}`}>Remove</button></div></td>
            </tr>)}</tbody>
          </table>
          {visibleCompanies.length === 0 && <div className="tracker-zero"><strong>No companies found.</strong><p>Try clearing a filter or add another target company.</p></div>}
        </div>
      </section>

      {canManage && <section className="tracker-next-actions" id="actions"><div className="tracker-heading"><div><p className="eyebrow">FOCUS QUEUE</p><h2>What needs attention</h2></div></div><div>{companies.filter(item => item.next_action).slice(0, 6).map(item => <button key={item.id} onClick={() => openCompany(item)}><span>{item.company}</span><strong>{item.next_action}</strong><small>{item.next_action_date || "No due date"} →</small></button>)}</div></section>}
    </section>

    {(editing || adding) && <div className="tracker-overlay" role="presentation" onMouseDown={event => { if (event.currentTarget === event.target) closeEditor(); }}>
      <section className="tracker-editor" role="dialog" aria-modal="true" aria-label={adding ? "Add company" : `Edit ${editing?.company}`}>
        <header><div><p className="eyebrow">{adding ? "NEW TARGET" : canManage ? "COMPANY DOSSIER" : "INTERVIEW PREPARATION"}</p><h2>{adding ? "Add a company" : editing?.company}</h2></div><button aria-label="Close" onClick={closeEditor}>×</button></header>
        {canManage && (adding ? <CompanyForm value={newCompany} onChange={setNewCompany} onSubmit={createCompany} saving={saving}/>: editing && <CompanyForm value={editing} onChange={value => setEditing(value as Company)} onSubmit={saveEdit} saving={saving} onDelete={() => void deleteCompany(editing)}/>)}
      </section>
    </div>}
  </main>;
}

const interviewPrepPaths = [
  {number: "01", title: "Prepare company-wise questions", copy: "Open a company and focus on the questions most relevant to its interview process.", href: "/interview-tracker/workspace"},
  {number: "02", title: "Add companies", copy: "Build a private target list and keep applications, next actions, and preparation together.", href: "/interview-tracker/workspace?intent=add"},
  {number: "03", title: "High Level Design", copy: "Practice architecture decisions, trade-offs, scale, reliability, and complete system designs.", href: "/interview-tracker/resource/hld"},
  {number: "04", title: "Low Level Design", copy: "Practice object modelling, design patterns, clean interfaces, and implementation-focused problems.", href: "/interview-tracker/resource/lld"},
];

export default function InterviewTrackerPage() {
  return <main className="prep-home">
    <header className="admin-topbar prep-home-topbar"><Wordmark/><nav><Link href="/">Portfolio</Link><Link href={{pathname: "/login", query: {next: "/interview-tracker/workspace"}}}>Sign in</Link></nav></header>
    <section className="prep-home-shell">
      <header className="prep-home-hero">
        <div><p className="eyebrow">INTERVIEW PREPARATION</p><h1>Prepare with<br/><em>a clear path.</em></h1></div>
        <p>Choose a company, build your preparation list, or strengthen system design. Your companies appear only after you sign in.</p>
      </header>
      <section className="prep-paths" aria-label="Interview preparation paths">
        {interviewPrepPaths.map((path, index) => <Link className={`prep-path prep-path-${index + 1}`} href={path.href} key={path.title}>
          <span>{path.number}</span><div><h2>{path.title}</h2><p>{path.copy}</p></div><strong aria-hidden="true">↗</strong>
        </Link>)}
      </section>
      <footer className="prep-home-footer"><span>PRIVATE BY DEFAULT</span><p>Company lists are separated by signed-in account and are never shown on this public page.</p></footer>
    </section>
  </main>;
}

type CompanyFormValue = Omit<Company, "id" | "updated_at"> | Company;

function CompanyForm<T extends CompanyFormValue>({value, onChange, onSubmit, saving, onDelete}: {value: T; onChange: (value: T) => void; onSubmit: (event: FormEvent) => void; saving: boolean; onDelete?: () => void}) {
  const field = (name: keyof Company, next: string) => onChange({...value, [name]: next} as T);
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
