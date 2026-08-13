import Image from "next/image";
import { technologyClassName } from "./technologyStyles";

type Experience = { company: string; role: string; period: string; duration: string; logo: string; technologies: string[]; keySkills: string[]; details: string[] };

function companyTone(company: string) {
  return company.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function ExperienceCarousel({ experiences }: { experiences: Experience[] }) {
  const grouped: Experience[][] = [];
  for (let index = 0; index < experiences.length; index += 2) grouped.push(experiences.slice(index, index + 2));
  const pages = grouped.slice(0, 2);

  return <div className="experience-carousel" aria-label="Professional experience carousel">
    <div className="experience-carousel-viewport">
      {pages.map((visible, pageIndex) => <div
        aria-label={pageIndex === 0 ? "Latest experience" : "Past experience"}
        className={`experience-carousel-track experience-carousel-page-${pageIndex === 0 ? "latest" : "past"}`}
        id={pageIndex === 1 ? "past-experience" : undefined}
        key={pageIndex}
      >
        {visible.map((item, index) => <article className={`experience-slide experience-company-${companyTone(item.company)} ${index % 2 ? "experience-slide-reverse" : ""}`} key={item.company}>
          <div className="experience-slide-brand">
            <Image src={item.logo} alt={`${item.company} logo`} width={180} height={180} sizes="180px" />
            <span>{item.period}</span><h3>{item.company}</h3><p>{item.role}</p><small>{item.duration}</small>
          </div>
          <div className="experience-slide-copy">
            <ul className="experience-detail-list">
              {item.details.map((detail, detailIndex) => <li key={detailIndex}><p dangerouslySetInnerHTML={{ __html: detail }} /></li>)}
            </ul>
            <div className="experience-technology-block"><span>Technology stack</span><div className="experience-meta">{item.technologies.map((technology) => <i className={technologyClassName(technology)} key={technology}>{technology}</i>)}</div></div>
            <div className="experience-learnings-block">
              <span>Learnings</span>
              <div className="experience-skills">{item.keySkills.map((skill) => <span key={skill}>{skill}</span>)}</div>
            </div>
          </div>
        </article>)}
      </div>)}
    </div>
    {pages.length > 1 && <>
      <div className="experience-history-control experience-history-show-past">
        <a href="#past-experience">
          <span>Show past experience</span>
          <i aria-hidden="true">↓</i>
        </a>
      </div>
      <div className="experience-history-control experience-history-show-latest">
        <a href="#work">
          <span>Show latest experience</span>
          <i aria-hidden="true">↑</i>
        </a>
      </div>
    </>}
  </div>;
}
