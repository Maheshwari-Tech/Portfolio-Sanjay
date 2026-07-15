# Supabase database setup — Dashboard only

Codex does not execute or connect to the Supabase database. You apply the SQL
yourself through the Supabase Dashboard. The browser never receives the
database URL; only FastAPI connects to PostgreSQL.

## Part A — Create the database schema in the UI

1. Sign in to [Supabase](https://supabase.com/dashboard).
2. Open project `yfkruidoqgfyiqxdgapi`.
3. Open **SQL Editor** in the left navigation.
4. Select **New query**.
5. Open this repository file locally and copy its complete contents:
   `supabase/migrations/20260715000100_portfolio_backend.sql`.
6. Paste it into the SQL Editor.
7. Review it, then click **Run** yourself.

The script creates:

- `public.portfolio_state` — application users, requests, interactions, and content state
- `public.otp_challenges` — hashed, expiring development-provider OTP challenges
- an expiry index on `otp_challenges`

It also enables RLS and removes access for the browser roles `anon` and
`authenticated`. The FastAPI backend is the only application-data path.

The script uses `if not exists`, so rerunning the same version is safe. Keep the
SQL file committed as the source of truth even though you apply it through the
Dashboard.

## Part B — Verify through the UI

1. In **SQL Editor**, create another new query.
2. Copy and run `supabase/verify_portfolio_schema.sql`.
3. Confirm the first result contains exactly:
   - `otp_challenges`
   - `portfolio_state`
4. Confirm the second result shows `rls_enabled = true` for both tables.
5. Confirm the third result is empty. Any `anon` or `authenticated` grant is a
   configuration problem.
6. In **Table Editor**, confirm both tables appear. Do not add permissive RLS
   policies—the frontend must not query these tables directly.

## Part C — Get the Azure connection string

1. Click **Connect** at the top of the Supabase project.
2. Select **Session pooler**.
3. Use the string on port `5432`. Azure Container Apps normally needs this
   IPv4-compatible pooler rather than the IPv6 direct database endpoint.
4. Keep the username and host exactly as Supabase displays them. The username
   normally resembles `postgres.<project-ref>`.
5. Replace only the password placeholder locally.
6. URL-encode special password characters.
7. Change the scheme from `postgres://` to `postgresql+psycopg://`.
8. Add `?sslmode=require` if it is not already present.

Final shape:

```env
DATABASE_URL=postgresql+psycopg://postgres.PROJECT_REF:ENCODED_PASSWORD@EXACT_SESSION_POOLER_HOST:5432/postgres?sslmode=require
```

Do not paste the password into chat, commit it, or place it in a
`NEXT_PUBLIC_*` variable.

## Part D — Test the connection locally

Do not replace the normal SQLite development configuration permanently. In a
temporary terminal session, set `DATABASE_URL` to the Session pooler URL and run
from `backend/`:

```bash
DATABASE_URL='YOUR_COMPLETE_SESSION_POOLER_URL' .venv/bin/python check_database.py
```

The checker prints only the database name, PostgreSQL version, and whether the
required tables exist. It never prints the connection string.

## Part D2 — Migrate the checked-in portfolio data

Preview the data migration first:

```bash
DATABASE_URL='YOUR_COMPLETE_SESSION_POOLER_URL' .venv/bin/python seed_database.py
```

Review the counts. Nothing is written without `--apply`. To seed an empty
production database:

```bash
DATABASE_URL='YOUR_COMPLETE_SESSION_POOLER_URL' .venv/bin/python seed_database.py --apply
```

The script imports `database.json`, `content/blogs.json`, and
`content/projects.json`. It refuses to overwrite existing state. Do not use
`--force` unless you have backed up the database and intentionally want to
replace production data.

Then start FastAPI with the same temporary `DATABASE_URL` and verify:

```text
GET http://localhost:8001/health  -> database: postgresql
GET http://localhost:8001/ready   -> 200 {"status":"ready"}
```

## Part E — Save it in Azure

In the Azure Container App, create a secret:

```text
Name:  database-url
Value: the complete SQLAlchemy Session pooler URL
```

Map the environment variable without exposing the value:

```text
DATABASE_URL=secretref:database-url
```

Start with `min replicas = 0` and `max replicas = 3` to limit idle cost and
database connections.

## Secret checklist

- Database password: local secret manager/Azure only
- Publishable key: frontend and backend; identifies the Supabase project
- Service-role key: one-time trusted admin scripts only; never browser or normal API runtime
- `JWT_SECRET` and `OTP_HASH_SECRET`: different random values of at least 32 characters

## Troubleshooting

- **Could not translate host name:** use the exact Session pooler host, not the direct IPv6 host.
- **Password authentication failed:** reset the database password or URL-encode special characters.
- **Connection requires SSL:** append `?sslmode=require`.
- **`/ready` returns 503:** run the UI verification SQL and confirm the Azure secret mapping.
- **Tables visible from browser client:** remove browser grants and do not create permissive RLS policies.
