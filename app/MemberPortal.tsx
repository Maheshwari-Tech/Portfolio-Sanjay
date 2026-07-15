"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import { ApiUnavailableError, apiFetch, authHeaders } from "./apiClient";

type Area = "candidate" | "recruiter";

const candidateServices = [
  ["Interview plan", "A focused preparation roadmap around your interview date and target role."],
  ["System design", "Architecture fundamentals, trade-offs, estimation, and realistic design rounds."],
  ["Coding practice", "Problem-solving patterns, timed practice, reviews, and offline tests."],
  ["Behavioural interviews", "Build clear stories around ownership, impact, conflict, and leadership."],
  ["Mock interview", "Practice under interview conditions and receive actionable feedback."],
  ["Referral request", "Request a referral across companies with the necessary role and profile details."],
  ["Mentorship", "Ongoing guidance for preparation, career decisions, and engineering growth."],
];

const recruiterServices = [
  ["Candidate discovery", "Share the role, level, location, and must-have experience."],
  ["Technical screening", "Get structured support for coding, system-design, and behavioural evaluation."],
  ["Interview design", "Build an interview loop, calibrated rubrics, and consistent feedback signals."],
  ["Hiring consultation", "Discuss role definition, engineering bar, sourcing constraints, and closing strategy."],
];

export default function MemberPortal({ area }: { area: Area }) {
  const [state, setState] = useState<"loading" | "ready" | "denied" | "offline">("loading");
  const [name, setName] = useState("Member");
  const [service, setService] = useState(area === "candidate" ? "Interview plan" : "Candidate discovery");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const services = area === "candidate" ? candidateServices : recruiterServices;

  useEffect(() => {
    const token = localStorage.getItem("sanjay_portfolio_token");
    if (!token) {
      window.location.replace(`/login?next=/${area}s`);
      return;
    }
    apiFetch(`/member/${area}s`, { headers: authHeaders() })
      .then(async response => {
        if (response.status === 401) { window.location.replace(`/login?next=/${area}s`); return; }
        if (response.status === 403) { setState("denied"); return; }
        if (!response.ok) throw new Error();
        const data = await response.json();
        setName(data.user.name);
        setState("ready");
      })
      .catch(error => setState(error instanceof ApiUnavailableError ? "offline" : "denied"));
  }, [area]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setStatus("Sending request…");
    try {
      const response = await apiFetch("/submissions", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ type: area, title: service, name, category: service, message }),
      });
      if (!response.ok) throw new Error();
      setMessage("");
      setStatus("Request submitted. You can track the follow-up through your registered contact.");
    } catch {
      setStatus("The request service is unavailable. Nothing was submitted—please try again later.");
    }
  }

  if (state !== "ready") return <main className="portal-page"><SiteHeader/><section className="portal-gate"><p className="eyebrow">PRIVATE MEMBER AREA</p><h1>{state === "loading" ? "Checking access…" : state === "offline" ? "Service unavailable." : `${area === "candidate" ? "Candidate" : "Recruiter"} access required.`}</h1><p>{state === "denied" ? "You are signed in, but this portal has not been enabled for your account. Contact Sanjay to request access." : state === "offline" ? "Access cannot be verified while the backend is offline." : "This will only take a moment."}</p><Link className="button button-dark" href="/#contact">Contact Sanjay ↗</Link></section><SiteFooter/></main>;

  return <main className="portal-page">
    <SiteHeader />
    <section className="portal-hero"><p className="eyebrow">{area === "candidate" ? "CANDIDATE SUPPORT" : "RECRUITER SUPPORT"}</p><h1>{area === "candidate" ? `Prepare with direction, ${name}.` : `Hire with a clearer signal, ${name}.`}</h1><p>{area === "candidate" ? "Technical interview preparation and mentorship built around your goals, timeline, and current level." : "Practical support to define roles, identify candidates, and run consistent technical interviews."}</p></section>
    <section className="portal-services">{services.map(([title, detail], index) => <article key={title}><span>{String(index + 1).padStart(2, "0")}</span><h2>{title}</h2><p>{detail}</p><button type="button" onClick={() => { setService(title); document.getElementById("portal-request")?.scrollIntoView({ behavior: "smooth" }); }}>Request this ↘</button></article>)}</section>
    <section className="portal-request" id="portal-request"><div><p className="eyebrow">MAKE A REQUEST</p><h2>{area === "candidate" ? "Have an interview coming up?" : "Hiring for an engineering role?"}</h2><p>Share the useful context. The request is linked to your authenticated account.</p></div><form onSubmit={submit}><label>Support needed<select value={service} onChange={event => setService(event.target.value)}>{services.map(([title]) => <option key={title}>{title}</option>)}</select></label><label>Details<textarea required value={message} onChange={event => setMessage(event.target.value)} placeholder={area === "candidate" ? "Interview date, company, role, experience level, and areas to practise…" : "Role, level, location, timeline, must-have skills, and hiring challenge…"} /></label><button className="button button-dark">Submit request ↗</button>{status && <p className="form-status" role="status">{status}</p>}</form></section>
    <SiteFooter />
  </main>;
}
