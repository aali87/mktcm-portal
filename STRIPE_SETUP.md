# Stripe Integration Setup Guide

This guide walks you through setting up Stripe checkout for the TCM Fertility Member Portal.

## Prerequisites

- Stripe account (sign up at https://stripe.com)
- Development environment running locally
- Database seeded with products

## Step 1: Get Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Make sure you're in **Test Mode** (toggle in top right)
3. Copy your keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`) - click "Reveal test key"

4. Add to your `.env` file:
```bash
STRIPE_SECRET_KEY="sk_test_YOUR_KEY_HERE"
STRIPE_PUBLISHABLE_KEY="pk_test_YOUR_KEY_HERE"
```

## Step 2: Create Stripe Products and Prices

### Create the Optimal Fertility Blueprint Product

1. Go to [Stripe Products](https://dashboard.stripe.com/test/products)
2. Click **"+ Add product"**
3. Fill in:
   - **Name**: Optimal Fertility Blueprint
   - **Description**: 9-week comprehensive fertility program with TCM principles
   - **Image**: (optional - upload program image)

### Create One-Time Payment Price

1. Under "Pricing", click **"Add another price"**
2. Set:
   - **Pricing model**: Standard pricing
   - **Price**: $149.00 USD
   - **Billing period**: One time
3. Click **"Save product"**
4. Copy the **Price ID** (starts with `price_`) - you'll need this

### Create Payment Plan Price

1. Click **"Add another price"** on the same product
2. Set:
   - **Pricing model**: Standard pricing
   - **Price**: $59.00 USD
   - **Billing period**: Monthly
   - **Number of billing cycles**: 3
3. Click **"Save"**
4. Copy this **Price ID** as well

### Add Price IDs to Environment

Add both Price IDs to your `.env`:
```bash
STRIPE_PRICE_ID_OFB_ONE_TIME="price_xxxxxxxxxxxxx"  # $149 one-time
STRIPE_PRICE_ID_OFB_PLAN="price_yyyyyyyyyyyyy"     # 3 × $59/month
```

## Step 3: Update Database with Price IDs

Run the seed script to add the Price IDs to your database:

```bash
npm run db:seed
```

Or manually update in Prisma Studio:
```bash
npx prisma studio
```

Navigate to the `Product` table, find "Optimal Fertility Blueprint", and add:
- `priceId`: Your one-time payment Price ID
- `paymentPlanPriceId`: Your payment plan Price ID

## Step 4: Set Up Stripe Webhook

Webhooks allow Stripe to notify your app when payments succeed.

### For Local Development (Stripe CLI)

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login:
   ```bash
   stripe login
   ```
3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
4. Copy the webhook signing secret (starts with `whsec_`)
5. Add to `.env`:
   ```bash
   STRIPE_WEBHOOK_SECRET="whsec_xxxxxxxxxxxxx"
   ```

**Keep the `stripe listen` command running while testing!**

### For Production (Railway)

1. Go to [Stripe Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Click **"Add endpoint"**
3. Set:
   - **Endpoint URL**: `https://your-app.railway.app/api/webhooks/stripe`
   - **Events to send**: Select these events:
     - `checkout.session.completed`
     - `checkout.session.async_payment_succeeded`
     - `checkout.session.async_payment_failed`
4. Click **"Add endpoint"**
5. Copy the **Signing secret** (starts with `whsec_`)
6. Add to Railway environment variables:
   ```bash
   STRIPE_WEBHOOK_SECRET="whsec_xxxxxxxxxxxxx"
   ```

## Step 5: Test the Checkout Flow

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Make sure Stripe CLI is forwarding webhooks:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

3. Navigate to a program page:
   ```
   http://localhost:3000/programs/optimal-fertility-blueprint
   ```

4. Click **"Enroll Now"**

5. Use Stripe test cards:
   - **Successful payment**: `4242 4242 4242 4242`
   - **Requires authentication**: `4000 0025 0000 3155`
   - **Declined**: `4000 0000 0000 9995`

   For all cards:
   - **Expiry**: Any future date (e.g., 12/34)
   - **CVC**: Any 3 digits (e.g., 123)
   - **ZIP**: Any 5 digits (e.g., 12345)

6. Complete the test payment

7. Verify the purchase:
   - Check your terminal for webhook events
   - Go to `http://localhost:3000/dashboard`
   - You should see the purchased program

## Step 6: Verify Webhook is Working

After completing a test purchase:

1. Check the Stripe CLI output - you should see:
   ```
   [200] POST /api/webhooks/stripe [evt_xxxxx]
   ```

2. Check your app logs for:
   ```
   Purchase created: [purchase-id]
   ```

3. Check your database (Prisma Studio):
   ```bash
   npx prisma studio
   ```
   - Open the `Purchase` table
   - You should see a new record with status `COMPLETED`

## Troubleshooting

### "No signature provided" error
- Make sure Stripe CLI is running (`stripe listen`)
- Check that webhook secret is in `.env`

### "Invalid signature" error
- Webhook secret doesn't match
- Restart your dev server after updating `.env`

### "Product not found" error
- Run database seed: `npm run db:seed`
- Check that products exist in database

### Checkout redirects but no purchase recorded
- Check webhook is receiving events (Stripe CLI output)
- Check app logs for errors
- Verify webhook secret is correct

### Payment plan not showing
- Make sure `paymentPlanPriceId` is set in database
- Check that you created a recurring price in Stripe

## Next Steps

Once testing is complete:

1. **Switch to Live Mode** in Stripe Dashboard
2. Create the same products/prices in Live mode
3. Get your **Live API keys** (start with `pk_live_` and `sk_live_`)
4. Update Railway environment variables with live keys
5. Set up production webhook endpoint
6. Test with real payment (refund after testing)

## Test Card Reference

| Scenario | Card Number | Expected Behavior |
|----------|-------------|-------------------|
| Success | 4242 4242 4242 4242 | Payment succeeds |
| 3D Secure | 4000 0025 0000 3155 | Requires authentication |
| Declined | 4000 0000 0000 9995 | Card is declined |
| Insufficient funds | 4000 0000 0000 9995 | Insufficient funds error |

More test cards: https://stripe.com/docs/testing

## API Routes Created

- `POST /api/checkout` - Creates checkout session
- `POST /api/webhooks/stripe` - Handles Stripe events
- `GET /api/checkout/success` - Verifies purchase and redirects

## Key Files

- [lib/stripe.ts](lib/stripe.ts) - Stripe client configuration
- [app/api/checkout/route.ts](app/api/checkout/route.ts) - Checkout session creation
- [app/api/webhooks/stripe/route.ts](app/api/webhooks/stripe/route.ts) - Webhook handler
- [app/api/checkout/success/route.ts](app/api/checkout/success/route.ts) - Success callback
- [components/EnrollButton.tsx](components/EnrollButton.tsx) - Checkout UI component
- [app/programs/[slug]/page.tsx](app/programs/[slug]/page.tsx) - Program detail page
