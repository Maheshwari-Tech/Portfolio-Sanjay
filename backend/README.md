# Portfolio API

The API is independent of the Next.js website and ships as a container. Its
runtime is cloud-neutral: configure it with environment variables and deploy the
same Docker image to AWS, Azure, OCI, Google Cloud, Render, Railway, or Fly.io.

## Start free, locally

SQLite is the default and needs no account or paid service. It persists data in
`portfolio.db` (which is ignored by Git), while the checked-in JSON files seed a
new database on first use.

```bash
cp .env.example .env
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Visit `http://127.0.0.1:8000/health`. For the website, set
`NEXT_PUBLIC_API_BASE_URL` to the deployed API URL.

## Production configuration

Use managed PostgreSQL, for example Supabase Postgres (a good free starting
option), Neon, or a cloud provider's PostgreSQL service. Set these values in the
hosting platform's secret manager—never commit them.

```env
APP_ENV=production
DATABASE_URL=postgresql+psycopg://USER:PASSWORD@HOST:5432/postgres?sslmode=require
CORS_ORIGINS=https://your-domain.example
JWT_SECRET=a-long-random-value-of-at-least-32-characters
OTP_HASH_SECRET=a-different-long-random-value-of-at-least-32-characters
OTP_PROVIDER=supabase
ADMIN_PHONE=+918847472124
```

Production intentionally refuses SQLite, weak secrets, and the development OTP
provider. The current provider boundary only exposes the local development code;
add a verified Supabase, Twilio, Firebase, or Cognito adapter before setting
`OTP_PROVIDER` to that provider. OTP challenges are stored durably, hashed, time
limited, and attempt limited. Sessions are signed, short-lived JWTs so they work
across multiple container instances.

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
