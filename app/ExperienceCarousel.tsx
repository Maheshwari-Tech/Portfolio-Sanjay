/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { technologyClassName } from "./technologyStyles";

type Experience = { company: string; role: string; period: string; duration: string; logo: string; technologies: string[]; keySkills: string[]; details: string[] };

export default function ExperienceCarousel({ experiences }: { experiences: Experience[] }) {
  const [start, setStart] = useState(0);
  const visible = [experiences[start], experiences[(start + 1) % experiences.length]].filter(Boolean);
  const showingLatest = start === 0;
  const switchExperiencePage = () => setStart(showingLatest ? 2 : 0);

  return <div className="experience-carousel" aria-label="Professional experience carousel">
    <div className="experience-carousel-track" key={start}>
      {visible.map((item, index) => <article className={`experience-slide ${index % 2 ? "experience-slide-reverse" : ""}`} key={item.company}>
        <div className="experience-slide-brand">
          <img src={item.logo} alt={`${item.company} logo`} />
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
    </div>
    <div className="experience-history-control">
      <button type="button" onClick={switchExperiencePage}>
        <span>{showingLatest ? "Show past experience" : "Show latest experience"}</span>
        <i aria-hidden="true">{showingLatest ? "↓" : "↑"}</i>
      </button>
    </div>
  </div>;
}
