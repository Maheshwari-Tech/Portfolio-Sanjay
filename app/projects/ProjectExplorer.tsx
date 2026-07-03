"use client";

/* eslint-disable @next/next/no-img-element */
import { useMemo, useState } from "react";

type Project = {
  id: number;
  name: string;
  description: string;
  image: string | null;
  github: string | null;
  technologies: string[];
  category: string;
  features: string[];
};

export default function ProjectExplorer({ projects }: { projects: Project[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [visibleCount, setVisibleCount] = useState(8);

  const categories = useMemo(() => Array.from(new Set(projects.map((project) => project.category))).sort(), [projects]);
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return projects.filter((project) => {
      const matchesCategory = category === "All" || project.category === category;
      const matchesQuery = !term || project.name.toLowerCase().includes(term) ||
        project.description.toLowerCase().includes(term) ||
        project.technologies.some((technology) => technology.toLowerCase().includes(term)) ||
        project.features.some((feature) => feature.toLowerCase().includes(term));
      return matchesCategory && matchesQuery;
    });
  }, [category, projects, query]);

  const updateQuery = (value: string) => {
    setQuery(value);
    setVisibleCount(8);
  };

  const updateCategory = (value: string) => {
    setCategory(value);
    setVisibleCount(8);
  };

  return (
    <section className="project-explorer" aria-label="Browse all projects">
      <div className="project-search-row">
        <label>
          <span>Search projects</span>
          <input value={query} onChange={(event) => updateQuery(event.target.value)} placeholder="Search by project, technology, or feature…" />
        </label>
        <span>{filtered.length} {filtered.length === 1 ? "project" : "projects"}</span>
      </div>

      <div className="project-filters" aria-label="Filter projects by category">
        {["All", ...categories].map((item) => (
          <button className={category === item ? "active" : ""} key={item} type="button" onClick={() => updateCategory(item)}>{item}</button>
        ))}
      </div>

      <div className="project-results">
        {filtered.slice(0, visibleCount).map((project) => (
          <article key={project.id}>
            <div className="project-result-image">
              {project.image ? <img src={project.image} alt="" /> : <span>{project.name}</span>}
              <div><span>{project.category}</span></div>
            </div>
            <div className="project-result-copy">
              <h2>{project.name}</h2>
              <p>{project.description}</p>
              {project.features.length > 0 && (
                <ul>{project.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
              )}
              <div className="project-result-footer">
                <div>{project.technologies.map((technology) => <span key={technology}>{technology}</span>)}</div>
                {project.github && <a href={project.github} target="_blank" rel="noreferrer">View on GitHub ↗</a>}
              </div>
            </div>
          </article>
        ))}
      </div>

      {filtered.length === 0 && <p className="project-empty">No projects match this search yet.</p>}
      {visibleCount < filtered.length && <button className="show-more-projects" type="button" onClick={() => setVisibleCount((count) => count + 8)}>Show more projects ↓</button>}
    </section>
  );
}
