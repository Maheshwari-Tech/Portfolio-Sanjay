# Technical guide

This document is the developer reference for the portfolio. The main [README](./README.md) describes the website from a product and visitor perspective.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Semantic CSS in `app/globals.css`
- JSON-backed portfolio content
- Vercel deployment

The website does not require authentication, a database, object storage, or a CMS.

## Local development

Requirements:

- Node.js `22.13.0` or newer
- npm

```bash
npm install
npm run dev
```

The development server normally runs at `http://localhost:3000`.

Other commands:

```bash
npm run lint
npm run build
npm run start
```

## Routes

| Route | Source | Purpose |
| --- | --- | --- |
| `/` | `app/page.tsx` | Homepage and primary portfolio narrative |
| `/projects` | `app/projects/page.tsx` | Searchable project archive |
| `/articles` | `app/articles/page.tsx` | Searchable article archive |
| `/articles/[id]` | `app/articles/[id]/page.tsx` | Statically generated article detail |

Unknown article IDs return the Next.js not-found response. Article IDs are generated at build time through `generateStaticParams()`.

## Data ownership

| File | Content |
| --- | --- |
| `data/portfolio.json` | Profile and headline statistics |
| `data/source/about.json` | Introduction and social links |
| `data/source/experience.json` | Work history, logos, impact, technologies, and learnings |
| `data/source/skills.json` | Technology groups |
| `data/source/projects.json` | Project cards, galleries, features, AI capabilities, and links |
| `data/source/blogs.json` | Articles and article content |
| `data/source/videos.json` | Video carousel entries |
| `data/source/achievements.json` | Grouped achievements and hackathons |
| `data/source/reviews.json` | LinkedIn recommendations |
| `data/source/education.json` | Education summary |
| `data/source/personal.json` | Movies, series, books, visited places, and wishlist |

Keep presentation content in JSON where practical. Use page code for layout and interaction rules rather than individual portfolio entries.

## Main components

- `app/page.tsx` assembles the homepage sections.
- `app/ProjectGallery.tsx` manages project screenshots.
- `app/VideoCarousel.tsx` manages featured videos.
- `app/ContactFeedback.tsx` renders contact and feedback forms.
- `app/PersonalRecommendation.tsx` renders inline recommendation forms.
- `app/projects/ProjectExplorer.tsx` provides project search and filters.
- `app/articles/ArticleExplorer.tsx` provides article search and filters.
- `app/submissionService.ts` owns the shared browser submission contract.

## Styling

All site styles live in `app/globals.css`.

- CSS variables define the core palette.
- Semantic class prefixes group section styles.
- The principal responsive breakpoints are `980px` and `720px`.
- The site uses plain CSS and does not depend on Tailwind.

## Forms contract

Contact, feedback, and personal recommendation forms send JSON to:

```text
POST https://shalinithebaria.com/sanju/
Content-Type: application/json
```

The endpoint is external to this repository. It must support HTTPS, JSON request bodies, and CORS for every deployed portfolio origin.

Typical fields include:

```json
{
  "type": "contact | feedback | recommendation",
  "name": "Visitor name",
  "email": "visitor@example.com",
  "message": "Submitted message"
}
```

The exact payload varies slightly by form and may also contain purpose, recommendation category, title, and optional reason.

## Static assets

- Images and company logos live under `public/images/`.
- Article diagrams and PDFs live under `public/blogs/`.
- The downloadable resume is `public/Sanjay_Gandhi_Resume.pdf`.
- `public/favicon.svg` is the browser icon.

Paths stored in JSON are public-root paths such as `/images/profile.png`.

## Adding content

### Project

Add an entry to `data/source/projects.json`. Include a stable ID, product description, features, technologies, and one or more gallery images. Homepage projects are selected in `app/page.tsx`; all entries appear in the project archive.

### Article

Add an entry to `data/source/blogs.json` with a unique numeric ID, title, category, date, summary/content, and optional asset. The detail route is generated automatically.

### Personal item

Add an entry to `data/source/personal.json` using the relevant `movies`, `books`, `travel`, or `travelWishlist` category. Items beyond the homepage limit appear in the existing browse-all disclosure.

## Production validation

Before committing or deploying:

```bash
npm run lint
npm run build
```

Verify the homepage, project archive, article archive, at least one article page, static images, and resume download.

## Deployment

Vercel detects this repository as Next.js and uses `npm run build`. Follow [DEPLOYMENT.md](./DEPLOYMENT.md) for CLI deployment, Git integration, custom domains, and troubleshooting.
