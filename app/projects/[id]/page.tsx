/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import projectsFallback from "../../../data/source/projects.json";
import { siteConfig } from "../../siteConfig";
import { technologyClassName } from "../../technologyStyles";
import ProjectDemoRequest from "../../ProjectDemoRequest";
import ContentInteractions from "../../ContentInteractions";
import SiteHeader from "../../SiteHeader";
import SiteFooter from "../../SiteFooter";
import { backendFirst } from "../../serverContent";

export const dynamicParams = true;
export const revalidate = 120;

const availableProjects = () => backendFirst("projects", projectsFallback);

export function generateStaticParams() {
  return projectsFallback.map((project) => ({ id: String(project.id) }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const projects = await availableProjects();
  const project = projects.find((item) => String(item.id) === id);
  if (!project) return {};
  const url = `/projects/${project.id}`;
  return {
    title: project.name,
    description: project.description,
    alternates: { canonical: url },
    openGraph: { type: "article", url, title: project.name, description: project.description, images: project.image ? [project.image] : ["/opengraph-image"] },
    twitter: { card: "summary_large_image", title: project.name, description: project.description, images: project.image ? [project.image] : ["/twitter-image"] },
  };
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const projects = await availableProjects();
  const project = projects.find((item) => String(item.id) === id);
  if (!project) notFound();
  const isAssistant = project.id === 33;

  const gallery = "gallery" in project && project.gallery?.length
    ? project.gallery
    : project.image
      ? [{ src: project.image, label: `${project.name} product preview`, portrait: false }]
      : [];
  const related = projects.filter((item) => item.id !== project.id && item.category === project.category).slice(0, 3);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.name,
    description: project.description,
    url: `${siteConfig.url}/projects/${project.id}`,
    image: project.image ? `${siteConfig.url}${project.image}` : undefined,
    creator: { "@type": "Person", name: siteConfig.name, url: siteConfig.url },
    keywords: project.technologies.join(", "),
  };

  return (
    <main className="project-detail-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader />

      <article className="project-detail-shell">
        <header className="project-detail-hero">
          <div>
            {"badges" in project && project.badges ? (
              <div className="project-detail-badges">{project.badges.map((badge) => <span key={badge}>{badge}</span>)}</div>
            ) : <p className="eyebrow">{project.category}</p>}
            <h1>{project.name}</h1>
            <p>{project.description}</p>
          </div>
          <dl>
            <div><dt>Status</dt><dd>{project.deployed ? "Live product" : "Product concept"}</dd></div>
            <div><dt>Role</dt><dd>{isAssistant ? "Product & AI architecture" : "Product engineering"}</dd></div>
            <div><dt>Focus</dt><dd>{project.type === "app" ? "Application" : project.type}</dd></div>
          </dl>
        </header>

        {gallery.length > 0 && (
          <div className="project-detail-gallery">
            {gallery.map((image) => <figure key={image.src}><img src={image.src} alt={image.label} /><figcaption>{image.label}</figcaption></figure>)}
          </div>
        )}

        <div className="project-detail-content">
          <section>
            <p className="eyebrow">Product capabilities</p>
            <h2>What it helps people do</h2>
            <ul>{project.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
          </section>
          <aside>
            <p className="eyebrow">Technology</p>
            <div className="project-detail-tags">{project.technologies.map((technology) => <span className={technologyClassName(technology)} key={technology}>{technology}</span>)}</div>
            {project.github && <a className="button button-dark" href={project.github} target="_blank" rel="noreferrer">View source ↗</a>}
          </aside>
        </div>

        {"assistantModes" in project && project.assistantModes && (
          <section className="project-detail-blueprint project-detail-modes">
            <div className="project-detail-section-heading"><p className="eyebrow">Three assistance modes</p><h2>One interface. Clear context boundaries.</h2><p>People choose the context before they begin, making the assistant’s memory, tools, permissions, and responsibilities easier to understand.</p></div>
            <div className="project-blueprint-grid">{project.assistantModes.map((mode, index) => <article key={mode.name}><span aria-hidden="true">0{index + 1}</span><div><h3>{mode.name}</h3><p>{mode.detail}</p></div></article>)}</div>
          </section>
        )}

        {"specialistRoles" in project && project.specialistRoles && (
          <section className="project-detail-skills project-detail-specialists">
            <div className="project-detail-section-heading"><p className="eyebrow">Current specialists</p><h2>Focused expertise for the task at hand.</h2><p>Each role has its own knowledge, tools, output format, and safety rules instead of relying on one generic system prompt.</p></div>
            <div>{project.specialistRoles.map((role) => <article key={role.name}><h3>{role.name}</h3><p>{role.detail}</p></article>)}</div>
          </section>
        )}

        {"architecture" in project && project.architecture && (
          <section className="project-detail-blueprint">
            <div className="project-detail-section-heading"><p className="eyebrow">System architecture</p><h2>{isAssistant ? "Context-aware. Tool-enabled. Safe by design." : "College-governed. Student-powered."}</h2><p>{isAssistant ? "A deterministic orchestration layer surrounds the language model, controls context and tools, and records enough evidence to evaluate every specialist." : "The administration server remains the trusted control plane; application workloads execute only on opted-in student computers."}</p></div>
            <div className="project-blueprint-grid">{project.architecture.map((component) => <article key={component.name}><span aria-hidden="true">↳</span><div><h3>{component.name}</h3><p>{component.detail}</p></div></article>)}</div>
          </section>
        )}

        {"skillsRequired" in project && project.skillsRequired && (
          <section className="project-detail-skills">
            <div className="project-detail-section-heading"><p className="eyebrow">Skills required</p><h2>{isAssistant ? "AI engineering grounded in product trust." : "Engineering depth needed to make it trustworthy."}</h2></div>
            <div>{project.skillsRequired.map((skill) => <article key={skill.name}><h3>{skill.name}</h3><p>{skill.detail}</p></article>)}</div>
          </section>
        )}

        {"deliveryPhases" in project && project.deliveryPhases && (
          <section className="project-detail-plan">
            <div><p className="eyebrow">Delivery approach</p><h2>{isAssistant ? "Start narrow. Earn trust. Expand carefully." : "Start stateless. Earn reliability."}</h2></div>
            <ol>{project.deliveryPhases.map((phase, index) => <li key={phase}><span>{String(index + 1).padStart(2, "0")}</span><p>{phase}</p></li>)}</ol>
          </section>
        )}

        {"constraints" in project && project.constraints && (
          <section className="project-detail-constraints">
            <p className="eyebrow">{isAssistant ? "Product guardrails" : "Architecture realities"}</p><h2>{isAssistant ? "Useful assistance without invisible overreach." : "What makes the idea difficult—and worth designing carefully."}</h2>
            <ul>{project.constraints.map((constraint) => <li key={constraint}>{constraint}</li>)}</ul>
          </section>
        )}

        {"aiCapabilities" in project && project.aiCapabilities && (
          <section className="project-detail-ai">
            <p className="eyebrow">AI intelligence service</p>
            <h2>{project.aiApiSummary}</h2>
            <div>{project.aiCapabilities.map((capability) => { const [title, flow] = capability.split(" · "); return <article key={capability}><strong>{title}</strong>{flow && <code>{flow}</code>}</article>; })}</div>
          </section>
        )}
        <ProjectDemoRequest projectId={String(project.id)} projectName={project.name} />
        <ContentInteractions contentId={`project-${project.id}`} />
      </article>

      {related.length > 0 && <aside className="detail-related"><p className="eyebrow">Related projects</p>{related.map((item) => <Link href={`/projects/${item.id}`} key={item.id}><strong>{item.name}</strong><span>↗</span></Link>)}</aside>}
      <SiteFooter />
    </main>
  );
}
