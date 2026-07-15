# Environment setup

The browser, API runtime, and one-time admin bootstrap intentionally use
separate environment files. Twilio is owned by Supabase Auth and its SID/token
must stay in the Supabase Dashboard.

## 1. Local frontend

```bash
cp .env.local.example .env.local
```

Fill `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and the public CAPTCHA site key. Set
`NEXT_PUBLIC_CAPTCHA_PROVIDER` to `hcaptcha` or `turnstile`, matching Supabase
Auth Bot and Abuse Protection. The CAPTCHA secret remains only in Supabase. The
project and site URLs are already populated. Keep
`NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8001` while FastAPI runs locally.

### hCaptcha local hostname

hCaptcha prohibits `localhost` and `127.0.0.1` as challenge hostnames. Use the
local alias `portfolio.localtest.me`, which resolves to `127.0.0.1` without a
hosts-file change:

1. Add `portfolio.localtest.me` to the allowed hostnames for the hCaptcha site key.
2. Add `http://portfolio.localtest.me:3001/**` to Supabase Auth Redirect URLs.
3. Open `http://portfolio.localtest.me:3001/admin/login` for local authentication
   testing. Continue using `localhost:3001` only for non-CAPTCHA page testing.

The login pages automatically redirect from `localhost` to this alias in local
development. The repository allows it in Next.js development and in the
FastAPI CORS list. The production Vercel hostname remains unchanged.

## 2. Local FastAPI using Supabase

```bash
cp backend/.env.example backend/.env
```

Fill the database password, Supabase publishable key, and two different random
secrets. URL-encode special characters in the database password. Generate the
application secrets with `openssl rand -hex 32` twice.

Validate configuration without contacting Supabase:

```bash
cd backend
.venv/bin/python check_environment.py
```

Then validate connectivity and the migrated schema:

```bash
.venv/bin/python check_database.py
```

## 3. Vercel

Use `.env.production.example` as the checklist under **Vercel → Project →
Settings → Environment Variables**. Apply all four variables to Production,
Preview, and Development, then redeploy. The API base URL is the deployed Lambda
Function URL without a trailing slash.

## 4. AWS Lambda

Use `backend/.env.production.example` as the secret checklist. The AWS SAM
template accepts the database URL, Supabase URL/key, application secrets, and
CORS origin as deployment parameters. Lambda must use the Supabase Transaction
pooler on port 6543.

Do not add `SUPABASE_SERVICE_ROLE_KEY`, the database password, Twilio secrets,
or application signing secrets to any `NEXT_PUBLIC_*` variable.
