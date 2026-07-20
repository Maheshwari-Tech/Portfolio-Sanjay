"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function SiteFooter() {
  const [loggedIn,setLoggedIn]=useState(false);
  useEffect(()=>setLoggedIn(Boolean(localStorage.getItem("sanjay_portfolio_token"))),[]);
  return <footer className="site-footer">
    <div className="site-footer-brand"><Link className="wordmark" href="/">SM<span>.</span></Link><p>Sanjay Gandhi<br/>Tech Lead &amp; Software Engineer</p><div className="footer-socials" aria-label="Stay connected"><a href="https://www.linkedin.com/in/snjumaheshwari" target="_blank" rel="noreferrer" aria-label="LinkedIn"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 8.5v9M6.5 5.5v.1M10.5 17.5v-5.1c0-2.6 1.5-4 3.5-4 2.3 0 3.5 1.5 3.5 4.4v4.7M10.5 11.8c.5-2.2 1.8-3.4 3.7-3.4" /></svg></a><a href="mailto:sanjaymaheshwari.work@gmail.com" aria-label="Email"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></svg></a><a href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="4" /><circle cx="12" cy="12" r="3.5" /><path d="M17.5 6.8h.01" /></svg></a></div></div>
    <div><strong>Explore</strong><Link href="/">Home</Link><Link href="/projects">All projects</Link><Link href="/articles">Blogs &amp; articles</Link><Link href="/certificates">Certificates</Link><Link href="/#contact">Contact</Link></div>
    <div><strong>Featured projects</strong><Link href="/projects/29">Intelligent Report Builder</Link><Link href="/projects/15">Cards Game</Link><Link href="/projects/25">Udhari App</Link><Link href="/projects">View every project ↗</Link></div>
    <div><strong>Member areas</strong>{loggedIn ? <><Link href="/candidates">Candidate portal</Link><Link href="/recruiters">Recruiter portal</Link><Link href="/admin">Admin portal</Link></> : <><Link href="/login?next=/candidates">Login as candidate</Link><Link href="/login?next=/recruiters">Login as recruiter</Link><Link href="/admin/login">Admin login</Link></>}</div>
    <p className="site-footer-copy">© 2026 Sanjay Gandhi</p>
  </footer>;
}
