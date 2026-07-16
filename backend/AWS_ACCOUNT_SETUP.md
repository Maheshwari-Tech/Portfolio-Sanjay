# AWS account setup for the portfolio backend

Complete this checklist before creating the Lambda deployment resources. Do not
create a Lambda function, API Gateway, EC2 instance, VPC, or RDS database
manually. The repository's SAM deployment will create the required Lambda
resources later.

## Values to use

| Setting | Value |
| --- | --- |
| Account name | `sanjay-portfolio-production` |
| Primary workload region | `Asia Pacific (Singapore)` |
| AWS region code | `ap-southeast-1` |
| Support plan | `Basic Support` |
| Monthly cost target | `USD 1` |
| Production GitHub repository | `Maheshwari-Tech/Portfolio-Sanjay` |

Singapore is selected because the configured Supabase pooler is in
`ap-southeast-1`. Keeping Lambda and the database in the same AWS region reduces
database latency and avoids cross-region AWS traffic in the backend path.

## 1. Create the AWS account

1. Open <https://portal.aws.amazon.com/billing/signup>.
2. Enter an email address that you control and can retain long term.
3. Use `sanjay-portfolio-production` as the AWS account name.
4. Verify the email address.
5. Create a unique root password and save it in a password manager.
6. Choose the **Paid account plan**. This is pay-as-you-go, not a monthly
   subscription. It is the appropriate plan for a production endpoint and new
   accounts still receive eligible AWS credits.
7. Enter India as the billing/contact country and provide the requested address
   and phone details.
8. Add a valid payment card. AWS India may make and refund a small verification
   charge.
9. Complete SMS/phone identity verification.
10. Choose **Basic Support**. Do not select Developer, Business, or Enterprise
    support for this project.
11. Wait for the account activation email, then sign in as the root user.

Completion check: the AWS console opens and the top-right account menu shows
`sanjay-portfolio-production`.

## 2. Secure the root user immediately

1. In the top-right account menu, choose **Security credentials**.
2. Under **Multi-factor authentication (MFA)**, choose **Assign MFA device**.
3. Prefer a passkey/security key. A virtual authenticator such as 1Password,
   Google Authenticator, Microsoft Authenticator, or Authy is also acceptable.
4. Register a second MFA device if one is available, then store it separately.
5. Confirm the root user has **no access keys**. Do not create one.
6. Store the root password and MFA recovery details securely.

Use the root user only for account-level operations that require it. Do not use
root credentials in GitHub, local `.env` files, AWS CLI configuration, or the
application.

Completion check: the root security-credentials page reports MFA as assigned
and shows no active root access keys.

## 3. Set account contacts and tax information

1. Open the top-right account menu -> **Account**.
2. Confirm the primary address and phone number are correct.
3. Add alternate contacts for:
   - Billing
   - Operations
   - Security
4. Use email addresses that you actively monitor.
5. Open **Billing and Cost Management** -> **Tax settings**.
6. Add GST details only if this account belongs to a GST-registered business.
   Otherwise leave the business tax registration empty and allow AWS India to
   apply the required tax.

Completion check: billing and security notifications go to an email address you
will notice quickly.

## 4. Enable cost and Free Tier notifications

1. Open **Billing and Cost Management**.
2. Choose **Billing preferences**.
3. Enable **AWS Free Tier usage alerts**.
4. Enable invoice/billing alerts where available.
5. Enter the email address that should receive these alerts.
6. Save the preferences.

### Create a zero-spend warning

1. Billing and Cost Management -> **Budgets** -> **Create budget**.
2. Choose **Use a template (simplified)**.
3. Choose **Zero spend budget**.
4. Name it `portfolio-zero-spend-warning`.
5. Enter your alert email and create the budget.

### Create the ₹100 target budget

AWS budgets use USD. A `USD 1` budget is approximately the ₹100 target; taxes
and exchange rates can cause the final card charge to differ.

1. Budgets -> **Create budget**.
2. Choose **Customize (advanced)** -> **Cost budget**.
3. Name it `portfolio-monthly-usd-1`.
4. Period: **Monthly**.
5. Renewal: **Recurring**.
6. Budgeting method: **Fixed**.
7. Amount: `1 USD`.
8. Use unblended costs and include all AWS services.
9. Add email alerts at:
   - 50% actual
   - 80% actual
   - 100% actual
   - 100% forecasted
10. Create the budget.

An AWS Budget is an alert, not a real-time hard spending cap. Billing data and
budget notifications can be delayed, so reserved concurrency and service-level
limits will also be configured during the Lambda deployment.

Completion check: the Budgets page shows both
`portfolio-zero-spend-warning` and `portfolio-monthly-usd-1`.

## 5. Create a non-root console administrator

For this single-account setup, create one console-only administrator and protect
it with MFA. If the AWS account later has multiple operators, migrate human
access to IAM Identity Center.

1. Open **IAM** -> **Users** -> **Create user**.
2. Username: `sanjay-admin`.
3. Enable access to the AWS Management Console.
4. Create a strong unique password and require a password reset at first sign-in.
5. Attach the AWS-managed `AdministratorAccess` policy.
6. Create the user.
7. Open the user -> **Security credentials** -> assign MFA.
8. Do **not** create an access key for this user.
9. Sign out of the root account.
10. Sign back in as `sanjay-admin` and verify that the AWS console opens.

`AdministratorAccess` is used for the initial one-person account bootstrap. The
GitHub deployment will use a separate tightly trusted OIDC role with temporary
credentials, not this administrator and not an access key.

Completion check: daily console access works through `sanjay-admin` with MFA,
and the root user is signed out.

## 6. Select the workload region and record identifiers

1. In the console region selector, choose **Asia Pacific (Singapore)**.
2. Confirm the region code is `ap-southeast-1`.
3. Open the account menu and copy the 12-digit **Account ID** into your password
   manager or deployment notes.
4. Do not post the account ID together with credentials or recovery details.
5. Do not enable additional AWS regions unless they are needed.

Completion check:

```text
Account: sanjay-portfolio-production
Region: ap-southeast-1
Root MFA: enabled
Root access keys: none
Admin MFA: enabled
Budget alerts: enabled
Support plan: Basic
```

## Stop here

The AWS account is now ready for the deployment bootstrap. The next phase is:

1. Create the GitHub OIDC identity provider in AWS IAM.
2. Create the restricted GitHub deployment role.
3. Create the ECR repository used for the Lambda image.
4. Add the GitHub `production` environment variables and secrets.
5. Let GitHub Actions create the Lambda and CloudFormation stack.
6. Verify `/health` and `/ready`, then connect Vercel to the Lambda Function URL.

Do not manually create these resources before following the Lambda deployment
runbook in `AWS_LAMBDA_DEPLOYMENT.md`.
