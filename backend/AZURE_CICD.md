# Azure Container Apps CI/CD

Vercel continues deploying the frontend. This pipeline handles only `backend/`.

## Azure runtime configuration

Container App secrets:

| Secret | Value |
| --- | --- |
| `database-url` | Supabase Session pooler SQLAlchemy URL |
| `supabase-publishable-key` | Supabase publishable key |
| `jwt-secret` | Random value of at least 32 characters |
| `otp-hash-secret` | A different random value of at least 32 characters |

Container environment variables:

```text
APP_ENV=production
AUTH_PROVIDER=supabase
DATABASE_URL=secretref:database-url
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_PUBLISHABLE_KEY=secretref:supabase-publishable-key
JWT_SECRET=secretref:jwt-secret
OTP_HASH_SECRET=secretref:otp-hash-secret
ADMIN_PHONE=+918847472124
CORS_ORIGINS=https://YOUR_VERCEL_DOMAIN,https://YOUR_CUSTOM_DOMAIN
```

Do not add the Supabase service-role key to the running API.

## Initial deployment

```bash
az login
az extension add --name containerapp --upgrade
az group create --name sanjay-portfolio-rg --location centralindia
az containerapp up \
  --name sanjay-portfolio-api \
  --resource-group sanjay-portfolio-rg \
  --location centralindia \
  --source backend \
  --ingress external \
  --target-port 8000
```

Record the generated Azure Container Registry and API hostname. In the Azure
portal configure the secrets and environment variables above. Set scaling to
minimum `0`, maximum `3`; liveness `/health`; readiness `/ready`; port `8000`.

Set these Vercel build variables and redeploy:

```env
NEXT_PUBLIC_API_BASE_URL=https://YOUR_CONTAINER_APP_HOSTNAME
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

## GitHub OIDC and Actions

1. Create a Microsoft Entra app registration for GitHub.
2. Add a federated credential for this repository and the `main` branch.
3. Assign **Contributor** on `sanjay-portfolio-rg`.
4. Assign **AcrPush** on the generated registry.
5. Add GitHub Actions secrets: `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, and
   `AZURE_SUBSCRIPTION_ID`.
6. Add GitHub variables:
   `AZURE_RESOURCE_GROUP=sanjay-portfolio-rg`,
   `AZURE_CONTAINER_APP_NAME=sanjay-portfolio-api`, and
   `AZURE_ACR_NAME=<registry name without .azurecr.io>`.

`.github/workflows/backend-ci-cd.yml` tests backend pull requests. On `main`, a
passing test run builds a commit-SHA-tagged image and deploys a new revision.

## Validate production

1. GitHub test and deploy jobs pass.
2. `/health` reports `production`, `supabase`, `postgresql`.
3. `/ready` returns 200.
4. The exact Vercel/custom origins are in `CORS_ORIGINS`.
5. Password login and fallback SMS OTP work.
6. `/admin` fails closed during API downtime.
7. Azure budget/failure alerts and Supabase usage alerts are enabled.
