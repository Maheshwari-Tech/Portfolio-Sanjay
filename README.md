# Sanjay Gandhi — Personal Portfolio

A content-rich personal portfolio that presents Sanjay’s professional experience, engineering work, writing, achievements, recommendations, and life beyond technology in one coherent story.

**Live website:** [portfolio-sanjay-tech.vercel.app](https://portfolio-sanjay-tech.vercel.app/)

## What the website communicates

The portfolio is designed to help a visitor quickly understand:

- who Sanjay is as a Tech Lead and software engineer;
- the scale and impact of his work at Oracle, Google, Amazon, and HackerEarth;
- the systems, AI products, and personal projects he has helped build;
- the technologies and leadership practices he works with;
- the ideas he shares through blogs, articles, and videos;
- the professional feedback he has received from teammates and mentors; and
- the books, screen stories, travel, and people that shape him outside work.

## Visitor experience

The homepage moves from a concise introduction into career metrics, work experience, skills, projects, writing, achievements, recommendations, personal interests, and contact options.

The visual approach is editorial and product-focused: large typography, clear section hierarchy, real company branding, product screenshots, focused technology labels, and responsive layouts for desktop and mobile.

## Supported functionality

### Professional profile

- Clear Tech Lead positioning across distributed systems and AI
- Career highlights and measurable impact
- Company logos, roles, timelines, technologies, and key learnings
- Education, achievements, certifications, and hackathon history
- Downloadable latest resume

### Projects

- Curated key projects on the homepage
- Product-oriented descriptions and outcomes
- Screenshot galleries instead of GitHub-only previews
- Highlighted technologies and AI capabilities
- Searchable and filterable complete project archive

### Blogs, articles, and videos

- Featured writing on the homepage
- Dedicated searchable article archive
- Individual article reading pages
- Video carousel that can support a growing video collection

### Social proof

- LinkedIn recommendations from teammates and mentors
- Flexible card heights based on recommendation length
- Achievements grouped by theme

### Personal section

- Favourite movies and series
- Book recommendations and reading interests
- Recently visited places and travel wishlist
- Compact “browse all” interactions for larger collections
- Inline recommendation forms for books, screen stories, and travel
- Link to Shalini Thebaria’s website

### Contact and feedback

- Email, LinkedIn, and WhatsApp/phone options
- Contact form with purpose selection
- Separate feedback form
- Recommendation submissions from the personal section
- Submission payloads prepared for the external portfolio API

## Main pages

- `/` — complete portfolio overview
- `/projects` — full project archive with search and filters
- `/articles` — full article archive with search and filters
- `/articles/[id]` — individual article page

## Content model

Most portfolio content is maintained in JSON files under `data/`. This keeps professional experience, projects, articles, recommendations, skills, videos, and personal interests editable without restructuring page components.

## Deployment

The website is prepared for Vercel using standard Next.js. See the [Vercel deployment guide](./DEPLOYMENT.md).

## Technical reference

Developers can find the architecture, data ownership, component map, local commands, forms contract, and maintenance notes in the [technical guide](./TECHNICAL.md).
