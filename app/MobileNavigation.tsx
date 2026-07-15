"use client";

import { useState } from "react";

const links = [
  ["Work", "#work"], ["Technologies", "#technologies"], ["Projects", "#projects"],
  ["Blogs", "#writing"], ["Certificates", "/certificates"], ["Recommendations", "#recommendations"], ["Personal", "#personal"], ["Contact", "#contact"],
];

export default function MobileNavigation({ resume }: { resume: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`header-navigation ${open ? "menu-open" : ""}`}>
      <button className="mobile-menu-button" type="button" aria-expanded={open} aria-controls="primary-navigation" onClick={() => setOpen((current) => !current)}>
        <span>{open ? "Close" : "Menu"}</span><i aria-hidden="true">{open ? "×" : "☰"}</i>
      </button>
      <nav id="primary-navigation" aria-label="Primary navigation">
        {links.map(([label, href]) => <a href={href} key={href} onClick={() => setOpen(false)}>{label}</a>)}
        <a className="nav-cta" href={resume} download>Resume <span>PDF ↓</span></a>
      </nav>
    </div>
  );
}
