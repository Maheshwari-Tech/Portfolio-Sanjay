"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function SiteFooter() {
  const [loggedIn,setLoggedIn]=useState(false);
  useEffect(()=>setLoggedIn(Boolean(localStorage.getItem("sanjay_portfolio_token"))),[]);
  return <footer className="site-footer">
    <div className="site-footer-brand"><Link className="wordmark" href="/">SM<span>.</span></Link><p>Sanjay Gandhi<br/>Tech Lead &amp; Software Engineer</p></div>
    <div><strong>Explore</strong><Link href="/">Home</Link><Link href="/projects">All projects</Link><Link href="/articles">Blogs &amp; articles</Link><Link href="/certificates">Certificates</Link><Link href="/#contact">Contact</Link></div>
    <div><strong>Featured projects</strong><Link href="/projects/29">Intelligent Report Builder</Link><Link href="/projects/15">Cards Game</Link><Link href="/projects/25">Udhari App</Link><Link href="/projects">View every project ↗</Link></div>
    <div><strong>Member areas</strong>{loggedIn ? <><Link href="/candidates">Candidate portal</Link><Link href="/recruiters">Recruiter portal</Link><Link href="/admin">Admin portal</Link></> : <><Link href="/login?next=/candidates">Login as candidate</Link><Link href="/login?next=/recruiters">Login as recruiter</Link><Link href="/admin/login">Admin login</Link></>}</div>
    <p className="site-footer-copy">© 2026 Sanjay Gandhi</p>
  </footer>;
}
