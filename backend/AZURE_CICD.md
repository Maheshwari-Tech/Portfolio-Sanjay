# Azure backend deployment

The production architecture is:

```text
Vercel frontend -> Azure App Service FastAPI -> Supabase
```

The frontend continues to deploy through Vercel. GitHub Actions deploys only
the `backend/` directory to the existing `portfolio-sanjay` Azure App Service.

## One-time Azure setup

In Azure Portal, open **App Services -> portfolio-sanjay**.

1. Start the App Service if it is stopped.
2. Under **Settings -> Configuration**, select Linux and Python 3.12.
3. Under **Settings -> Environment variables**, add the production values from
   `backend/.env.azure.example`.
4. Use the Supabase session pooler connection on port `5432` for
   `DATABASE_URL`.
5. Keep `CORS_ORIGINS` set to the exact Vercel origin without a trailing slash.
6. Save the settings and restart the App Service.

Twilio and hCaptcha secrets belong in Supabase Auth. They do not need to be
duplicated in Azure when `AUTH_PROVIDER=supabase`.

## GitHub authentication

The workflow uses Azure OIDC and expects the three Azure secrets already
created by App Service Deployment Center:

```text
AZUREAPPSERVICE_CLIENTID_B8CCF5EBDD4C4F23A1D3ED1636380DFF
AZUREAPPSERVICE_TENANTID_392DEAFC64F847C5A21EDCBC5B900421
AZUREAPPSERVICE_SUBSCRIPTIONID_057DDE8A0BBA4261A3C78FF2F88E0766
```

Verify them under **GitHub -> Settings -> Secrets and variables -> Actions**.
If they are missing or Azure login fails, reconnect the repository under
**Azure App Service -> Deployment Center**.

## Automatic deployment

The workflow is `.github/workflows/main_portfolio-sanjay.yml`.

On a push to `main` that changes `backend/**`, it:

1. Installs the Python dependencies.
2. Runs all FastAPI tests.
3. Configures and starts the App Service.
4. Deploys only `backend/`.
5. Restarts the service.
6. Verifies `/health` and `/ready`.

Frontend-only changes do not run the Azure workflow. Vercel continues to
deploy the frontend independently.

## Vercel production variable

Set this in the Vercel production environment and redeploy after changing it:

```env
NEXT_PUBLIC_API_BASE_URL=https://portfolio-sanjay-h9fcbcg6debmauhy.centralindia-01.azurewebsites.net
```

## Verification

Both endpoints must return HTTP 200:

```text
https://portfolio-sanjay-h9fcbcg6debmauhy.centralindia-01.azurewebsites.net/health
https://portfolio-sanjay-h9fcbcg6debmauhy.centralindia-01.azurewebsites.net/ready
```

If Azure returns `403 Site Disabled`, start the App Service and check the App
Service Plan for a spending limit, quota, or subscription issue.
