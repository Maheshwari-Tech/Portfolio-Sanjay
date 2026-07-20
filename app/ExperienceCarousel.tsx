/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { technologyClassName } from "./technologyStyles";

type Experience = { company: string; role: string; period: string; duration: string; logo: string; technologies: string[]; keySkills: string[]; details: string[] };

export default function ExperienceCarousel({ experiences }: { experiences: Experience[] }) {
  const [start, setStart] = useState(0);
  const visible = [experiences[start], experiences[(start + 1) % experiences.length]].filter(Boolean);
  const previous = () => setStart((current) => (current - 2 + experiences.length) % experiences.length);
  const next = () => setStart((current) => (current + 2) % experiences.length);

  return <div className="experience-carousel" aria-label="Professional experience carousel">
    <div className="experience-carousel-track" key={start}>
      {visible.map((item, index) => <article className={`experience-slide ${index % 2 ? "experience-slide-reverse" : ""}`} key={item.company}>
        <div className="experience-slide-brand"><img src={item.logo} alt={`${item.company} logo`} /><span>{item.period}</span><h3>{item.company}</h3><p>{item.role}</p><small>{item.duration}</small></div>
        <div className="experience-slide-copy"><p dangerouslySetInnerHTML={{ __html: item.details[0] }} /><div className="experience-slide-signals"><span>{item.technologies.length} technologies</span><span>{item.keySkills.length} focus areas</span></div><div className="experience-meta">{item.technologies.slice(0, 6).map((technology) => <span className={technologyClassName(technology)} key={technology}>{technology}</span>)}</div><div className="experience-skills">{item.keySkills.map((skill) => <span key={skill}>{skill}</span>)}</div></div>
      </article>)}
    </div>
    <div className="showcase-controls"><button type="button" onClick={previous} aria-label="Show previous experience">←</button><span>{String(start + 1).padStart(2, "0")}–{String(Math.min(start + 2, experiences.length)).padStart(2, "0")} / {String(experiences.length).padStart(2, "0")}</span><button type="button" onClick={next} aria-label="Show next experience">→</button></div>
  </div>;
}
