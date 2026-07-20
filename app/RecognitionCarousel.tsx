"use client";

import { useEffect, useState } from "react";

type Achievement = string | { text: string; url?: string; learning?: string };
type RecognitionGroup = { category: string; label: string; items: Achievement[] };

export default function RecognitionCarousel({ groups }: { groups: RecognitionGroup[] }) {
  const [start, setStart] = useState(0);
  const [paused, setPaused] = useState(false);
  const [pageHidden, setPageHidden] = useState(false);
  const visible = [groups[start], groups[(start + 1) % groups.length]].filter(Boolean);
  const next = () => setStart((current) => (current + 2) % groups.length);

  useEffect(() => {
    if (paused || pageHidden || groups.length <= 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setStart((current) => (current + 2) % groups.length), 6000);
    return () => window.clearInterval(timer);
  }, [groups.length, pageHidden, paused]);

  useEffect(() => {
    const visibilityChanged = () => setPageHidden(document.hidden);
    document.addEventListener("visibilitychange", visibilityChanged);
    return () => document.removeEventListener("visibilitychange", visibilityChanged);
  }, []);

  return <div className="recognition-carousel" role="region" aria-roledescription="carousel" aria-label="Recognition highlights" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onPointerDown={() => setPaused(true)} onPointerUp={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={() => setPaused(false)}>
    <div className="recognition-carousel-track" key={start}>
      {visible.map((group) => <article className="recognition-slide" key={group.category}>
        <h3>{group.label}</h3>
        <ul>{group.items.map((item) => {
          const value = typeof item === "string" ? { text: item } : item;
          return <li key={value.text} tabIndex={value.learning ? 0 : undefined}>
            {value.url ? <a className="recognition-item-link" href={value.url} target="_blank" rel="noreferrer">{value.text} <span aria-hidden="true">↗</span></a> : <p>{value.text}</p>}
            {value.learning && <p className="recognition-slide-learning">{value.learning}</p>}
          </li>;
        })}</ul>
      </article>)}
    </div>
    <p className="sr-only" aria-live="polite">Showing {visible.map((group) => group.label).join(" and ")}.</p>
    <div className="recognition-controls" aria-label="Browse recognition highlights">
      <button type="button" onClick={next} aria-label="Show more recognition">
        <span>Show more recognition</span>
        <span className="recognition-control-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6" /></svg></span>
      </button>
    </div>
  </div>;
}
