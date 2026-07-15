# Minimal-cost AWS deployment

Architecture: Vercel → Lambda Function URL → FastAPI/Mangum → Supabase.

Lambda scales to zero. The Function URL adds no API Gateway charge. Protected
FastAPI endpoints still validate Supabase bearer tokens; public form/content
endpoints remain intentionally public.

## 1. Finish Supabase normalization first

Run `supabase/migrations/20260715000200_normalize_portfolio_data.sql` yourself
in the Supabase SQL Editor and verify it. Do not deploy the Lambda before the
normalized tables exist.

## 2. Copy the correct serverless database URL

In Supabase click **Connect → Transaction pooler**. Copy the port `6543` URL.
Change `postgres://` to `postgresql+psycopg://`, URL-encode the password, and
append `?sslmode=require`.

Shape:

```text
postgresql+psycopg://postgres.PROJECT_REF:PASSWORD@aws-REGION.pooler.supabase.com:6543/postgres?sslmode=require
```

Do not use the Session pooler URL on port 5432 for Lambda.

## 3. Install deployment prerequisites

- Docker Desktop
- AWS CLI v2
- AWS SAM CLI

Configure an AWS IAM user/role locally with permission to deploy CloudFormation,
Lambda, ECR, IAM roles, and S3 deployment artifacts, then run `aws configure`.

Use AWS region `ap-southeast-1` to colocate Lambda with the current Supabase
pooler and reduce database latency.

## 4. Build

From `backend/`:

```bash
sam build --template-file template.aws.yaml --use-container
```

## 5. Deploy interactively

```bash
sam deploy --guided --resolve-image-repos
```

Recommended answers:

```text
Stack name: sanjay-portfolio-api
AWS Region: ap-southeast-1
Confirm changes before deploy: Y
Allow SAM CLI IAM role creation: Y
Disable rollback: N
PortfolioApi Function URL has no authentication: Y
Save arguments to configuration file: N
```

Enter parameters when prompted:

- `DatabaseUrl`: complete Supabase transaction pooler SQLAlchemy URL
- `SupabaseUrl`: `https://yfkruidoqgfyiqxdgapi.supabase.co`
- `SupabasePublishableKey`: Supabase Project Settings → API Keys
- `JwtSecret`: unique output of `openssl rand -hex 32`
- `OtpHashSecret`: a second unique output of `openssl rand -hex 32`
- `CorsOrigins`: exact Vercel/custom production origin

Choosing not to save arguments prevents secrets from being written to
`samconfig.toml`.

## 6. Verify

SAM prints `ApiUrl`. Test:

```text
GET <ApiUrl>/health
GET <ApiUrl>/ready
```

Expected health fields: `production`, `supabase`, `postgresql`.

## 7. Connect Vercel

Set in Vercel Production environment:

```text
NEXT_PUBLIC_API_BASE_URL=<ApiUrl without trailing slash>
NEXT_PUBLIC_SUPABASE_URL=https://yfkruidoqgfyiqxdgapi.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable key>
NEXT_PUBLIC_SITE_URL=https://portfolio-sanjay-tech.vercel.app
```

Redeploy Vercel.

## Cost controls

- Lambda memory: 512 MB
- Timeout: 20 seconds
- Reserved concurrency: 5
- No API Gateway
- No NAT Gateway or VPC attachment
- ECR stores only the deployment image; add a lifecycle rule retaining the last 3 images
- Create an AWS Budget alert at USD 1 and USD 5
