import Link from "next/link";
import achievementsFallback from "../../data/source/achievements.json";
import SiteFooter from "../SiteFooter";
import SiteHeader from "../SiteHeader";
import { backendFirst } from "../serverContent";

const labels: Record<string, string> = { professional_leadership: "Professional & leadership", certifications: "Certifications", competitive_programming: "Competitive programming", academic_excellence: "Academic excellence", hackathons: "Hackathons" };
type Achievement = string | { text: string; url?: string; learning?: string };

export default async function RecognitionPage() {
  const groups = await backendFirst("achievements", achievementsFallback) as Record<string, Achievement[]>;
  const total = Object.values(groups).flat().length;
  return <main className="recognition-page"><SiteHeader /><section className="recognition-page-hero"><p className="eyebrow">Recognition archive</p><h1>Milestones, fully documented.</h1><p>{total} recognitions across leadership, certifications, competitive programming, academic work, and community contribution.</p><Link href="/#achievements">Back to highlights ↗</Link></section><section className="recognition-archive">{Object.entries(groups).map(([category, items], index) => <article key={category}><header><span>{String(index + 1).padStart(2, "0")}</span><h2>{labels[category] ?? category}</h2><small>{items.length} entries</small></header><ol>{items.map((item, itemIndex) => { const value = typeof item === "string" ? { text: item } : item; return <li key={value.text}><span>{String(itemIndex + 1).padStart(2, "0")}</span><div>{value.url ? <a href={value.url} target="_blank" rel="noreferrer">{value.text} ↗</a> : <p>{value.text}</p>}{value.learning && <p className="recognition-learning"><strong>What it strengthened</strong>{value.learning}</p>}</div></li>; })}</ol></article>)}</section><SiteFooter /></main>;
}
