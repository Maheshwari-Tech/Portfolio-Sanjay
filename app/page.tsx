/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import Image from "next/image";
import portfolioFallback from "../data/portfolio.json";
import aboutFallback from "../data/source/about.json";
import achievementGroupsFallback from "../data/source/achievements.json";
import blogsFallback from "../data/source/blogs.json";
import educationFallback from "../data/source/education.json";
import experienceFallback from "../data/source/experience.json";
import projectDataFallback from "../data/source/projects.json";
import reviewsFallback from "../data/source/reviews.json";
import skillsFallback from "../data/source/skills.json";
import ContactFeedback from "./ContactFeedback";
import ExperienceCarousel from "./ExperienceCarousel";
import RecognitionCarousel, { achievementLabels, type Achievement } from "./RecognitionCarousel";
import { technologyClassName } from "./technologyStyles";
import { siteConfig } from "./siteConfig";
import MobileNavigation from "./MobileNavigation";
import AccountStatus from "./AccountStatus";
import Wordmark from "./Wordmark";
import SiteFooter from "./SiteFooter";
import RecommendationCarousel, { type Recommendation } from "./RecommendationCarousel";
import { backendFirst } from "./serverContent";
import { publicArchiveArticles, type ArticleRecord } from "./articles/articleData";

export const revalidate = 120;

const skillLabels: Record<string, string> = {
  languages: "Languages",
  programmingFrameworks: "Programming & frameworks",
  databases: "Databases & storage",
  cloudAndInfrastructure: "Cloud, infrastructure & DevOps",
  distributedSystems: "Architecture & distributed systems",
  machineLearningAndAI: "Machine learning & AI",
  aiAndMachineLearning: "AI & machine learning",
  distributedSystemsCloud: "Distributed systems & cloud",
  architectureAndQuality: "Reliability & engineering quality",
  techLeadAndLeadership: "Tech Lead & Leadership",
  devOpsAndSre: "DevOps & infrastructure",
  tools: "Tools",
  softwareDevelopment: "Software development",
};

const recommendationKeywords = [
  "Technical leadership", "Architecture", "Ownership", "Execution clarity",
  "Mentoring", "Collaboration", "System design", "Code quality",
  "Product knowledge", "Problem solving", "Dependability", "Humility",
];

export default async function Home() {
  const [portfolio, about, achievementGroups, blogs, education, experience, projectData, reviews, skills] = await Promise.all([
    backendFirst("portfolio", portfolioFallback),
    backendFirst("about", aboutFallback),
    backendFirst("achievements", achievementGroupsFallback),
    backendFirst("blogs", blogsFallback),
    backendFirst("education", educationFallback),
    backendFirst("experience", experienceFallback),
    backendFirst("projects", projectDataFallback),
    backendFirst("reviews", reviewsFallback),
    backendFirst("skills", skillsFallback),
  ]);
  const { profile, stats } = portfolio;
  const primaryStatIndexes = new Set([0, 1, 2, 6]);
  const primaryStats = stats.filter((_, index) => primaryStatIndexes.has(index));
  const supportingStats = stats.filter((_, index) => !primaryStatIndexes.has(index));
  const [leadRole, ...focusAreas] = profile.eyebrow.split(" · ");
  const recommendations = reviews.filter((review): review is Recommendation => "socialLink" in review);
  const allProjectTechnologies = Array.from(new Set(projectData.flatMap((project) => project.technologies))).sort();
  const sourceSkills = skills as Record<string, string[]>;
  const combinedCloudAndDevOps = Array.from(new Set([
    ...(sourceSkills.cloudAndInfrastructure ?? []),
    ...(sourceSkills.devOpsAndSre ?? []),
  ]));
  const displayedSkills = Object.entries(sourceSkills).reduce<Record<string, string[]>>((groups, [category, items]) => {
    if (category === "devOpsAndSre") return groups;
    groups[category] = category === "cloudAndInfrastructure" ? combinedCloudAndDevOps : items;
    return groups;
  }, {});
  if (!displayedSkills.cloudAndInfrastructure && combinedCloudAndDevOps.length > 0) {
    displayedSkills.cloudAndInfrastructure = combinedCloudAndDevOps;
  }
  const frameworkAndToolPattern = /react|next|node|express|micronaut|spring|fastapi|flask|django|jupyter|pandas|numpy|scikit|tensorflow|opencv|playwright|postman|git|github|vercel|supabase|pnpm|npm|gradle|maven/i;
  const technologyMarqueeRows = [
    {
      key: "tech",
      label: "Tech",
      items: Array.from(new Set([
        ...(sourceSkills.languages ?? []),
        ...allProjectTechnologies.filter((technology) => frameworkAndToolPattern.test(technology)),
        ...combinedCloudAndDevOps,
        ...(sourceSkills.databases ?? []),
        ...(sourceSkills.architectureAndQuality ?? []),
      ])),
    },
    {
      key: "ai",
      label: "AI",
      items: sourceSkills.aiAndMachineLearning ?? [],
    },
    {
      key: "concepts",
      label: "System design & concepts",
      items: sourceSkills.distributedSystems ?? [],
    },
  ].filter((row) => row.items.length > 0);
  const recognitionGroups = Object.entries(achievementGroups).map(([category, items]) => ({ category, label: achievementLabels[category] ?? category, items: items as Achievement[] }));
  const archivedBlogs = publicArchiveArticles(blogs as ArticleRecord[]);
  const noteTopicCounts = [
    { label: "Leadership", pattern: /leadership|tech lead/i },
    { label: "Work experience", pattern: /work experience|experience|typical day|career growth|software professionals/i },
    { label: "System design", pattern: /system design|architecture|delivery framework/i },
  ].map(({ label, pattern }) => ({
    label,
    count: archivedBlogs.filter((article) => pattern.test(`${article.title} ${article.tags.join(" ")}`)).length,
  }));
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    url: siteConfig.url,
    image: `${siteConfig.url}${profile.image}`,
    jobTitle: "Tech Lead and Software Engineer",
    email: `mailto:${profile.email}`,
    sameAs: [siteConfig.linkedIn, "https://github.com/Maheshwari-Tech"],
    knowsAbout: ["Distributed systems", "Cloud architecture", "Generative AI", "LangChain", "LangGraph", "RAG", "Technical leadership"],
    worksFor: { "@type": "Organization", name: "Oracle" },
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <header className="site-header">
        <Wordmark href="#top" label={`${profile.name}, home`} initials={profile.shortName} />
        <MobileNavigation resume={profile.resume} />
        <AccountStatus />
      </header>

      <main id="main-content">
      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow hero-eyebrow">
            <strong>{leadRole}</strong>
            {focusAreas.map((area) => (
              <span className="hero-focus-group" key={area}>
                <span className="hero-focus-divider" aria-hidden="true">·</span>
                <span className={area === "AI" ? "hero-focus hero-focus-ai" : "hero-focus"}>{area}</span>
              </span>
            ))}
          </p>
          <h1>{profile.headline}</h1>
          <p className="hero-summary">{profile.summary}</p>
          <div className="hero-actions">
            <a className="button button-dark" href="#work">Professional experience</a>
            <Link className="button button-outline" href="/projects">Explore projects</Link>
            <a className="text-link resume-link" href={profile.resume} download>
              Resume <span>PDF ↓</span>
            </a>
          </div>
        </div>
        <aside className="hero-aside" aria-label="Profile and current status">
          <span className="portrait-name">{profile.name}</span>
          <div className="portrait-wrap">
            <Image src={profile.image} alt={profile.name} className="portrait" width={512} height={512} priority sizes="(max-width: 720px) 80vw, 350px" />
            <span className="portrait-tag">Tech Lead</span>
          </div>
          <div className="hero-card">
            <div className="status-dot" />
            <p>{profile.availability}</p>
            <div className="hero-card-rule" />
            <span>Based in</span>
            <strong>{profile.location}</strong>
          </div>
        </aside>
      </section>

      <section className="stats" aria-label="Career highlights">
        {primaryStats.map((stat) => (
          <div className="stat" key={stat.label}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
        <div className="stats-supporting" aria-label="Additional career highlights">
          {supportingStats.map((stat) => (
            <div className="stat-supporting" key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="work-section" id="work">
        <div className="section-heading light-heading">
          <p className="eyebrow">Experience</p>
          <h2>Teams I&apos;ve learned from, and systems I&apos;ve helped shape.</h2>
        </div>
        <ExperienceCarousel experiences={experience} />
      </section>

      <section className="journey-invitation section-clickable" aria-labelledby="journey-invitation-title">
        <Link className="section-click-target" href="/journey" aria-label="Open the journey" />
        <div>
          <p className="eyebrow">Journey</p>
          <h2 id="journey-invitation-title">Every milestone has a story. Grateful for every step and every person who helped connect the dots.</h2>
        </div>
        <div className="journey-invitation-copy">
          <p>Follow the milestones, decisions, interviews, lessons, and people that shaped my path from competitive programming to technical leadership.</p>
          <Link href="/journey">Open the journey <span aria-hidden="true">↗</span></Link>
        </div>
      </section>

      <section className="about-section" id="about">
        <div className="section-heading">
          <p className="eyebrow">About</p>
          <h2>Engineer by practice. Mentor by choice. Builder at heart.</h2>
        </div>
        <div className="about-grid">
          <p className="about-copy" dangerouslySetInnerHTML={{ __html: about.introduction }} />
          <div className="education-card">
            <span className="card-kicker">Education</span>
            <h3>{education.degree}</h3>
            <div className="education-meta">
              <span>{education.institution}</span>
              <span>{education.period}</span>
              <strong>{education.cgpa}</strong>
            </div>
          </div>
        </div>
        <div className="skills-heading">
          <div><span className="eyebrow">Technologies</span><h3 id="technologies-heading">Tools chosen for real systems.</h3></div>
          <p>From architecture and cloud infrastructure to AI delivery and technical leadership.</p>
        </div>
        <div className="skills-grid" id="technologies" aria-labelledby="technologies-heading">
          {Object.entries(displayedSkills).map(([category, items]) => (
            <article className="skill-card" key={category}>
              <h3>{skillLabels[category] ?? category}</h3>
              <div className="skill-tags">
                {items.map((item) => <span className={category === "aiAndMachineLearning" || item.startsWith("AI ·") ? "ai-tech-tag" : undefined} key={item}>{item}</span>)}
              </div>
            </article>
          ))}
        </div>
        <section className="leadership-rhythm leadership-rhythm-summary" aria-label="Beyond technical leadership">
          <div className="leadership-intro"><p className="eyebrow">BEYOND TECHNICAL</p><h3>Clarity, care, and <em>follow-through.</em></h3><p>I protect focus time, help engineers move through blockers, and connect day-to-day delivery to a longer-term product direction.</p><blockquote>“You are never wrong to do the right thing.”</blockquote></div>
          <div className="leadership-principles">{[["Mentoring people", "Grow judgement, ownership, and confidence."],["Getting things done", "Turn ambiguity into clear next steps."],["Quality & process", "Make reviews and systems reliably useful."],["Roadmap & vision", "Keep the day connected to the direction."]].map(([title, copy]) => <article key={title}><h4>{title}</h4><p>{copy}</p></article>)}</div>
          <Link className="leadership-article-link" href="/articles">Explore leadership notes</Link>
        </section>
      </section>

      <section className="recognition-section" id="achievements">
        <div className="section-heading compact-heading">
          <p className="eyebrow">Recognition</p>
          <h2>Milestones Earned in Journey</h2>
        </div>
        <RecognitionCarousel groups={recognitionGroups} />
      </section>

      <section className="projects-section section-clickable" id="projects" aria-labelledby="projects-section-title">
        <Link className="section-click-target" href="/projects" aria-label="View all projects" />
        <div className="section-heading projects-heading">
          <div>
            <p className="eyebrow">Projects</p>
            <h2 id="projects-section-title">Curiosity, made concrete.</h2>
            <p className="projects-heading-intro">Products, experiments, and engineering tools built to turn new ideas into practical understanding.</p>
          </div>
          <div className="projects-actions">
            <a className="projects-github-link" href="https://github.com/Maheshwari-Tech" target="_blank" rel="noreferrer">GitHub <span aria-hidden="true">↗</span></a>
          </div>
        </div>

        <section className="technology-marquee project-summary-card" aria-label="Project archive and technologies explored through hands-on projects">
          <div className="project-summary-top">
            <div className="project-summary-copy">
              <span className="project-summary-kicker">Learning by building</span>
              <h3>Problems worth solving.<br /><em>Ideas worth testing.</em></h3>
              <p>I identify real problems, explore how technology can solve them, and use every developed product, working prototype, and evolving idea as an opportunity to learn.</p>
            </div>
            <div className="project-summary-metrics" aria-label="Hands-on project summary">
              <article>
                <strong>20+</strong>
                <p>Projects across products, prototypes &amp; ideas in progress</p>
              </article>
              <article>
                <strong>100+</strong>
                <p>Technologies explored through hands-on problem solving</p>
              </article>
            </div>
          </div>

          <div className="project-technology-window">
            <div className="project-technology-label">
              <span>Technology footprint</span>
              <small>Hands-on, across the archive</small>
            </div>
            <div className="technology-marquee-rows">
              {technologyMarqueeRows.map((row, rowIndex) => (
                <div className={`technology-marquee-row project-technology-row ${rowIndex % 2 === 1 ? "technology-marquee-row-reverse" : ""}`} key={row.key}>
                  <div className="project-technology-row-label">
                    <span>{row.label}</span>
                    <small>{String(row.items.length).padStart(2, "0")}</small>
                  </div>
                  <div className="project-technology-row-window">
                    <div className="technology-marquee-track">
                      {[0, 1].map((copy) => (
                        <div className="technology-marquee-set" aria-hidden={copy === 1} key={copy}>
                          {row.items.map((technology) => <span className={technologyClassName(technology)} key={`${copy}-${technology}`}>{technology}</span>)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="project-summary-footer">
            <p>Explore the complete archive for project details, decisions, architecture, and technology choices.</p>
            <Link className="project-summary-link" href="/projects">
              <span>View all projects</span>
              <i aria-hidden="true">↗</i>
            </Link>
          </div>
        </section>

      </section>

      <section className="content-section section-clickable" id="writing" aria-labelledby="articles-section-title">
        <Link className="section-click-target" href="/articles" aria-label="Read all articles" />
        <div className="section-heading content-heading">
          <div>
            <p className="eyebrow">Notes</p>
            <h2 id="articles-section-title">Ideas worth keeping.</h2>
          </div>
          <div className="content-intro">
            <p>Notes drawn from leadership, work experience, system design, interviews, and the lessons in between.</p>
            <span className="notes-cadence"><i aria-hidden="true" />New notes every week.</span>
          </div>
        </div>
        <div className="notes-summary" aria-label="Notes archive summary">
          <div className="notes-summary-total">
            <strong>{archivedBlogs.length}</strong>
            <span>notes &amp; thoughts</span>
            <p>A living record of ideas, decisions, and lessons from the work.</p>
          </div>
          <div className="notes-topic-grid" aria-label="Notes by topic">
            {noteTopicCounts.map((topic) => (
              <div key={topic.label}>
                <strong>{topic.count}</strong>
                <span>{topic.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="writing-cta-panel notes-cta-panel" aria-label="Explore and subscribe to notes">
          <Link className="writing-cta writing-cta-primary" href="/articles">
            <span className="writing-cta-icon writing-cta-icon-posts" aria-hidden="true" />
            <span>Read all notes</span>
          </Link>
          <Link className="writing-cta writing-cta-secondary" href="/articles#subscribe">
            <span className="writing-cta-icon writing-cta-icon-updates" aria-hidden="true" />
            <span>Subscribe for Updates</span>
          </Link>
        </div>

      </section>

      <section className="recommendations-section" id="recommendations">
        <div className="section-heading recommendations-heading">
          <div>
            <p className="eyebrow">LinkedIn recommendations</p>
            <h2>What teammates and mentors say.</h2>
          </div>
          <div className="recommendations-heading-actions">
            <span>{recommendations.length} recommendations</span>
            <a className="recommendation-linkedin-control" href="https://www.linkedin.com/in/snjumaheshwari/details/recommendations/" target="_blank" rel="noreferrer">
              <span>Recommend me</span>
              <span aria-hidden="true">in</span>
            </a>
          </div>
        </div>
        <div className="recommendation-keyword-slider" aria-label={`Themes from recommendations: ${recommendationKeywords.join(", ")}`}>
          <div className="recommendation-keyword-track" aria-hidden="true">
            {[...recommendationKeywords, ...recommendationKeywords].map((keyword, index) => (
              <span key={`${keyword}-${index}`}><i>✦</i>{keyword}</span>
            ))}
          </div>
        </div>
        <RecommendationCarousel recommendations={recommendations} />
      </section>

      <section className="contact-section" id="contact">
        <div className="contact-shell">
          <div className="contact-heading-row">
            <div className="contact-heading-copy">
              <p className="eyebrow">Let&apos;s build together</p>
              <h2>Get in <em>touch.</em></h2>
              <p className="contact-intro">Have a project in mind or just want to chat? I&apos;d love to hear from you. Send me a message and I&apos;ll respond as soon as possible.</p>
            </div>
            <a className="resume-download" href={profile.resume} download>Download resume <span>PDF ↓</span></a>
          </div>
          <ContactFeedback />
        </div>
      </section>

      </main>
      <SiteFooter />
    </>
  );
}
