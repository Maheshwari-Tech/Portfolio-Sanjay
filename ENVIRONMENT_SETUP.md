# Environment setup

This repository contains the Vercel frontend. FastAPI runs independently from
the sibling `projects/UltimateBackend` project on Azure App Service, with
Supabase providing PostgreSQL and authentication.

## Local frontend

```bash
cp .env.local.example .env.local
```

Set the public Supabase and CAPTCHA values. Local FastAPI uses
`NEXT_PUBLIC_API_BASE_URL=http://localhost:8001`. For hCaptcha, open the site at
`http://portfolio.localtest.me:3001` because hCaptcha rejects `localhost`.

## Vercel frontend

Add the values from `.env.production.example` under **Vercel -> Project
Settings -> Environment Variables**, then redeploy. In production:

```env
NEXT_PUBLIC_API_BASE_URL=https://portfolio-sanjay-h9fcbcg6debmauhy.centralindia-01.azurewebsites.net
NEXT_PUBLIC_SITE_URL=https://portfolio-sanjay-tech.vercel.app
```

## Backend service

For local end-to-end testing, start UltimateBackend on port `8001` and keep
`NEXT_PUBLIC_API_BASE_URL=http://localhost:8001`. Production deployment,
database migrations, and server-only environment values are managed in the
separate `projects/UltimateBackend` project.

Never expose the database password, Supabase service-role key, Twilio secret,
or application signing secrets through `NEXT_PUBLIC_*` variables.
