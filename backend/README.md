# Portfolio API

The API is independent of the Next.js website and ships as a container. Its
runtime is cloud-neutral: configure it with environment variables and deploy the
same Docker image to AWS, Azure, OCI, Google Cloud, Render, Railway, or Fly.io.

## Start locally with Supabase

The tracked environment template is ready for the configured Supabase project.
Twilio remains configured inside Supabase and is not an API environment secret.

```bash
cp .env.example .env
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python check_environment.py
python check_database.py
uvicorn main:app --reload --host 127.0.0.1 --port 8001
```

Visit `http://127.0.0.1:8001/health`. For the website, set
`NEXT_PUBLIC_API_BASE_URL` to the deployed API URL.

See [`../ENVIRONMENT_SETUP.md`](../ENVIRONMENT_SETUP.md) for the exact local,
Vercel, Lambda, and one-time admin bootstrap variable sets.

## Production configuration

Use `backend/.env.production.example` as the checklist and set the values in the
hosting platform's secret manager—never commit the real file.

```env
APP_ENV=production
DATABASE_URL=postgresql+psycopg://USER:PASSWORD@HOST:5432/postgres?sslmode=require
CORS_ORIGINS=https://your-domain.example
JWT_SECRET=a-long-random-value-of-at-least-32-characters
OTP_HASH_SECRET=a-different-long-random-value-of-at-least-32-characters
AUTH_PROVIDER=supabase
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_REPLACE_ME
ADMIN_PHONE=+918847472124
```

For the complete tracked Supabase setup and verification flow, see
[`SUPABASE_DATABASE_SETUP.md`](SUPABASE_DATABASE_SETUP.md).

Production intentionally refuses SQLite and weak secrets. Supabase owns user
passwords, OTP delivery, and sessions; FastAPI validates Supabase access tokens
and owns application authorization.

## Deploy anywhere

```bash
docker build -t portfolio-api ./backend
docker run --env-file ./backend/.env -p 8000:8000 portfolio-api
```

For AWS use ECS Fargate or App Runner; for Azure use Container Apps; for OCI use
Container Instances or OKE. Each only needs the container image, environment
secrets, a PostgreSQL connection string, and a public HTTPS URL.

Before going live, put the API behind HTTPS, configure an exact CORS allowlist,
use a managed OTP provider, add provider-specific rate limits/CAPTCHA, and move
PDF/image uploads to object storage (S3, Azure Blob, OCI Object Storage, or
Supabase Storage).
