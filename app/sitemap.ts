import type { MetadataRoute } from "next";
import blogs from "../data/source/blogs.json";
import projects from "../data/source/projects.json";
import { siteConfig } from "./siteConfig";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: siteConfig.url, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${siteConfig.url}/projects`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    ...projects.map((project) => ({ url: `${siteConfig.url}/projects/${project.id}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.8 })),
    { url: `${siteConfig.url}/articles`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    ...blogs.map((article) => ({ url: `${siteConfig.url}/articles/${article.id}`, lastModified: article.date ? new Date(article.date) : now, changeFrequency: "yearly" as const, priority: 0.7 })),
  ];
}
