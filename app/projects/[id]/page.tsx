/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import projects from "../../../data/source/projects.json";
import { siteConfig } from "../../siteConfig";
import { technologyClassName } from "../../technologyStyles";

export const dynamicParams = false;
export const dynamic = "force-static";

export function generateStaticParams() {
  return projects.map((project) => ({ id: String(project.id) }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
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
  const project = projects.find((item) => String(item.id) === id);
  if (!project) notFound();

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
      <header className="detail-nav">
        <Link className="wordmark" href="/" aria-label="Sanjay Gandhi, home">SM<span>.</span></Link>
        <Link href="/projects">All projects</Link>
      </header>

      <article className="project-detail-shell">
        <header className="project-detail-hero">
          <div>
            <p className="eyebrow">{project.category}</p>
            <h1>{project.name}</h1>
            <p>{project.description}</p>
          </div>
          <dl>
            <div><dt>Status</dt><dd>{project.deployed ? "Live product" : "Product concept"}</dd></div>
            <div><dt>Role</dt><dd>Product engineering</dd></div>
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

        {"aiCapabilities" in project && project.aiCapabilities && (
          <section className="project-detail-ai">
            <p className="eyebrow">AI intelligence service</p>
            <h2>{project.aiApiSummary}</h2>
            <div>{project.aiCapabilities.map((capability) => { const [title, flow] = capability.split(" · "); return <article key={capability}><strong>{title}</strong>{flow && <code>{flow}</code>}</article>; })}</div>
          </section>
        )}
      </article>

      {related.length > 0 && <aside className="detail-related"><p className="eyebrow">Related projects</p>{related.map((item) => <Link href={`/projects/${item.id}`} key={item.id}><strong>{item.name}</strong><span>↗</span></Link>)}</aside>}
    </main>
  );
}
