"use client";

import { useEffect, useRef, useState } from "react";

const links = [
  ["Work", "/#work"], ["Technologies", "/#technologies"], ["Projects", "/projects"],
  ["Blogs", "/articles"], ["Certificates", "/certificates"], ["Recommendations", "/#recommendations"], ["Personal", "/#personal"], ["Contact", "/#contact"],
];

export default function MobileNavigation({ resume }: { resume?: string }) {
  const [open, setOpen] = useState(false);
  const [activeHref, setActiveHref] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const syncPath = () => setActiveHref(`${window.location.pathname}${window.location.hash}`);
    syncPath();
    window.addEventListener("hashchange", syncPath);

    const sectionIds = links.map(([, href]) => href.startsWith("/#") ? href.slice(2) : "").filter(Boolean);
    const sections = sectionIds.map((id) => document.getElementById(id)).filter((section): section is HTMLElement => Boolean(section));
    const observer = sections.length ? new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActiveHref(`/#${visible.target.id}`);
    }, { rootMargin: "-24% 0px -62%", threshold: [0, .15, .4] }) : null;
    sections.forEach((section) => observer?.observe(section));
    return () => { window.removeEventListener("hashchange", syncPath); observer?.disconnect(); };
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const close = (event: KeyboardEvent | MouseEvent) => {
      if (event instanceof KeyboardEvent && event.key !== "Escape") return;
      if (event instanceof MouseEvent && rootRef.current?.contains(event.target as Node)) return;
      setOpen(false);
      if (event instanceof KeyboardEvent) buttonRef.current?.focus();
    };
    document.addEventListener("keydown", close);
    document.addEventListener("pointerdown", close);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", close);
      document.removeEventListener("pointerdown", close);
    };
  }, [open]);

  return (
    <div className={`header-navigation ${open ? "menu-open" : ""}`} ref={rootRef}>
      <button ref={buttonRef} className="mobile-menu-button" type="button" aria-expanded={open} aria-controls="primary-navigation" onClick={() => setOpen((current) => !current)}>
        <span>{open ? "Close" : "Menu"}</span><i aria-hidden="true">{open ? "×" : "☰"}</i>
      </button>
      <nav id="primary-navigation" aria-label="Primary navigation">
        {links.map(([label, href]) => {
          const active = activeHref === href ||
            (label === "Projects" && activeHref.startsWith("/projects")) ||
            (label === "Blogs" && activeHref.startsWith("/articles")) ||
            (label === "Certificates" && activeHref.startsWith("/certificates"));
          return <a className={active ? "active" : undefined} aria-current={active ? "location" : undefined} href={href} key={href} onClick={() => setOpen(false)}>{label}</a>;
        })}
        {resume && <a className="nav-cta" href={resume} download>Resume <span>PDF ↓</span></a>}
      </nav>
    </div>
  );
}
