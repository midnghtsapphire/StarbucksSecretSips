# Secret Sips — Deployment Runbook

## Prerequisites

Before deploying, ensure the following are configured:

| Requirement | Where to Configure | Notes |
|---|---|---|
| Database URL | Environment variable `DATABASE_URL` | MySQL/TiDB connection string |
| Stripe Keys | Settings > Payment | Test keys auto-configured; live keys after KYC |
| OAuth | Auto-configured | Manus OAuth handles Google/Apple/email |
| S3 Storage | Auto-configured | Built-in storage helpers |

## Deployment Steps

### 1. Verify Build

Run the build locally to ensure no compilation errors:

```bash
pnpm build
```

### 2. Run Tests

Ensure all tests pass before deploying:

```bash
pnpm test
```

### 3. Database Migrations

Push any pending schema changes:

```bash
pnpm db:push
```

### 4. Deploy via Manus

Click the **Publish** button in the Management UI header. This creates a production build and deploys to the Manus hosting infrastructure.

### 5. Post-Deployment Verification

After deployment, verify the following:

| Check | URL | Expected |
|---|---|---|
| Landing page loads | `/` | Hero section visible, no JS errors |
| OAuth login works | Click "Sign In" | Redirects to Manus OAuth portal |
| Recipe grid loads | `/explore` | Recipes display with images |
| AI Mixer works | `/ai-customizer` | Form renders, generates drink on submit |
| Stripe webhook | Dashboard > Webhooks | Events delivered successfully |

### 6. Stripe Configuration

For live payments, the project owner must:

1. Claim the Stripe sandbox at the provided URL
2. Complete Stripe KYC verification
3. Enter live keys in Settings > Payment
4. Test with the 99% discount promo code (minimum $0.50 order)

## Rollback

If issues are found after deployment, use the Management UI to rollback to a previous checkpoint. All checkpoints are preserved and can be restored instantly.

## Monitoring

Server logs are available in `.manus-logs/`:

| Log File | Contents |
|---|---|
| `devserver.log` | Server startup, Express warnings, tRPC errors |
| `browserConsole.log` | Client-side console output with stack traces |
| `networkRequests.log` | HTTP requests with URL, status, duration |
| `sessionReplay.log` | User interaction events |

## Attribution

This application is built entirely with free and open-source software. Third-party integrations (Stripe payments, Manus OAuth, AI services) are provided by their respective platforms.
