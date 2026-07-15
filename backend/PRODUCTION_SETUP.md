# Supabase phone/password production setup

The implemented login flow is:

1. User enters mobile number and password.
2. Supabase checks the password when the user selects Login.
3. The user can explicitly choose “Forgot password? Login with OTP”.
4. User verifies the OTP and receives a session.
5. OTP login never changes the account password.
6. New users add their name after verification.

Supabase owns passwords, OTPs, and sessions. FastAPI validates the Supabase
access token and owns application roles and authorization. No password or
service-role key is stored in frontend code.

## 1. Connect Supabase PostgreSQL

1. In Supabase click **Connect**.
2. For Azure Container Apps, copy **Session pooler** on port `5432`.
3. Change `postgres://` to `postgresql+psycopg://`.
4. URL-encode special characters in the database password.
5. Store the result as the FastAPI `DATABASE_URL` secret.

```env
DATABASE_URL=postgresql+psycopg://postgres.PROJECT_REF:ENCODED_PASSWORD@EXACT_POOLER_HOST:5432/postgres?sslmode=require
```

Never use the database URL in a `NEXT_PUBLIC_*` variable.

## 2. Enable phone authentication

1. Open **Authentication → Sign In / Providers → Phone**.
2. Enable phone sign-ups.
3. Select Textlocal and enter its API key and approved DLT sender/header.
4. Set the SMS OTP expiry to `1800` seconds.
5. Enable CAPTCHA and conservative request limits before public launch.
6. Under **URL Configuration**, add the production site URL and redirect URLs.

Complete TRAI DLT principal-entity, sender/header, consent, and exact OTP
template registration before sending production SMS in India.

## 3. Configure the website

In the frontend deployment, add:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
NEXT_PUBLIC_API_BASE_URL=https://api.your-domain.com
NEXT_PUBLIC_SITE_URL=https://portfolio-sanjay-tech.vercel.app
```

The publishable key is intended for browser use. Never expose a secret or
service-role key through a `NEXT_PUBLIC_*` variable. Redeploy the frontend after
changing these values.

## 4. Configure FastAPI

Add these container secrets:

```env
APP_ENV=production
AUTH_PROVIDER=supabase
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
DATABASE_URL=postgresql+psycopg://...
JWT_SECRET=A_DIFFERENT_RANDOM_SECRET_AT_LEAST_32_CHARACTERS
OTP_HASH_SECRET=ANOTHER_RANDOM_SECRET_AT_LEAST_32_CHARACTERS
ADMIN_PHONE=+918847472124
CORS_ORIGINS=https://portfolio-sanjay-tech.vercel.app,http://localhost:3001
```

FastAPI asks Supabase to validate bearer tokens. It assigns the admin role only
when the verified phone equals `ADMIN_PHONE`; user-editable metadata is never
trusted for authorization.

## 5. Set Sanjay's password

Use the Supabase Dashboard SQL Editor for the one-time admin password setup. Do
not add a service-role key or password-setting utility to the application.

## 6. Deploy

Build the cloud-neutral API container:

```bash
docker build -t portfolio-api ./backend
```

Deploy it to Azure Container Apps Consumption and set `/health` as the health
check. Deploy Next.js to Azure Static Web Apps, Cloudflare Pages, or Vercel.

## 7. Verify before launch

1. `/health` reports `production`, `supabase`, and `postgresql`.
2. Correct mobile/password logs in without sending SMS.
3. Incorrect password does not automatically send an SMS.
4. “Forgot password? Login with OTP” sends one Supabase OTP.
5. Correct OTP logs in without changing the fixed password.
6. A new user is asked for their name only after verification.
7. The access token works for comments, likes, demo requests, and admin APIs.
8. Only `+918847472124` receives the backend admin role.
9. SMS uses the approved provider template and sender.
10. CAPTCHA, SMS rate limits, provider spending alerts, CORS, and HTTPS are active.
11. Supabase backups and service alerts are enabled before the service becomes
    business-critical.

## Expected starting cost

- Supabase Free: ₹0
- Static frontend hosting: ₹0
- Scale-to-zero FastAPI: usually ₹0–₹500
- SMS: provider usage only

Move to Supabase Pro when guaranteed availability and managed backups become
more important than the free starting cost.
