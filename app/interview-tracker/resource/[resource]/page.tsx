"use client";

import Link from "next/link";
import {useParams} from "next/navigation";
import {useEffect, useMemo, useState} from "react";
import {apiFetch, authHeaders} from "../../../apiClient";
import Wordmark from "../../../Wordmark";

const designResources = {
  hld: {
    label: "High Level Design",
    url: process.env.NEXT_PUBLIC_HLD_URL || "http://localhost:3000/high-level-design",
  },
  lld: {
    label: "Low Level Design",
    url: process.env.NEXT_PUBLIC_LLD_URL || "http://localhost:3002/",
  },
} as const;

export default function InterviewResourcePage() {
  const params = useParams<{resource: string}>();
  const resource = useMemo(() => designResources[params.resource as keyof typeof designResources], [params.resource]);
  const [message, setMessage] = useState("Checking your sign-in…");

  useEffect(() => {
    if (!resource) return;
    const token = localStorage.getItem("sanjay_portfolio_token");
    if (!token) {
      window.location.replace(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    void apiFetch("/auth/me", {headers: authHeaders()}).then(async response => {
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("sanjay_portfolio_token");
          window.location.replace(`/login?next=${encodeURIComponent(window.location.pathname)}`);
          return;
        }
        const body = await response.json().catch(() => ({}));
        setMessage(body.detail || "Your account could not be verified.");
        return;
      }
      setMessage(`Opening ${resource.label}…`);
      window.location.replace(resource.url);
    }).catch(() => setMessage("The sign-in service is unavailable. Please try again."));
  }, [resource]);

  if (!resource) return <main className="tracker-page"><header className="admin-topbar"><Wordmark/><nav><Link href="/interview-tracker">Preparation home</Link></nav></header><section className="admin-empty"><p className="eyebrow">INTERVIEW PREPARATION</p><h1>Resource not found.</h1></section></main>;

  return <main className="tracker-page"><header className="admin-topbar"><Wordmark/><nav><Link href="/interview-tracker">Preparation home</Link></nav></header><section className="admin-empty"><p className="eyebrow">SIGNED-IN RESOURCE</p><h1>{message}</h1><p>If the site does not open, return to the preparation home and try again.</p></section></main>;
}
