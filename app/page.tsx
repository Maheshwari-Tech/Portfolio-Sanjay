/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import portfolio from "../data/portfolio.json";
import about from "../data/source/about.json";
import achievementGroups from "../data/source/achievements.json";
import blogs from "../data/source/blogs.json";
import education from "../data/source/education.json";
import experience from "../data/source/experience.json";
import personalItems from "../data/source/personal.json";
import projectData from "../data/source/projects.json";
import reviews from "../data/source/reviews.json";
import skills from "../data/source/skills.json";
import videos from "../data/source/videos.json";
import VideoCarousel from "./VideoCarousel";
import ContactFeedback from "./ContactFeedback";
import PersonalRecommendation from "./PersonalRecommendation";
import ProjectGallery from "./ProjectGallery";
import { technologyClassName } from "./technologyStyles";
import { siteConfig } from "./siteConfig";
import MobileNavigation from "./MobileNavigation";
import PersonalVerticalCarousel from "./PersonalVerticalCarousel";
import AccountStatus from "./AccountStatus";
import Wordmark from "./Wordmark";
import SiteFooter from "./SiteFooter";
import RecommendationCarousel from "./RecommendationCarousel";

export const dynamic = "force-static";

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
const socialLabels: Record<string, string> = {
  linkedin: "LinkedIn",
  github: "GitHub",
  youtube: "YouTube",
  email: "Email",
  leetcode: "LeetCode",
  codechef: "CodeChef",
  hackerrank: "HackerRank",
  codeforces: "Codeforces",
  spoj: "SPOJ",
};

const personalLabels: Record<string, { title: string; eyebrow: string }> = {
  movies: { title: "Stories I’d happily rewatch", eyebrow: "Movies · Series" },
  books: { title: "Ideas I return to", eyebrow: "Books" },
  travel: { title: "Places I’d go back to", eyebrow: "Travel" },
};

export default function Home() {
  const { profile, stats } = portfolio;
  const [leadRole, ...focusAreas] = profile.eyebrow.split(" · ");
  const recommendations = reviews.filter((review): review is Recommendation => "socialLink" in review);
  const featuredProjectIds = [29, 15, 25, 17, 26];
  const projects = featuredProjectIds.map((id) => projectData.find((project) => project.id === id)).filter((project) => project !== undefined);
  const travelWishlist = personalItems.filter((item) => item.category === "travel_wishlist");
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
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
      <header className="site-header">
        <Wordmark href="#top" label={`${profile.name}, home`} initials={profile.shortName} />
        <MobileNavigation resume={profile.resume} />
        <AccountStatus />
      </header>

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
            <img src={profile.image} alt={profile.name} className="portrait" />
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
        {stats.map((stat) => (
          <div className="stat" key={stat.label}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </section>

      <section className="work-section" id="work">
        <div className="section-heading light-heading">
          <p className="eyebrow">Experience</p>
          <h2>Teams I&apos;ve learned from, and systems I&apos;ve helped shape.</h2>
        </div>
        <div className="experience-list">
          {experience.map((item) => (
            <article className="experience-row" key={item.company}>
              <div className="experience-brand">
                <div className="experience-logo-wrap">
                  <img src={item.logo} alt={`${item.company} logo`} className="experience-logo" />
                </div>
                <h3>{item.company}</h3>
                <p>{item.role}</p>
                <div className="experience-time"><time>{item.period}</time><span>{item.duration}</span></div>
              </div>
              <div className="experience-copy">
                <ul>
                  {item.details.map((detail) => <li key={detail} dangerouslySetInnerHTML={{ __html: detail }} />)}
                </ul>
                <div className="experience-tag-section experience-technology-section">
                  <span className="experience-tag-label">Technologies</span>
                  <div className="experience-meta">
                    {item.technologies.map((technology) => <span className={technologyClassName(technology)} key={technology}>{technology}</span>)}
                  </div>
                </div>
                <div className="experience-tag-section experience-learning-section">
                  <span className="experience-tag-label">Key Learnings</span>
                  <div className="experience-skills">
                    {item.keySkills.map((skill) => <span key={skill}>{skill}</span>)}
                  </div>
                </div>
              </div>
            </article>
          ))}
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
        <div className="skills-grid" id="technologies">
          {Object.entries(skills).map(([category, items]) => (
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
          <div className="leadership-principles">{[["Mentoring people", "Grow judgement, ownership, and confidence."],["Getting things done", "Turn ambiguity into clear next steps."],["Quality & process", "Make reviews and systems reliably useful."],["Roadmap & vision", "Keep the day connected to the direction."]].map(([title, copy], index) => <article key={title}><span>0{index + 1}</span><h4>{title}</h4><p>{copy}</p></article>)}</div>
          <Link className="leadership-article-link" href="/articles/tech-lead-rhythm">Read: How I organise a Tech Lead day <span>↗</span></Link>
        </section>
      </section>

      <section className="projects-section" id="projects">
        <div className="section-heading projects-heading">
          <div>
            <p className="eyebrow">Key projects</p>
            <h2>Ideas, made useful.</h2>
          </div>
          <div className="projects-actions">
            <Link className="projects-more-link" href="/projects">
              <span>Explore the complete archive</span>
              <strong>Many more projects ↗</strong>
            </Link>
            <a href="https://github.com/Maheshwari-Tech" target="_blank" rel="noreferrer">GitHub ↗</a>
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

            return (
              <article className={`project-card project-${index + 1} ${highlighted ? "project-highlight" : ""}`} key={project.name}>
                <ProjectGallery images={screenshots} projectName={project.name} />
                <div className="project-header">
                  <div><span>{project.category}</span><h3><Link href={`/projects/${project.id}`}>{project.name}</Link></h3></div>
                  <span className="project-number">{highlighted ? "AI Intelligence" : "Product demo"}</span>
                </div>
                <p className="project-description">{project.description}</p>
                <ul className="project-highlights">
                  {project.features.slice(0, highlighted ? 6 : 3).map((feature) => <li key={feature}>{feature}</li>)}
                </ul>
                <div className="project-technology-block">
                  <span>Key technologies</span>
                  <div className="project-tags">{project.technologies.map((tag) => <span className={technologyClassName(tag)} key={tag}>{tag}</span>)}</div>
                  <Link className="project-detail-link" href={`/projects/${project.id}`}>View project details ↗</Link>
                </div>
                {"aiCapabilities" in project && project.aiCapabilities && (
                  <div className="project-capabilities">
                    <div>
                      <span>AI intelligence service</span>
                      <strong>{project.aiApiSummary}</strong>
                    </div>
                    <ul>
                      {project.aiCapabilities.map((capability) => {
                        const [capabilityTitle, capabilityFlow] = capability.split(" · ");
                        return (
                          <li key={capability}>
                            <strong>{capabilityTitle}</strong>
                            {capabilityFlow && <code>{capabilityFlow}</code>}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </article>
            );
          })}
        </div>

        <div className="projects-more-footer">
          <span>More products, experiments, and engineering tools.</span>
          <Link href="/projects">View all projects <span aria-hidden="true">↗</span></Link>
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
            <Link className="articles-more-link" href="/articles">
              <span>Explore the complete archive</span>
              <strong>Many more blogs & articles ↗</strong>
            </Link>
          </div>
        </div>

        <div className="blog-grid">
          {blogs.map((blog, index) => {
            const articleHref = "href" in blog && typeof blog.href === "string" ? blog.href : `/articles/${blog.id}`;
            return (
              <article className={`blog-card ${index === 0 ? "blog-card-featured" : ""}`} key={blog.id}>
                <div className="blog-meta">
                  <span>{blog.date}</span>
                  <span>{blog.tags[0]}</span>
                  <span>0{index + 1}</span>
                </div>
                <h3><Link href={articleHref}>{cleanBlogTitle(blog.title)}</Link></h3>
                <p className="blog-author">By {blog.author}</p>
                <p className="blog-description">{articleExcerpt(blog.id, blog.content_description)}</p>
                <div className="blog-tags">{blog.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
                <Link className="blog-read-link" href={articleHref} aria-label={`Read ${cleanBlogTitle(blog.title)}`}>
                  Read article <span>↗</span>
                </Link>
              </article>
            );
          })}
        </div>

        <div className="articles-more-footer">
          <span>More ideas on engineering, interviews, systems, and growth.</span>
          <Link href="/articles">View all blogs & articles <span aria-hidden="true">↗</span></Link>
        </div>

        <div className="video-heading">
          <p className="eyebrow">Video conversations</p>
          <h3>Stories beyond the resume.</h3>
        </div>
        <VideoCarousel videos={videos} />
      </section>

      <section className="recognition-section" id="achievements">
        <div className="section-heading compact-heading">
          <p className="eyebrow">Recognition</p>
          <h2>Milestones earned through practice.</h2>
        </div>
        <div className="achievement-groups">
          {Object.entries(achievementGroups).map(([category, items]) => (
            <article className="achievement-group" key={category}>
              <h3>{achievementLabels[category] ?? category}</h3>
              <ol className="achievement-list">
                {(items as Achievement[]).map((achievement, index) => {
                  const text = typeof achievement === "string" ? achievement : achievement.text;
                  const url = typeof achievement === "string" ? undefined : achievement.url;
                  const learning = typeof achievement === "string" ? undefined : achievement.learning;
                  return (
                    <li key={text} tabIndex={0}>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <div className="achievement-copy">
                        {url ? <a href={url} target="_blank" rel="noreferrer">{text} ↗</a> : <p>{text}</p>}
                        {learning && <p className="achievement-learning"><strong>Key learning</strong>{learning}</p>}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </article>
          ))}
        </div>
      </section>

      <section className="recommendations-section" id="recommendations">
        <div className="section-heading recommendations-heading">
          <div>
            <p className="eyebrow">LinkedIn recommendations</p>
            <h2>What teammates and mentors say.</h2>
          </div>
          <span>{recommendations.length} recommendations</span>
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
            <h2>A little more personal.</h2>
          </div>
          <p>The films, series, books, places, and people that shape how I see the world beyond systems and software.</p>
        </div>

        <article className="family-card">
          <div>
            <span className="card-kicker">Family</span>
            <h3>Life is better when it&apos;s built together. <span aria-hidden="true">♥</span></h3>
            <p>Meet Shalini Thebaria—my wife, closest friend, and the person who makes every chapter more meaningful.</p>
          </div>
          <a href="https://shalinithebaria.com" target="_blank" rel="noreferrer">
            Visit Shalini’s website <span>↗</span>
          </a>
        </article>

        <div className="personal-categories">
          {["movies", "books", "travel"].map((category) => {
            const categoryItems = personalItems.filter((item) => item.category === category);
            const visibleCount = category === "travel" ? 2 : 3;

            return (
              <article className="personal-category" key={category}>
                <div className="personal-category-heading">
                  <p className="eyebrow">{personalLabels[category].eyebrow}</p>
                  <h3>{personalLabels[category].title}</h3>
                  <PersonalRecommendation mode={category === "movies" ? "screen" : category === "books" ? "book" : "travel"} />
                </div>
                {category === "travel" && (
                  <div className="travel-wishlist">
                    <span className="card-kicker">Wishlist</span>
                    <div className="travel-wishlist-links">
                      {travelWishlist.slice(0, 2).map((item) => (
                        <a href={item.url} target="_blank" rel="noreferrer" key={item.id}>
                          {item.title} <span aria-hidden="true">↗</span>
                        </a>
                      ))}
                    </div>
                    {travelWishlist.length > 2 && (
                      <details className="travel-wishlist-more">
                        <summary>Show full wishlist <span>{travelWishlist.length - 2} more ↓</span></summary>
                        <div className="travel-wishlist-links">
                          {travelWishlist.slice(2).map((item) => (
                            <a href={item.url} target="_blank" rel="noreferrer" key={item.id}>
                              {item.title} <span aria-hidden="true">↗</span>
                            </a>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                )}
                {category === "travel" && (
                  <div className="travel-memory-label">
                    <span>Travel memories</span>
                    <span>{categoryItems.length} places</span>
                  </div>
                )}
                <div className="personal-items">
                  <PersonalVerticalCarousel items={categoryItems} visibleCount={visibleCount} />
                </div>
              </article>
            );
          })}
        </div>
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
          <div className="contact-footer">
            <span>© 2026 {profile.name}</span>
            <div>
              {Object.entries(about.socialProfiles).map(([label, url]) => (
                <a href={label === "email" ? `mailto:${url}` : url} target={label === "email" ? undefined : "_blank"} rel="noreferrer" key={label}>
                  {socialLabels[label] ?? label}
                </a>
              ))}
            </div>
            <a href="#top">Back to top ↑</a>
          </div>
          <SiteFooter />
        </div>
      </section>
    </main>
  );
}
