# Backend auto-deployment: Azure Container Apps

This runbook deploys only the FastAPI service in `backend/`. The frontend
continues to deploy through Vercel.

After the one-time setup below, this is the normal release flow:

1. Push a commit to the `main` branch.
2. If the commit changes `backend/**` or
   `.github/workflows/backend-ci-cd.yml`, GitHub Actions starts automatically.
3. The workflow installs the backend dependencies and runs the backend tests.
4. Only if the tests pass, it builds the Docker image and tags it with the
   immutable Git commit SHA.
5. The image is pushed to Azure Container Registry (ACR).
6. Azure Container Apps deploys a new revision and routes traffic to it.

The workflow is already present at `.github/workflows/backend-ci-cd.yml`.
Do not add an Azure username/password to GitHub. The workflow uses GitHub OIDC.

## Values used in this guide

Use these names unless you intentionally choose different ones:

| Setting | Value |
| --- | --- |
| GitHub organization | `Maheshwari-Tech` |
| GitHub repository | `Portfolio-Sanjay` |
| GitHub deployment branch | `main` |
| GitHub environment | `production` |
| Azure region | `Central India` (`centralindia`) |
| Resource group | `sanjay-portfolio-rg` |
| Container App | `sanjay-portfolio-api` |
| Container port | `8000` |
| Production frontend | `https://portfolio-sanjay-tech.vercel.app` |

An ACR name must be globally unique and contain only letters and numbers. In
the examples below, replace `YOUR_UNIQUE_ACR_NAME` with the name you create.

## 1. Prerequisites

Install or have access to:

- An Azure subscription.
- Owner or User Access Administrator permission for the one-time Azure role
  assignments.
- Admin access to the GitHub repository.
- An existing Supabase project with its tables/migrations configured.
- Azure CLI and GitHub CLI only if you choose the CLI steps. Every GitHub
  setting in this guide can also be entered in the GitHub website.

Do not run the production service with values copied from `backend/.env`.
Keep local and production configuration separate.

## 2. Create the Azure resources

### Option A: Azure Portal

1. Open Azure Portal -> **Resource groups** -> **Create**.
2. Set the name to `sanjay-portfolio-rg` and region to **Central India**.
3. Open **Container registries** -> **Create**.
4. Put it in `sanjay-portfolio-rg`, choose a globally unique registry name,
   choose **Basic**, and leave the admin user disabled.
5. Open **Container Apps** -> **Create**.
6. Create a new Container Apps environment in the same resource group and
   region.
7. Name the app `sanjay-portfolio-api`.
8. For the first image, use any accessible starter image. The GitHub workflow
   will replace it with the FastAPI image after CI/CD is configured.
9. Enable external ingress, set the ingress/target port to `8000`, and use HTTP.
10. Set minimum replicas to `0` and maximum replicas to `3`.

### Option B: Azure CLI

Run these commands yourself from the repository root:

```bash
az login
az account set --subscription "YOUR_SUBSCRIPTION_ID_OR_NAME"
az extension add --name containerapp --upgrade

az group create \
  --name sanjay-portfolio-rg \
  --location centralindia

az acr create \
  --name YOUR_UNIQUE_ACR_NAME \
  --resource-group sanjay-portfolio-rg \
  --sku Basic \
  --admin-enabled false

az containerapp env create \
  --name sanjay-portfolio-environment \
  --resource-group sanjay-portfolio-rg \
  --location centralindia
```

The first Container App can be created from the portal as described above, or
by an initial manual deployment after the GitHub identity has been configured.

## 3. Configure the Container App runtime

Open Azure Portal -> `sanjay-portfolio-api` -> **Secrets** and add:

| Azure secret name | Value source |
| --- | --- |
| `database-url` | Supabase **session pooler** connection string, converted to the SQLAlchemy `postgresql+psycopg://` scheme |
| `supabase-publishable-key` | Supabase Dashboard -> Project Settings -> API -> publishable/anon key |
| `jwt-secret` | A new random secret of at least 32 characters |
| `otp-hash-secret` | A different random secret of at least 32 characters |

For Azure Container Apps, use the Supabase session pooler on port `5432`. URL
encode special characters in the database password. A typical shape is:

```text
postgresql+psycopg://postgres.PROJECT_REF:URL_ENCODED_PASSWORD@REGION.pooler.supabase.com:5432/postgres?sslmode=require
```

Then open **Containers** -> **Environment variables** and add:

| Name | Value |
| --- | --- |
| `APP_ENV` | `production` |
| `AUTH_PROVIDER` | `supabase` |
| `RUNTIME_TARGET` | `container` |
| `DATABASE_URL` | Secret reference: `database-url` |
| `SUPABASE_URL` | `https://YOUR_PROJECT_REF.supabase.co` |
| `SUPABASE_PUBLISHABLE_KEY` | Secret reference: `supabase-publishable-key` |
| `JWT_SECRET` | Secret reference: `jwt-secret` |
| `OTP_HASH_SECRET` | Secret reference: `otp-hash-secret` |
| `ADMIN_PHONE` | `+918847472124` |
| `CORS_ORIGINS` | `https://portfolio-sanjay-tech.vercel.app` |
| `OTP_EXPIRY_MINUTES` | `30` |
| `OTP_MAX_ATTEMPTS` | `5` |

If a custom frontend domain is added later, use a comma-separated value with
origins only and no paths or trailing slashes:

```text
https://portfolio-sanjay-tech.vercel.app,https://your-domain.example
```

Twilio credentials are configured in Supabase Auth, not in the FastAPI
Container App. The hCaptcha secret is also configured in Supabase Auth. Only
the hCaptcha site key is public and belongs in the Vercel frontend variables.

## 4. Configure ingress, scaling, and health checks

In the Container App:

1. Open **Ingress**.
2. Enable external ingress and require HTTPS.
3. Set target port to `8000` and transport to HTTP/Auto.
4. Open **Scale** and set minimum replicas to `0`, maximum replicas to `3`.
5. Open the container health-probe settings.
6. Add a liveness HTTP probe for `/health` on port `8000`.
7. Add a readiness HTTP probe for `/ready` on port `8000`.

Scale-to-zero minimizes idle cost. The first request after an idle period can
be slower while Azure starts a replica. Set the minimum to `1` later if avoiding
cold starts is more important than minimum cost.

## 5. Give the Container App permission to pull images

Use a managed identity so the app does not store an ACR password:

1. Open the Container App -> **Identity** -> **System assigned** -> turn it on.
2. Open the ACR -> **Access control (IAM)** -> **Add role assignment**.
3. Select `AcrPull`.
4. Assign access to **Managed identity**, then select the managed identity for
   `sanjay-portfolio-api`.
5. In the Container App registry/image configuration, select the ACR and choose
   the system-assigned managed identity for authentication.

## 6. Create the Azure identity used by GitHub Actions

### 6.1 Create an Entra application

1. Azure Portal -> **Microsoft Entra ID** -> **App registrations** -> **New
   registration**.
2. Name it `github-portfolio-sanjay-backend`.
3. Use the default single-tenant option and leave Redirect URI empty.
4. Record:
   - **Application (client) ID** -> this becomes `AZURE_CLIENT_ID`.
   - **Directory (tenant) ID** -> this becomes `AZURE_TENANT_ID`.
5. Azure Portal -> **Subscriptions** -> your subscription -> copy the
   **Subscription ID** -> this becomes `AZURE_SUBSCRIPTION_ID`.

Do not create a client secret. OIDC removes the need for one.

### 6.2 Add the federated credential

1. Open the new app registration -> **Certificates & secrets** -> **Federated
   credentials** -> **Add credential**.
2. Choose **GitHub Actions deploying Azure resources**.
3. Enter:
   - Organization: `Maheshwari-Tech`
   - Repository: `Portfolio-Sanjay`
   - Entity type: **Environment**
   - GitHub environment name: `production`
4. Give it a recognizable credential name and save it.

The entity must be `Environment: production` because the deploy job declares
`environment: production`. A branch-based credential will not match the OIDC
subject used by this workflow.

### 6.3 Assign Azure roles to the GitHub identity

1. Resource group `sanjay-portfolio-rg` -> **Access control (IAM)** -> add the
   `Contributor` role to `github-portfolio-sanjay-backend`.
2. ACR -> **Access control (IAM)** -> add the `AcrPush` role to the same app.

Keep the scope at the resource group and registry; do not grant subscription
Owner access to the deployment identity.

## 7. Configure the GitHub production environment

Open GitHub -> `Maheshwari-Tech/Portfolio-Sanjay` -> **Settings** ->
**Environments**:

1. Create an environment named exactly `production`.
2. Under deployment branches/tags, allow only the `main` branch.
3. Optionally add yourself as a required reviewer. Do not add a reviewer if you
   want every successful backend commit to deploy without manual approval.

## 8. Add GitHub Actions secrets and variables

Open the `production` environment and add these **environment secrets**:

| Secret | Value |
| --- | --- |
| `AZURE_CLIENT_ID` | Application/client ID from step 6.1 |
| `AZURE_TENANT_ID` | Directory/tenant ID from step 6.1 |
| `AZURE_SUBSCRIPTION_ID` | Azure subscription ID |

Then add these **environment variables**:

| Variable | Value |
| --- | --- |
| `AZURE_RESOURCE_GROUP` | `sanjay-portfolio-rg` |
| `AZURE_CONTAINER_APP_NAME` | `sanjay-portfolio-api` |
| `AZURE_ACR_NAME` | ACR name only, without `.azurecr.io` |

The workflow reads `secrets.*` and `vars.*`. The names are case-sensitive.
Never add the database password, Supabase database URL, or OTP secrets to the
workflow: those belong in the Container App secrets from step 3.

## 9. Run the first deployment

You can test the automation without changing code:

1. GitHub -> repository -> **Actions** -> **Backend CI/CD**.
2. Select **Run workflow** and choose `main`.
3. Watch the `test` job first, then the `deploy` job.

For later releases, merge or push a commit that changes something under
`backend/`. No manual workflow run is required.

If a commit changes only frontend files, this backend workflow intentionally
does not run. Vercel handles that deployment.

## 10. Connect Vercel to the deployed API

After the first Azure deployment, copy the Container App application URL. It
will look similar to:

```text
https://sanjay-portfolio-api.<generated-region>.azurecontainerapps.io
```

In Vercel -> project -> **Settings** -> **Environment Variables**, set:

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Azure Container App HTTPS URL, without a trailing slash |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable/anon key |
| `NEXT_PUBLIC_HCAPTCHA_SITE_KEY` | hCaptcha site key, if captcha remains enabled |

Apply them to Production (and Preview only if desired), then redeploy the
frontend once so the browser bundle receives the new API URL.

Also add the production frontend URL in Supabase:

1. Supabase -> **Authentication** -> **URL Configuration**.
2. Site URL: `https://portfolio-sanjay-tech.vercel.app`.
3. Add the same origin, plus any required callback path, to Redirect URLs.

## 11. Verify the first production release

Complete all checks before considering deployment finished:

1. The GitHub `test` and `deploy` jobs are green.
2. `https://YOUR_API_HOST/health` returns HTTP 200 and reports production,
   Supabase authentication, and PostgreSQL.
3. `https://YOUR_API_HOST/ready` returns HTTP 200.
4. Open the Vercel site and test password login.
5. Test SMS OTP login with a real phone number.
6. Confirm `/admin` works only for `+918847472124` and fails closed when the
   backend is unavailable.
7. Submit one contact/demo request and confirm it appears in the admin portal.
8. Confirm browser developer tools show no CORS errors.

## 12. Rollback

Azure Container Apps retains revisions:

1. Azure Portal -> Container App -> **Revisions and replicas**.
2. Find the previously healthy revision.
3. Activate it and move 100% traffic to it.
4. Investigate the failed Git commit before deploying again.

Because every image is tagged with its Git commit SHA, a deployed revision can
be matched directly to the repository commit.

## 13. Common failures

### `AADSTS700213: No matching federated identity record found`

The federated credential does not match the workflow subject. Confirm the
organization, repository, and `Environment: production` selection exactly.

### `AuthorizationFailed` during deployment

The GitHub Entra app is missing `Contributor` on
`sanjay-portfolio-rg`, or the role assignment has not propagated yet.

### Image push is denied

The GitHub Entra app is missing `AcrPush` on the ACR. This is separate from the
Container App managed identity's `AcrPull` permission.

### Container starts but `/ready` fails

Check the Container App logs, then validate `DATABASE_URL`, Supabase URL/key,
and secret references. Azure Container Apps should use the session pooler on
port `5432`, not the Lambda/serverless transaction-pooler configuration.

### Browser reports a CORS error

`CORS_ORIGINS` must contain the exact Vercel origin. Do not include a path or a
trailing slash. After changing it, save a new Container App revision.

### Workflow does not start after a commit

The workflow only watches changes to `backend/**` and its own workflow file,
and automatic deployment only occurs from `main`. Confirm the changed path and
branch in the GitHub commit.

## Final checklist

- [ ] Resource group, ACR, Container Apps environment, and Container App exist.
- [ ] Container App secrets and environment variables are configured.
- [ ] External ingress uses port `8000`.
- [ ] Scale range is `0` to `3`.
- [ ] `/health` and `/ready` probes exist.
- [ ] Container App managed identity has `AcrPull`.
- [ ] GitHub Entra app has resource-group `Contributor` and ACR `AcrPush`.
- [ ] Federated credential targets `Maheshwari-Tech/Portfolio-Sanjay` and the
      `production` environment.
- [ ] GitHub environment secrets and variables use the exact expected names.
- [ ] First GitHub workflow run succeeds.
- [ ] Vercel `NEXT_PUBLIC_API_BASE_URL` points to Azure.
- [ ] Production login, OTP, forms, and admin access are verified.
