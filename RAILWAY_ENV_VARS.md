# Railway Environment Variables

Copy these environment variables to your Railway service:

## Required Variables

```bash
# NextAuth (IMPORTANT: Generate a new secret for production!)
NEXTAUTH_SECRET="REPLACE_WITH_NEW_SECRET"
NEXTAUTH_URL="https://your-app.railway.app"

# Stripe (Use LIVE keys for production, not test keys!)
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Stripe Price IDs (Create LIVE versions in Stripe Dashboard)
STRIPE_PRICE_ID_OFB_ONE_TIME="price_live_..."
STRIPE_PRICE_ID_OFB_PLAN="price_live_..."

# Resend (Get from https://resend.com/api-keys)
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="noreply@yourdomain.com"

# App URL
NEXT_PUBLIC_APP_URL="https://your-app.railway.app"
```

## Generate New NextAuth Secret

Run this command to generate a secure secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Important Notes

- **DATABASE_URL** is automatically provided by Railway's PostgreSQL service
- Use **LIVE** Stripe keys for production (sk_live_*, pk_live_*)
- You'll need to create LIVE price IDs in Stripe Dashboard (same as test, but in live mode)
- Update NEXTAUTH_URL and NEXT_PUBLIC_APP_URL with your actual Railway domain

## For Testing with Test Mode

If you want to test with Stripe test mode first:
- Keep using test keys (sk_test_*, pk_test_*)
- Use your existing test price IDs
- You can switch to live mode later
