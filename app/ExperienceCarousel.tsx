"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { technologyClassName } from "./technologyStyles";

type Experience = { company: string; role: string; period: string; duration: string; logo: string; technologies: string[]; keySkills: string[]; details: string[] };

export default function ExperienceCarousel({ experiences }: { experiences: Experience[] }) {
  const [page, setPage] = useState(0);
  const [viewportHeight, setViewportHeight] = useState<number>();
  const panelRefs = useRef<Array<HTMLDivElement | null>>([]);
  const pages = useMemo(() => {
    const grouped: Experience[][] = [];
    for (let index = 0; index < experiences.length; index += 2) grouped.push(experiences.slice(index, index + 2));
    return grouped.slice(0, 2);
  }, [experiences]);
  const showingLatest = page === 0;

  useLayoutEffect(() => {
    const panels = panelRefs.current.filter((panel): panel is HTMLDivElement => panel !== null);
    if (!panels.length) return;

    const updateHeight = () => {
      const tallestPanel = Math.max(...panels.map((panel) => panel.scrollHeight));
      setViewportHeight((current) => current === tallestPanel ? current : tallestPanel);
    };
    const resizeObserver = new ResizeObserver(updateHeight);
    panels.forEach((panel) => resizeObserver.observe(panel));
    updateHeight();

    return () => resizeObserver.disconnect();
  }, [pages]);

  return <div className="experience-carousel" aria-label="Professional experience carousel">
    <div className="experience-carousel-viewport" style={viewportHeight ? { height: viewportHeight } : undefined}>
      {pages.map((visible, pageIndex) => <div
        aria-hidden={pageIndex !== page}
        className={`experience-carousel-track ${pageIndex === page ? "is-active" : "is-inactive"}`}
        inert={pageIndex !== page ? true : undefined}
        key={pageIndex}
        ref={(panel) => { panelRefs.current[pageIndex] = panel; }}
      >
        {visible.map((item, index) => <article className={`experience-slide ${index % 2 ? "experience-slide-reverse" : ""}`} key={item.company}>
          <div className="experience-slide-brand">
            <Image src={item.logo} alt={`${item.company} logo`} width={180} height={180} sizes="180px" />
            <span>{item.period}</span><h3>{item.company}</h3><p>{item.role}</p><small>{item.duration}</small>
          </div>
          <div className="experience-slide-copy">
            <ul className="experience-detail-list">
              {item.details.map((detail, detailIndex) => <li key={detailIndex}><p dangerouslySetInnerHTML={{ __html: detail }} /></li>)}
            </ul>
            <div className="experience-technology-block"><span>Technology stack</span><div className="experience-meta">{item.technologies.map((technology) => <i className={technologyClassName(technology)} key={technology}>{technology}</i>)}</div></div>
            <div className="experience-skills">{item.keySkills.map((skill) => <span key={skill}>{skill}</span>)}</div>
          </div>
        </article>)}
      </div>)}
    </div>
    <div className="experience-history-control">
      <button type="button" onClick={() => setPage(showingLatest ? 1 : 0)}>
        <span>{showingLatest ? "Show past experience" : "Show latest experience"}</span>
        <i aria-hidden="true">{showingLatest ? "↓" : "↑"}</i>
      </button>
    </div>
  </div>;
}
