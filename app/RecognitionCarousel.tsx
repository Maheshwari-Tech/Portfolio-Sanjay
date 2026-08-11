import Link from "next/link";

export type Achievement = string | { text: string; url?: string; learning?: string };
export type RecognitionGroup = { category: string; label: string; items: Achievement[] };

export const achievementLabels: Record<string, string> = {
  professional_leadership: "Professional & leadership",
  certifications: "Certifications",
  competitive_programming: "Competitive programming",
  academic_excellence: "Academic excellence",
  hackathons: "Hackathons",
  Hackathons: "Hackathons",
};

function highlightNumbers(text: string) {
  return text.split(/(\b\d[\d,.+]*%?(?:\s*(?:years?|engineers?|interviews?|hires?|teams?|rank|candidates?|certifications?|problems?))?)/gi).filter(Boolean).map((part, index) => /\d/.test(part) ? <strong className="milestone-number" key={index}>{part}</strong> : part);
}

export default function RecognitionCarousel({ groups }: { groups: RecognitionGroup[] }) {
  return <div className="recognition-carousel" role="region" aria-label="Recognition highlights">
    <div className="recognition-carousel-track recognition-all-grid" role="list">
      {groups.map((group) => <article className={`recognition-slide recognition-tone-${group.category.replaceAll("_", "-")}`} role="listitem" key={group.category}>
        <div className="recognition-slide-heading"><strong>{group.items.length} highlights</strong></div>
        <h3>{group.category === "certifications" ? <Link className="recognition-category-link" href="/certificates">{group.label}</Link> : group.label}</h3>
        <ul>{group.items.map((item) => {
          const value = typeof item === "string" ? { text: item } : item;
          return <li key={value.text} tabIndex={value.learning ? 0 : undefined}>
            {value.url ? <a className="recognition-item-link" href={value.url} target="_blank" rel="noreferrer">{highlightNumbers(value.text)}</a> : <p>{highlightNumbers(value.text)}</p>}
            {value.learning && <p className="recognition-slide-learning">{value.learning}</p>}
          </li>;
        })}</ul>
      </article>)}
    </div>
  </div>;
}
