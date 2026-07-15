const productionSiteUrl = "https://portfolio-sanjay-tech.vercel.app";

export const siteConfig = {
  name: "Sanjay Gandhi",
  title: "Sanjay Gandhi — Tech Lead & Software Engineer",
  description: "Portfolio of Sanjay Gandhi, a tech lead building distributed systems, cloud platforms, and AI-powered products.",
  // Keep URL composition stable even when a deployment value includes a trailing slash.
  url: (process.env.NEXT_PUBLIC_SITE_URL || productionSiteUrl).replace(/\/+$/, ""),
  email: "sanjaymaheshwari.work@gmail.com",
  linkedIn: "https://www.linkedin.com/in/snjumaheshwari",
};
