import type { Metadata } from "next";
import projectsFallback from "../../data/source/projects.json";
import ProjectExplorer from "./ProjectExplorer";
import SiteHeader from "../SiteHeader";
import SiteFooter from "../SiteFooter";
import { backendFirst } from "../serverContent";

export const metadata: Metadata = {
  title: "Projects",
  description: "Software products, experiments, and engineering projects by Sanjay Gandhi.",
  alternates: { canonical: "/projects" },
  openGraph: { url: "/projects", title: "Projects — Sanjay Gandhi", description: "Software products, experiments, and engineering projects by Sanjay Gandhi." },
};

export const revalidate = 120;

export default async function ProjectsPage() {
  const projects = await backendFirst("projects", projectsFallback);
  const visibleProjects = [...projects].sort((a, b) => a.priority - b.priority);

  return (
    <>
      <SiteHeader />
      <main className="projects-index-page" id="main-content"><section className="projects-index-hero">
        <p className="eyebrow">Built from curiosity</p>
        <h1>Projects.</h1>
        <p>A complete collection of products, tools, and experiments across finance, communities, gaming, education, builders, and AI.</p>
      </section>
      <ProjectExplorer projects={visibleProjects} />
      </main>
      <SiteFooter />
    </>
  );
}
