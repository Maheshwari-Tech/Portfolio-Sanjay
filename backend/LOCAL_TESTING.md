# Local end-to-end testing

Local mode uses SQLite and visible development OTPs. It requires no Supabase,
Textlocal, Azure, or paid SMS.

## Terminal 1 — FastAPI

```bash
cd backend
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
APP_ENV=development AUTH_PROVIDER=local \
DATABASE_URL=sqlite:///./portfolio.db \
CORS_ORIGINS=http://localhost:3001 \
ADMIN_PHONE=+918847472124 ADMIN_INITIAL_PASSWORD=123456 \
JWT_SECRET=local-development-jwt-secret-change-me \
OTP_HASH_SECRET=local-development-otp-secret-change-me \
.venv/bin/python -m uvicorn main:app --reload --host 127.0.0.1 --port 8001
```

Verify `http://127.0.0.1:8001/health` and `/ready`.

## Terminal 2 — Next.js

Keep `.env.local` limited to:

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8001
```

Do not add Supabase browser variables for this fallback test. Run:

```bash
npm install
npm run dev -- --port 3001
```

Open `http://localhost:3001`.

## Test workflow

1. Public pages load even with FastAPI stopped.
2. An offline public form is clearly marked as saved only on this device.
3. Start FastAPI and open `/admin/login`.
4. Use `8847472124` and password `123456`.
5. The admin dashboard loads as Sanjay.
6. A wrong password generates a visible local development OTP.
7. Verifying that OTP makes it the new local password.
8. Test contact, feedback, recommendation, demo, likes, and comments.
9. Stop FastAPI and reload `/admin`; it must show “Admin service unavailable”
   and no private data.

Automated tests:

```bash
cd backend
.venv/bin/python -m pytest -q
```
