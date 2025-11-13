# Database Quick Start Guide

## TL;DR - What You Need to Do

### Right Now (Local Development)

```bash
# 1. Create migration (first time only)
npx prisma migrate dev --name init

# 2. Seed your database with products
npm run db:seed

# 3. Verify it worked
npx prisma studio
```

### When Deploying to Railway

```bash
# 1. Add PostgreSQL database in Railway dashboard
# 2. Deploy your app (migrations run automatically via build script)
# 3. Seed the Railway database (one time):
railway run npm run db:seed
```

---

## Visual Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    YOUR TWO DATABASES                        │
└─────────────────────────────────────────────────────────────┘

LOCAL DEVELOPMENT                    RAILWAY PRODUCTION
═══════════════════                  ══════════════════

┌──────────────────┐                ┌──────────────────┐
│  PostgreSQL      │                │  Railway         │
│  (localhost)     │                │  PostgreSQL      │
│                  │                │                  │
│  • Test data     │                │  • Real data     │
│  • Seeded once   │                │  • Seeded once   │
│  • Can reset     │    NO SYNC     │  • Never reset   │
│                  │  ◄─────────►   │                  │
└──────────────────┘                └──────────────────┘
        ▲                                    ▲
        │                                    │
   .env file                          Railway env vars
        │                                    │
┌──────────────────┐                ┌──────────────────┐
│  npm run dev     │                │  Railway app     │
│  localhost:3000  │                │  *.railway.app   │
└──────────────────┘                └──────────────────┘

  STRIPE TEST MODE                    STRIPE LIVE MODE
  sk_test_...                         sk_live_...
```

---

## Database Flow Explained

### 1. Schema (Shared)

Your `prisma/schema.prisma` file defines the database structure:

```
schema.prisma
    │
    ├── User, Product, Purchase, etc.
    │
    └── (same structure for both environments)
```

### 2. Migrations (Shared)

When you run `npx prisma migrate dev --name init`:

```
Creates:
prisma/migrations/
  └── 20231113_init/
      └── migration.sql

This folder is committed to git
Both local and Railway use the same migrations
```

### 3. Data (Separate!)

Each environment has its own data:

```
LOCAL DB                          RAILWAY DB
├── User #1 (you)                ├── User #1 (real customer)
├── Product "OFB"                ├── Product "OFB"
│   ├── priceId: price_test_     │   ├── priceId: price_live_
│   └── paymentPlan: price_test_ │   └── paymentPlan: price_live_
└── Purchase (test)              └── Purchase (real payment)
```

---

## Step-by-Step: First Time Setup

### Local Database Setup

**Step 1:** Make sure PostgreSQL is running

```bash
# Check if PostgreSQL is running
psql --version

# If not installed, install it first (see DATABASE_SETUP.md)
```

**Step 2:** Create the database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE mktcm;

# Exit
\q
```

**Step 3:** Set your DATABASE_URL

In your `.env` file:
```bash
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/mktcm"
```

**Step 4:** Create the schema (run migrations)

```bash
npx prisma migrate dev --name init
```

This creates all tables (User, Product, Purchase, etc.)

**Step 5:** Add initial data

```bash
npm run db:seed
```

This adds your 5 products with Stripe price IDs

**Step 6:** Verify

```bash
npx prisma studio
```

Open http://localhost:5555 and check:
- 5 products exist
- Optimal Fertility Blueprint has price IDs set

✅ **Done! Local development ready**

---

### Railway Database Setup

**Step 1:** Add PostgreSQL in Railway

1. Go to Railway dashboard
2. Click your project
3. Click **"+ New"** → **"Database"** → **"Add PostgreSQL"**
4. Railway automatically provides `DATABASE_URL`

**Step 2:** Deploy your app

Push to GitHub or run:
```bash
railway up
```

Railway automatically runs:
```bash
npm install
prisma generate          # From postinstall script
prisma migrate deploy    # From build script
next build
```

This creates all your tables in the Railway database.

**Step 3:** Seed the Railway database

```bash
# Install Railway CLI (if not already installed)
npm i -g @railway/cli

# Login
railway login

# Link your project
railway link

# Seed the database
railway run npm run db:seed
```

**Step 4:** Update environment variables

Make sure Railway has:
```bash
STRIPE_SECRET_KEY="sk_live_..."  # LIVE keys, not test!
STRIPE_PRICE_ID_OFB_ONE_TIME="price_live_..."
STRIPE_PRICE_ID_OFB_PLAN="price_live_..."
```

✅ **Done! Production ready**

---

## Key Differences Table

| Task | Local Command | Railway Command |
|------|---------------|-----------------|
| **Create migration** | `npx prisma migrate dev --name xyz` | Auto-runs on deploy |
| **Apply migrations** | Auto-applied | `prisma migrate deploy` (in build) |
| **Seed database** | `npm run db:seed` | `railway run npm run db:seed` |
| **View data** | `npx prisma studio` | `railway run npx prisma studio` |
| **Reset database** | `npx prisma migrate reset` | ❌ DON'T DO THIS |

---

## Common Questions

### Q: If I seed locally, does it seed Railway too?
**A:** No. They're completely separate databases.

### Q: Do I need to seed every time I deploy?
**A:** No! Seed once. After that, products exist and users will create new purchases through the app.

### Q: What happens when I change schema.prisma?
**A:**
1. Locally: Run `npx prisma migrate dev --name description`
2. Commit the new migration file to git
3. Deploy to Railway: Migrations auto-run via build script

### Q: Can I use the same Stripe price IDs locally and in production?
**A:**
- Locally: Use TEST price IDs (`price_test_...`)
- Railway: Use LIVE price IDs (`price_live_...`)
- They're different because test/live modes are separate in Stripe

### Q: What if I mess up my local database?
**A:** Reset it! `npx prisma migrate reset` - This is safe locally, don't do it on Railway.

### Q: How do I back up my Railway database?
**A:** Railway provides automated backups. You can also:
```bash
railway run pg_dump $DATABASE_URL > backup.sql
```

---

## Next Steps

1. ✅ Set up local database (follow steps above)
2. ✅ Test checkout flow locally with test Stripe keys
3. ✅ Deploy to Railway
4. ✅ Add Railway PostgreSQL database
5. ✅ Seed Railway database once
6. ✅ Set up production Stripe webhook
7. ✅ Test with real Stripe payment (small amount, then refund)

See [STRIPE_SETUP.md](STRIPE_SETUP.md) for webhook configuration.
