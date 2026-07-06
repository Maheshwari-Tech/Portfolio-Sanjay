import type { Metadata } from "next";
import Link from "next/link";
import projects from "../../data/source/projects.json";
import ProjectExplorer from "./ProjectExplorer";

export const metadata: Metadata = {
  title: "Projects",
  description: "Software products, experiments, and engineering projects by Sanjay Gandhi.",
  alternates: { canonical: "/projects" },
  openGraph: { url: "/projects", title: "Projects — Sanjay Gandhi", description: "Software products, experiments, and engineering projects by Sanjay Gandhi." },
};

export const dynamic = "force-static";

export default function ProjectsPage() {
  const visibleProjects = projects.filter((project) => project.name !== "Portfolio Website");

  return (
    <main className="projects-index-page">
      <header className="article-nav">
        <Link className="wordmark" href="/" aria-label="Sanjay Gandhi, home">SM<span>.</span></Link>
        <Link href="/#projects">Back to portfolio</Link>
      </header>
      <section className="projects-index-hero">
        <p className="eyebrow">Built from curiosity</p>
        <h1>Projects.</h1>
        <p>A complete collection of products, tools, and experiments across finance, communities, gaming, education, builders, and AI.</p>
      </section>
      <ProjectExplorer projects={visibleProjects} />
    </main>
  );
}
