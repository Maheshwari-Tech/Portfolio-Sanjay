/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import Image from "next/image";
import portfolioFallback from "../data/portfolio.json";
import aboutFallback from "../data/source/about.json";
import achievementGroupsFallback from "../data/source/achievements.json";
import blogsFallback from "../data/source/blogs.json";
import educationFallback from "../data/source/education.json";
import experienceFallback from "../data/source/experience.json";
import personalItemsFallback from "../data/source/personal.json";
import projectDataFallback from "../data/source/projects.json";
import reviewsFallback from "../data/source/reviews.json";
import skillsFallback from "../data/source/skills.json";
import videosFallback from "../data/source/videos.json";
import VideoCarousel from "./VideoCarousel";
import ContactFeedback from "./ContactFeedback";
import ProjectGallery from "./ProjectGallery";
import ExperienceCarousel from "./ExperienceCarousel";
import RecognitionCarousel from "./RecognitionCarousel";
import { technologyClassName } from "./technologyStyles";
import { siteConfig } from "./siteConfig";
import MobileNavigation from "./MobileNavigation";
import BeyondTechnicalTabs from "./BeyondTechnicalTabs";
import AccountStatus from "./AccountStatus";
import Wordmark from "./Wordmark";
import SiteFooter from "./SiteFooter";
import RecommendationCarousel from "./RecommendationCarousel";
import { backendFirst } from "./serverContent";

export const revalidate = 120;

const skillLabels: Record<string, string> = {
  languages: "Languages",
  programmingFrameworks: "Programming & frameworks",
  databases: "Databases & storage",
  cloudAndInfrastructure: "Cloud & infrastructure",
  distributedSystems: "Distributed systems",
  machineLearningAndAI: "Machine learning & AI",
  aiAndMachineLearning: "AI & machine learning",
  distributedSystemsCloud: "Distributed systems & cloud",
  architectureAndQuality: "Architecture & quality",
  techLeadAndLeadership: "Tech Lead & Leadership",
  devOpsAndSre: "DevOps & SRE",
  tools: "Tools",
  softwareDevelopment: "Software development",
};

const achievementLabels: Record<string, string> = {
  professional_leadership: "Professional & leadership",
  certifications: "Certifications",
  competitive_programming: "Competitive programming",
  academic_excellence: "Academic excellence",
  hackathons: "Hackathons",
  Hackathons: "Hackathons",
};

const recommendationKeywords = [
  "Technical leadership", "Architecture", "Ownership", "Execution clarity",
  "Mentoring", "Collaboration", "System design", "Code quality",
  "Product knowledge", "Problem solving", "Dependability", "Humility",
];

type Achievement = string | { text: string; url?: string; priority?: number; learning?: string };
type Recommendation = {
  id: number;
  name: string;
  rating: number;
  comment: string;
  date: string;
  context: string;
  socialLink: string;
};

const cleanBlogTitle = (title: string) => title.replace(/\.(md|svg|pdf)$/i, "");
const articleSummaries: Record<number, string> = {
  4: "A visual walkthrough of system design interviews, the decisions they test, and lessons from the experience.",
  6: "A visual look at the rhythms, priorities, and everyday systems behind a software engineer’s week.",
};

const articleExcerpt = (id: number, content: string) => {
  if (articleSummaries[id]) return articleSummaries[id];
  return content
    .replace(/[#*_`>-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 230) + "…";
};
export default async function Home() {
  const [portfolio, about, achievementGroups, blogs, education, experience, personalItems, projectData, reviews, skills, videos] = await Promise.all([
    backendFirst("portfolio", portfolioFallback),
    backendFirst("about", aboutFallback),
    backendFirst("achievements", achievementGroupsFallback),
    backendFirst("blogs", blogsFallback),
    backendFirst("education", educationFallback),
    backendFirst("experience", experienceFallback),
    backendFirst("personal", personalItemsFallback),
    backendFirst("projects", projectDataFallback),
    backendFirst("reviews", reviewsFallback),
    backendFirst("skills", skillsFallback),
    backendFirst("videos", videosFallback),
  ]);
  const { profile, stats } = portfolio;
  const primaryStatIndexes = new Set([0, 1, 2, 6]);
  const primaryStats = stats.filter((_, index) => primaryStatIndexes.has(index));
  const supportingStats = stats.filter((_, index) => !primaryStatIndexes.has(index));
  const [leadRole, ...focusAreas] = profile.eyebrow.split(" · ");
  const recommendations = reviews.filter((review): review is Recommendation => "socialLink" in review);
  const featuredProjectIds = [29, 15, 25];
  const projects = featuredProjectIds.map((id) => projectData.find((project) => project.id === id)).filter((project) => project !== undefined);
  const allProjectTechnologies = Array.from(new Set(projectData.flatMap((project) => project.technologies))).sort();
  const displayedSkills: Record<string, string[]> = {
    ...(skills as Record<string, string[]>),
    devOpsAndSre: (skills as Record<string, string[]>).devOpsAndSre ?? ["CI/CD", "Jenkins", "Prometheus", "Grafana", "OpenTelemetry", "SLOs", "Monitoring & Alerting", "Incident Response"],
  };
  const liveProjects = projectData.filter((project) => project.deployed).length;
  const technologyMarqueeRows = [
    allProjectTechnologies.filter((_, index) => index % 2 === 0),
    allProjectTechnologies.filter((_, index) => index % 2 !== 0),
  ];
  const recognitionGroups = Object.entries(achievementGroups).map(([category, items]) => ({ category, label: achievementLabels[category] ?? category, items: items as Achievement[] }));
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
            <a className="button button-outline" href="#projects">Key projects</a>
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
                {items.map((item) => <span className={technologyClassName(item)} key={item}>{item}</span>)}
              </div>
            </article>
          ))}
        </div>
        <section className="leadership-rhythm leadership-rhythm-summary" aria-label="Beyond technical leadership">
          <div className="leadership-intro"><p className="eyebrow">BEYOND TECHNICAL</p><h3>Clarity, care, and <em>follow-through.</em></h3><p>I protect focus time, help engineers move through blockers, and connect day-to-day delivery to a longer-term product direction.</p><blockquote>“You are never wrong to do the right thing.”</blockquote></div>
          <div className="leadership-principles">{[["Mentoring people", "Grow judgement, ownership, and confidence."],["Getting things done", "Turn ambiguity into clear next steps."],["Quality & process", "Make reviews and systems reliably useful."],["Roadmap & vision", "Keep the day connected to the direction."]].map(([title, copy]) => <article key={title}><h4>{title}</h4><p>{copy}</p></article>)}</div>
          <Link className="leadership-article-link" href="/articles/tech-lead-rhythm">Read: How I organise a Tech Lead day</Link>
        </section>
      </section>

      <section className="recognition-section" id="achievements">
        <div className="section-heading compact-heading">
          <p className="eyebrow">Recognition</p>
          <h2>Milestones Earned in Journey</h2>
        </div>
        <RecognitionCarousel groups={recognitionGroups} />
      </section>

      <section className="projects-section" id="projects">
        <div className="section-heading projects-heading">
          <div>
            <p className="eyebrow">Key projects</p>
            <h2>Ideas, made useful.</h2>
          </div>
          <div className="projects-actions">
            <a href="https://github.com/Maheshwari-Tech" target="_blank" rel="noreferrer">GitHub</a>
          </div>
        </div>
        <div className="projects-grid">
          {projects.map((project, index) => {
            const screenshots = "gallery" in project
              ? project.gallery ?? []
              : project.image
                ? [{ src: project.image, label: "Product preview" }]
                : [];
            const highlighted = "highlight" in project && project.highlight;
            const galleryImages = screenshots.filter((image) => image.src !== "/images/project-concept-placeholder.svg");

            return (
              <article className={`project-card project-${index + 1} ${highlighted ? "project-highlight" : ""} ${galleryImages.length === 0 ? "project-no-gallery" : ""}`} key={project.name}>
                <ProjectGallery images={galleryImages} projectName={project.name} />
                <div className="project-header">
                  <div><span className={highlighted ? "project-ai-kicker" : undefined}>{project.category}</span><h3><Link href={`/projects/${project.id}`}>{project.name}</Link></h3></div>
                  <span className="project-number">{project.deployed ? "Live project" : highlighted ? "AI Intelligence" : "Product build"}</span>
                </div>
                <p className="project-description">{project.description}</p>
                <div className={`project-feature-map ${highlighted ? "ai-feature-map" : ""}`} aria-label={`${project.name} primary capabilities`}><span>Primary capabilities</span><ul>{project.features.slice(0, 3).map((feature) => <li key={feature}><p>{feature}</p></li>)}</ul></div>
                <div className="project-technology-block">
                  <span>Core technologies</span>
                  <div className="project-tags">{project.technologies.slice(0, 6).map((tag) => <span className={technologyClassName(tag)} key={tag}>{tag}</span>)}</div>
                  <Link className="project-detail-link" href={`/projects/${project.id}`}>View details</Link>
                </div>
              </article>
            );
          })}
        </div>

        <section className="technology-marquee" aria-label="Technologies used across projects">
          <div className="technology-marquee-heading">
            <div><span>Used across projects</span><h3>Project-proven tools.</h3></div>
            <p>{projectData.length} projects · {liveProjects} live builds · {allProjectTechnologies.length} technologies</p>
          </div>
          <div className="technology-marquee-rows">
            {technologyMarqueeRows.map((row, rowIndex) => (
              <div className={`technology-marquee-row ${rowIndex === 1 ? "technology-marquee-row-reverse" : ""}`} key={rowIndex}>
                <div className="technology-marquee-track">
                  {[0, 1].map((copy) => (
                    <div className="technology-marquee-set" aria-hidden={copy === 1} key={copy}>
                      {row.map((technology) => <span className={technologyClassName(technology)} key={`${copy}-${technology}`}>{technology}</span>)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="projects-more-footer projects-cta-panel">
          <Link className="writing-cta writing-cta-primary projects-all-button" href="/projects">
            <span className="writing-cta-icon projects-cta-icon" aria-hidden="true" />
            <span>More Projects</span>
          </Link>
        </div>

      </section>

      <section className="content-section" id="writing">
        <div className="section-heading content-heading">
          <div>
            <p className="eyebrow">Writing</p>
            <h2>Blogs & Articles.</h2>
          </div>
          <div className="content-intro">
            <p>Practical thoughts on interviews, system design, engineering choices, and career growth.</p>
          </div>
        </div>
        <div className="writing-overview" aria-label="Writing archive highlights"><strong>{blogs.length}<span>published notes</span></strong><div>{["Experience", "Ideas", "Thoughts", "Learnings"].map((theme) => <span key={theme}>{theme}</span>)}</div></div>

        <div className="blog-grid">
          {blogs.slice(0, 3).map((blog, index) => {
            const articleHref = "href" in blog && typeof blog.href === "string" ? blog.href : `/articles/${blog.id}`;
            return (
              <article className={`blog-card ${index === 0 ? "blog-card-featured" : ""}`} key={blog.id}>
                <div className="blog-meta">
                  <span>{blog.date}</span>
                  <span>{blog.tags[0]}</span>
                </div>
                <h3><Link href={articleHref}>{cleanBlogTitle(blog.title)}</Link></h3>
                <p className="blog-author">By {blog.author}</p>
                <p className="blog-description">{articleExcerpt(blog.id, blog.content_description)}</p>
                <div className="blog-tags">{blog.tags.slice(0, 2).map((tag) => <span className={technologyClassName(tag)} key={tag}>{tag}</span>)}</div>
                <Link className="blog-read-link" href={articleHref} aria-label={`Read ${cleanBlogTitle(blog.title)}`}>
                  Read article
                </Link>
              </article>
            );
          })}
        </div>

        <div className="writing-cta-panel" aria-label="Explore and subscribe to articles">
          <Link className="writing-cta writing-cta-primary" href="/articles">
            <span className="writing-cta-icon writing-cta-icon-posts" aria-hidden="true" />
            <span>Read All Posts</span>
          </Link>
          <Link className="writing-cta writing-cta-secondary" href="/articles#subscribe">
            <span className="writing-cta-icon writing-cta-icon-updates" aria-hidden="true" />
            <span>Subscribe for Updates</span>
          </Link>
        </div>

        <section className="video-conversations-section" aria-labelledby="video-conversations-title">
          <div className="video-heading">
            <p className="eyebrow">Video conversations</p>
            <h3 id="video-conversations-title">Stories beyond the resume.</h3>
          </div>
          <VideoCarousel videos={videos} />
        </section>
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

      <section className="personal-section" id="personal">
        <div className="section-heading personal-heading">
          <div>
            <p className="eyebrow">Beyond engineering</p>
            <h2>What shapes me beyond the work.</h2>
          </div>
          <p>The films, series, books, places, and people that shape how I see the world beyond systems and software.</p>
        </div>

        <article className="family-card">
          <div>
            <span className="card-kicker">Family</span>
            <h3>Life is better when it&apos;s built together. <span aria-hidden="true">♥</span></h3>
            <p>Meet Shalini Thebaria—my wife, closest friend, and the person who makes every chapter more meaningful.</p>
          </div>
          <a className="family-profile-link" href="https://shalinithebaria.com" target="_blank" rel="noreferrer">
            <span>
              <small>Shalini Thebaria</small>
              <strong>Explore her portfolio</strong>
            </span>
          </a>
        </article>

        <BeyondTechnicalTabs items={personalItems} />
      </section>

      <section className="contact-section" id="contact">
        <div className="contact-shell">
          <div className="contact-heading-row">
            <div>
              <p className="eyebrow">Contact & feedback</p>
              <h2>Let&apos;s start a <em>conversation.</em></h2>
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
