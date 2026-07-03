# Vercel deployment guide

This portfolio uses standard Next.js App Router APIs and is ready for Vercel’s zero-configuration Next.js deployment.

## Prerequisites

- Node.js `22.13.0` or newer
- A free [Vercel account](https://vercel.com/signup)
- npm dependencies installed in the repository root

## Validate locally

```bash
npm install
npm run lint
npm run build
npm run start
```

Do not deploy if linting or the production build fails.

## Deploy from the command line

Run this from the repository root:

```bash
npx vercel@latest login
npx vercel@latest --prod
```

The first command performs one-time account authorization. The production deployment command detects Next.js, creates or links the Vercel project, builds it remotely, and prints the resulting `vercel.app` URL.

For the first deployment, accept the detected defaults unless the project should live under a different Vercel account or team:

```text
Set up and deploy? yes
Which scope? your personal account
Link to an existing project? no
Project name: portfolio-sanjay
Directory: ./
Modify settings? no
```

Vercel stores the local project link in `.vercel/`. That directory is ignored by Git and must not be committed.

## Deploy from GitHub

After the repository is available on GitHub:

1. Open [Vercel New Project](https://vercel.com/new).
2. Import `Maheshwari-Tech/Portfolio-Sanjay`.
3. Confirm the framework is **Next.js**.
4. Keep the root directory as `./`.
5. Keep the default install and build commands.
6. Select **Deploy**.

Vercel will deploy future pushes to `main` to production and create preview deployments for other branches and pull requests.

## Verify the deployment

Check the generated production URL:

- `/` loads the homepage.
- `/projects` opens the project archive.
- `/articles` opens the article explorer.
- Article detail pages open from the article explorer.
- Images, logos, videos, and the profile photograph load.
- “Download resume” downloads `Sanjay_Gandhi_Resume.pdf`.
- The mobile layout has no horizontal overflow.

## Add a custom domain

Every deployment receives a free `vercel.app` URL. If you already own a domain:

1. Open the project in Vercel.
2. Go to **Settings → Domains**.
3. Enter the apex domain or subdomain and select **Add**.
4. Apply the DNS records Vercel displays.

Vercel provisions HTTPS after DNS verification. Purchasing or renewing the domain itself is not free.

## Contact and recommendation endpoint

The portfolio sends contact, feedback, and personal recommendations to:

```text
POST https://shalinithebaria.com/sanju/
```

Deploying the portfolio does not create this API. The API must allow the production Vercel origin through CORS, for example:

```text
https://portfolio-sanjay.vercel.app
https://your-custom-domain.example
```

Until the endpoint is implemented and reachable, form submissions may fail while the rest of the portfolio remains available.

## Publishing updates

For CLI deployments:

```bash
npm run lint
npm run build
npx vercel@latest --prod
```

For Git-connected deployments, commit and push to `main`; Vercel builds and publishes the update automatically.

## Troubleshooting

### Authentication expired

```bash
npx vercel@latest logout
npx vercel@latest login
```

### Wrong Vercel account or project

Remove only the local Vercel link and run deployment again:

```bash
rm -rf .vercel
npx vercel@latest --prod
```

This does not delete the remote Vercel project.

### A static asset returns 404

Confirm the file exists under `public/`, check filename capitalization, rebuild, and redeploy.

### Deployment build fails

Open the failed deployment in Vercel and inspect **Build Logs**. Reproduce the failure locally with:

```bash
npm install
npm run build
```

## Official references

- [Next.js on Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs)
- [Vercel CLI deployment](https://vercel.com/docs/cli/deploy)
- [Git deployments](https://vercel.com/docs/git)
- [Custom domains](https://vercel.com/kb/guide/how-do-i-add-a-custom-domain-to-my-vercel-project)
