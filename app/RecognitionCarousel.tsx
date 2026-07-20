"use client";

import Link from "next/link";
import { useState } from "react";

type Achievement = string | { text: string; url?: string; learning?: string };
type RecognitionGroup = { category: string; label: string; items: Achievement[] };

export default function RecognitionCarousel({ groups }: { groups: RecognitionGroup[] }) {
  const [start, setStart] = useState(0);
  const visible = [groups[start], groups[(start + 1) % groups.length]].filter(Boolean);
  const previous = () => setStart((current) => (current - 2 + groups.length) % groups.length);
  const next = () => setStart((current) => (current + 2) % groups.length);
  return <div className="recognition-carousel" aria-label="Recognition highlights carousel"><div className="recognition-carousel-track" key={start}>{visible.map((group) => <article className="recognition-slide" key={group.category}><span>{String(groups.indexOf(group) + 1).padStart(2, "0")}</span><h3>{group.label}</h3><strong>{group.items.length} highlights</strong><ul>{group.items.slice(0, 2).map((item) => <li key={typeof item === "string" ? item : item.text}>{typeof item === "string" ? item : item.text}</li>)}</ul><Link href="/recognition">Explore this recognition ↗</Link></article>)}</div><div className="showcase-controls"><button type="button" onClick={previous} aria-label="Show previous recognition">←</button><span>{String(start + 1).padStart(2, "0")}–{String(Math.min(start + 2, groups.length)).padStart(2, "0")} / {String(groups.length).padStart(2, "0")}</span><button type="button" onClick={next} aria-label="Show next recognition">→</button></div></div>;
}
