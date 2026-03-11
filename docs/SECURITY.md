# Security

## API keys and secrets

- **Never commit secret keys** to the repository or share them in chat/email. This includes:
  - Stripe secret keys (`sk_live_...`, `sk_test_...`)
  - Stripe webhook signing secrets (`whsec_...`)
  - JWT secrets, database credentials, and any other secrets
- **If a secret was exposed:** Revoke or rotate it immediately in the provider’s dashboard (e.g. [Stripe API keys](https://dashboard.stripe.com/apikeys)), then create a new secret and set it only in environment variables or Worker secrets.
- Use **environment variables** or **Cloudflare Worker secrets** (`wrangler secret put ...`) for all secrets. The repo and `.env.example` document variable names but must never contain real secret values.

## Stripe

- The **secret key** is used only on the server (Cloudflare Worker). Set it with:  
  `npx wrangler secret put STRIPE_SECRET_KEY`
- The **publishable key** (`pk_live_...` or `pk_test_...`) can be used in the frontend if you add Stripe.js; for Checkout redirect-only flow it is optional.
- Webhook signature verification uses `STRIPE_WEBHOOK_SECRET`; set it with  
  `npx wrangler secret put STRIPE_WEBHOOK_SECRET`
