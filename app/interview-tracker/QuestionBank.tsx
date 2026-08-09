"use client";

import { useEffect, useMemo, useState } from "react";

type Question = { id: string; url: string; title: string; difficulty: string; acceptance: string; frequency: string };
type Submission = { id: string; title: string; title_slug: string; timestamp: number; status: string; language: string };
type Activity = {
  username: string;
  profile_url: string;
  solved_counts: Array<{ difficulty: string; count: number; submissions: number }>;
  recent_submissions: Submission[];
  recent_accepted_question_slugs: string[];
  question_statuses: Record<string, "solved" | "attempted" | "not_started">;
  question_statuses_complete?: boolean;
  session_state: "authenticated" | "browser_synced" | "not_configured" | "invalid" | "unavailable";
  coverage: "authenticated_all_questions" | "browser_authenticated_sync" | "public_recent_activity";
  coverage_note: string;
  synced_at?: string;
};
type LoadState = "loading" | "ready" | "missing" | "error";
type ProgressStatus = "solved" | "attempted" | "not_started" | "unverified";

function slugify(value: string) {
  return value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function questionSlug(url: string) {
  return url.split("/problems/")[1]?.split("/")[0] || "";
}

function parseCsv(source: string): Question[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (character === '"') {
      if (quoted && source[index + 1] === '"') { field += '"'; index += 1; }
      else quoted = !quoted;
    } else if (character === "," && !quoted) {
      row.push(field); field = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && source[index + 1] === "\n") index += 1;
      row.push(field); field = "";
      if (row.some(Boolean)) rows.push(row);
      row = [];
    } else field += character;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows.slice(1).map((columns) => ({
    id: columns[0] || "", url: columns[1] || "", title: columns[2] || "Untitled question",
    difficulty: columns[3] || "Unknown", acceptance: columns[4] || "—", frequency: columns[5] || "—",
  }));
}

export default function QuestionBank({ company, onRefresh }: { company: string; onRefresh?: () => void }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [activity, setActivity] = useState<Activity | null>(null);
  const [activityState, setActivityState] = useState<"loading" | "ready" | "disconnected" | "error">("loading");
  const [activeTab, setActiveTab] = useState<"questions" | "submissions">("questions");
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState("all");
  const [progress, setProgress] = useState("all");

  useEffect(() => {
    let cancelled = false;
    async function loadQuestions() {
      setState("loading"); setQuestions([]); setQuery(""); setDifficulty("all"); setProgress("all"); setActiveTab("questions");
      try {
        const manifestResponse = await fetch("/data/interview-questions/manifest.json");
        if (!manifestResponse.ok) throw new Error("Question manifest unavailable");
        const manifest = await manifestResponse.json() as { companies: string[] };
        const requested = slugify(company);
        const compact = requested.replace(/-/g, "");
        const bank = manifest.companies.find((item) => item === requested)
          || manifest.companies.find((item) => item.replace(/-/g, "") === compact);
        if (!bank) { if (!cancelled) setState("missing"); return; }
        const response = await fetch(`/data/interview-questions/${bank}.csv`);
        if (!response.ok) throw new Error("Question bank unavailable");
        if (!cancelled) { setQuestions(parseCsv(await response.text())); setState("ready"); }
      } catch {
        if (!cancelled) setState("error");
      }
    }
    async function loadActivity() {
      setActivityState("loading");
      try {
        const stored = localStorage.getItem("portfolio_leetcode_activity");
        if (stored) {
          const body = JSON.parse(stored) as Activity;
          if (!cancelled) { setActivity(body); setActivityState("ready"); }
          return;
        }
        if (!cancelled) { setActivity(null); setActivityState("disconnected"); }
      } catch {
        if (!cancelled) setActivityState("error");
      }
    }
    void Promise.all([loadQuestions(), loadActivity()]);
    return () => { cancelled = true; };
  }, [company]);

  useEffect(() => {
    async function refreshSyncedActivity() {
      try {
        const stored = localStorage.getItem("portfolio_leetcode_activity");
        if (!stored) return;
        setActivity(JSON.parse(stored) as Activity);
        setActivityState("ready");
      } catch {
        // Keep the last successfully loaded snapshot visible.
      }
    }
    const refresh = () => { void refreshSyncedActivity(); };
    window.addEventListener("leetcode-progress-synced", refresh);
    return () => window.removeEventListener("leetcode-progress-synced", refresh);
  }, []);

  const acceptedSlugs = useMemo(() => new Set(activity?.recent_accepted_question_slugs || []), [activity]);
  const submissionSlugs = useMemo(() => new Set(activity?.recent_submissions.map(item => item.title_slug) || []), [activity]);
  const companySlugs = useMemo(() => new Set(questions.map(item => questionSlug(item.url))), [questions]);
  const hasCompleteQuestionStatuses = useMemo(() => Boolean(
    activity && ["authenticated", "browser_synced"].includes(activity.session_state) && activity.question_statuses_complete === true && Object.keys(activity.question_statuses || {}).length > 0
  ), [activity]);
  const statusFor = (question: Question): ProgressStatus => {
    const slug = questionSlug(question.url);
    const authenticatedStatus = activity?.question_statuses?.[slug];
    if (authenticatedStatus) return authenticatedStatus;
    if (acceptedSlugs.has(slug)) return "solved";
    if (submissionSlugs.has(slug)) return "attempted";
    return "unverified";
  };
  const progressCounts = useMemo(() => questions.reduce((counts, question) => {
    const slug = questionSlug(question.url);
    const status = activity?.question_statuses?.[slug] || (acceptedSlugs.has(slug) ? "solved" : submissionSlugs.has(slug) ? "attempted" : "unverified");
    counts[status] += 1;
    return counts;
  }, {solved: 0, attempted: 0, not_started: 0, unverified: 0}), [acceptedSlugs, activity, questions, submissionSlugs]);
  const visible = useMemo(() => questions.filter((question) => {
    const matchesQuery = !query || `${question.title} ${question.id}`.toLowerCase().includes(query.toLowerCase());
    const slug = questionSlug(question.url);
    const status = activity?.question_statuses?.[slug] || (acceptedSlugs.has(slug) ? "solved" : submissionSlugs.has(slug) ? "attempted" : "unverified");
    return matchesQuery && (difficulty === "all" || question.difficulty.toLowerCase() === difficulty) && (progress === "all" || status === progress);
  }), [acceptedSlugs, activity, difficulty, progress, query, questions, submissionSlugs]);
  const counts = useMemo(() => ({
    Easy: questions.filter((item) => item.difficulty === "Easy").length,
    Medium: questions.filter((item) => item.difficulty === "Medium").length,
    Hard: questions.filter((item) => item.difficulty === "Hard").length,
  }), [questions]);

  return <section className="question-bank" aria-labelledby="question-bank-title">
    <div className="question-bank-heading"><div><p className="eyebrow">COMPANY QUESTION BANK</p><h3 id="question-bank-title">LeetCode preparation</h3></div>{state === "ready" && <strong>{questions.length} questions</strong>}</div>
    {activity ? <><div className="leetcode-profile-summary"><div><span>Profile</span><a href={activity.profile_url} target="_blank" rel="noreferrer">{activity.username} ↗</a></div>{activity.solved_counts.filter(item => item.difficulty !== "All").map(item => <div key={item.difficulty}><span>{item.difficulty}</span><strong>{item.count}</strong></div>)}{onRefresh && <button className="leetcode-refresh" onClick={onRefresh}>↻ Refresh status</button>}</div>{activity.synced_at && <p className="leetcode-last-synced">Last refreshed {new Date(activity.synced_at).toLocaleString()}</p>}</> : onRefresh && <button className="leetcode-refresh leetcode-connect-first" onClick={onRefresh}>Connect your LeetCode progress</button>}
    <div className="question-bank-tabs" role="tablist"><button role="tab" aria-selected={activeTab === "questions"} className={activeTab === "questions" ? "active" : ""} onClick={() => setActiveTab("questions")}>Questions</button><button role="tab" aria-selected={activeTab === "submissions"} className={activeTab === "submissions" ? "active" : ""} onClick={() => setActiveTab("submissions")}>Submission history {activity ? `(${activity.recent_submissions.length})` : ""}</button></div>
    {state === "loading" && <p className="question-bank-state">Loading questions for {company}…</p>}
    {state === "missing" && <p className="question-bank-state">No company-specific question bank is available for {company} yet.</p>}
    {state === "error" && <p className="question-bank-state">The question bank could not be loaded.</p>}
    {activeTab === "questions" && state === "ready" && <>
      <div className="question-bank-stats" aria-label="Question summary"><span><b>{counts.Easy}</b> Easy</span><span><b>{counts.Medium}</b> Medium</span><span><b>{counts.Hard}</b> Hard</span>{activityState === "ready" && <><span className="solved"><b>{progressCounts.solved}</b> Solved</span><span className="attempted"><b>{progressCounts.attempted}</b> Attempted</span>{hasCompleteQuestionStatuses && <span><b>{progressCounts.not_started}</b> Not started</span>}{progressCounts.unverified > 0 && <span><b>{progressCounts.unverified}</b> Not verified</span>}</>}</div>
      <div className="question-bank-filters"><label>Search<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Question title or ID…"/></label><label>Difficulty<select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}><option value="all">All difficulties</option><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></label><label>Progress<select value={progress} onChange={(event) => setProgress(event.target.value)}><option value="all">All progress</option><option value="solved">Solved</option><option value="attempted">Attempted</option>{hasCompleteQuestionStatuses && <option value="not_started">Not started</option>}<option value="unverified">Not verified</option></select></label></div>
      {activityState === "error" ? <p className="leetcode-coverage-note">LeetCode activity is temporarily unavailable; question progress cannot be verified.</p> : activity && <p className="leetcode-coverage-note">{hasCompleteQuestionStatuses ? activity.coverage_note : "Only recent LeetCode activity is available. Questions outside that limited history remain Not verified until a complete browser sync succeeds."}</p>}
      {activityState === "disconnected" && <p className="leetcode-coverage-note">Connect LeetCode to see progress for the account signed in on this browser.</p>}
      <div className="question-bank-list">
        {visible.map((question) => { const status = statusFor(question); return <a key={`${question.id}-${question.title}`} href={question.url} target="_blank" rel="noreferrer"><span className={`question-difficulty ${question.difficulty.toLowerCase()}`}>{question.difficulty}</span><strong>{question.title}</strong><small>#{question.id} · Acceptance {question.acceptance} · Frequency {question.frequency}</small><span className={`question-progress ${status}`}>{status === "solved" ? "✓ Solved" : status === "attempted" ? "Attempted" : status === "not_started" ? "Not started" : "Not verified"}</span><i aria-hidden="true">↗</i></a>; })}
        {visible.length === 0 && <p className="question-bank-state">No questions match these filters.</p>}
      </div>
    </>}
    {activeTab === "submissions" && <div className="submission-history">
      {activityState === "loading" && <p className="question-bank-state">Loading submission history…</p>}
      {activityState === "error" && <p className="question-bank-state">LeetCode submission history is temporarily unavailable.</p>}
      {activityState === "disconnected" && <p className="question-bank-state">Connect LeetCode to load your submission history.</p>}
      {activity?.recent_submissions.map(item => <article key={item.id}><div><span className={`submission-status ${item.status === "Accepted" ? "accepted" : "failed"}`}>{item.status}</span>{companySlugs.has(item.title_slug) && <span className="submission-company">In {company} bank</span>}</div><strong>{item.title}</strong><small>{item.language || "Unknown language"} · {new Date(item.timestamp * 1000).toLocaleString()}</small></article>)}
      {activityState === "ready" && activity?.recent_submissions.length === 0 && <p className="question-bank-state">No recent public submissions were found.</p>}
      {activity && <p className="leetcode-coverage-note">LeetCode exposes the latest 20 public submissions for this profile.</p>}
    </div>}
  </section>;
}
