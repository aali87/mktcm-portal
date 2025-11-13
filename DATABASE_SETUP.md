# Database Setup Guide

This guide covers setting up your PostgreSQL database for both local development and Railway production.

## Overview

You have **two completely separate databases**:
- **Local**: For development and testing
- **Railway**: For production with real users

Data does **not** sync between them. Each environment needs its own setup.

---

## Local Development Setup

### 1. Install PostgreSQL

If you don't have PostgreSQL installed locally:

**Windows:**
```bash
# Using chocolatey
choco install postgresql

# Or download from: https://www.postgresql.org/download/windows/
```

**Mac:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux:**
```bash
sudo apt-get install postgresql postgresql-contrib
```

### 2. Create Local Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE mktcm;

# Create user (optional - or use postgres user)
CREATE USER mktcm_user WITH PASSWORD 'your_password_here';
GRANT ALL PRIVILEGES ON DATABASE mktcm TO mktcm_user;

# Exit
\q
```

### 3. Set DATABASE_URL in .env

Add to your `.env` file:

```bash
# Option 1: Using postgres superuser
DATABASE_URL="postgresql://postgres:your_postgres_password@localhost:5432/mktcm"

# Option 2: Using custom user
DATABASE_URL="postgresql://mktcm_user:your_password_here@localhost:5432/mktcm"
```

### 4. Create Database Schema

Run Prisma migration to create all tables:

```bash
npx prisma migrate dev --name init
```

This will:
- Create a `prisma/migrations` folder
- Generate SQL migration files
- Apply the migration to your local database
- Regenerate Prisma Client

### 5. Seed the Database

```bash
npm run db:seed
```

This adds:
- Free Workshop
- Optimal Fertility Blueprint (with your Stripe price IDs)
- Stress-free Goddess Program
- Fearlessly Fertile Yoga
- Free Printables

### 6. Verify Setup

```bash
# Open Prisma Studio to view your data
npx prisma studio
```

Navigate to `http://localhost:5555` and check:
- All products are there
- Optimal Fertility Blueprint has `priceId` and `paymentPlanPriceId` set

---

## Railway Production Setup

### 1. Add PostgreSQL to Railway

1. Go to your Railway project dashboard
2. Click **"+ New"** → **"Database"** → **"Add PostgreSQL"**
3. Railway automatically:
   - Creates a PostgreSQL instance
   - Sets `DATABASE_URL` environment variable
   - Links it to your app service

### 2. Deploy Your App

When you deploy to Railway (via GitHub or Railway CLI), Railway will:

```bash
# Automatically run (if configured in package.json):
npm install
npx prisma generate
npx prisma migrate deploy  # Applies migrations
npm run build
npm start
```

### 3. Configure Build Command

Add to your `package.json`:

```json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy && next build",
    "postinstall": "prisma generate"
  }
}
```

Or configure in Railway dashboard:
- **Build Command**: `npm install && npx prisma generate && npx prisma migrate deploy && npm run build`
- **Start Command**: `npm start`

### 4. Seed Production Database

**Option 1: Railway CLI (Recommended)**

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and link project
railway login
railway link

# Run seed command on Railway
railway run npm run db:seed
```

**Option 2: One-Time Deployment Script**

Create a temporary API route that seeds the database:

```typescript
// app/api/admin/seed/route.ts
import { NextResponse } from 'next/server';
import { execSync } from 'child_process';

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');

  // Protect this endpoint!
  if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    execSync('npm run db:seed', { stdio: 'inherit' });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Seed failed' }, { status: 500 });
  }
}
```

Then call it once:
```bash
curl -X POST https://your-app.railway.app/api/admin/seed \
  -H "Authorization: Bearer your-admin-secret"
```

**Delete this route after seeding!**

**Option 3: Prisma Studio (Railway)**

1. Install Railway CLI and link project
2. Run: `railway run npx prisma studio`
3. Manually add products via the GUI

### 5. Update Production Stripe Price IDs

Make sure your Railway environment variables include:

```bash
STRIPE_PRICE_ID_OFB_ONE_TIME="price_xxx"  # Your Stripe price ID
STRIPE_PRICE_ID_OFB_PLAN="price_yyy"      # Your Stripe price ID
```

These will be used when the seed script runs.

---

## Key Differences: Local vs Production

| Aspect | Local | Railway Production |
|--------|-------|-------------------|
| **Database** | Your local PostgreSQL | Railway-hosted PostgreSQL |
| **URL** | localhost:5432 | Random Railway host |
| **Data** | Test data, seed data | Real customer data |
| **Stripe** | Test mode keys (`sk_test_`) | Live mode keys (`sk_live_`) |
| **Migrations** | `prisma migrate dev` | `prisma migrate deploy` |
| **Seed** | Manual (`npm run db:seed`) | One-time via Railway CLI |

---

## Common Workflows

### Making Schema Changes

**Local:**
```bash
# 1. Edit prisma/schema.prisma
# 2. Create and apply migration
npx prisma migrate dev --name add_new_field

# 3. This creates a migration file and updates your DB
```

**Railway:**
```bash
# 1. Commit schema changes to git
# 2. Push to GitHub
# 3. Railway auto-deploys and runs: prisma migrate deploy
```

### Resetting Local Database

```bash
# Warning: This deletes all data!
npx prisma migrate reset

# This will:
# - Drop the database
# - Recreate it
# - Run all migrations
# - Run seed script (if configured)
```

### Viewing Database Data

**Local:**
```bash
npx prisma studio
# Opens http://localhost:5555
```

**Railway:**
```bash
railway run npx prisma studio
# Opens Prisma Studio connected to production DB
# BE CAREFUL - this is live data!
```

---

## Troubleshooting

### "No such table" error
You haven't run migrations yet:
```bash
npx prisma migrate dev
```

### "Can't reach database server"
Check your DATABASE_URL:
```bash
# Test connection
psql $DATABASE_URL
```

### Schema changes not applying
Regenerate Prisma Client:
```bash
npx prisma generate
```

### Railway: Migration failed
Check Railway logs:
1. Go to Railway dashboard
2. Click on your service
3. View **Deployments** tab
4. Check logs for errors

### Seed script not running on Railway
Make sure:
- `db:seed` script is in package.json
- Environment variables (STRIPE_PRICE_ID_*) are set
- You run it manually via `railway run npm run db:seed`

---

## Best Practices

1. **Never use production database URL locally** - Always use separate databases
2. **Commit migrations to git** - The `prisma/migrations` folder should be in version control
3. **Test migrations locally first** - Before deploying to Railway
4. **Backup production data** - Railway provides automated backups, but verify they're enabled
5. **Use Railway CLI for production tasks** - Safer than direct database access
6. **Don't seed production repeatedly** - Seed once, then manage data via admin UI or API

---

## Quick Reference

```bash
# Local Development
npx prisma migrate dev --name description  # Create and apply migration
npx prisma studio                          # View/edit data
npm run db:seed                            # Seed database
npx prisma migrate reset                   # Reset database (destructive!)

# Railway Production
railway run npm run db:seed                # Seed production DB
railway run npx prisma studio              # View production data
railway logs                               # View deployment logs
```

---

## What About Stripe Webhooks?

Webhooks work differently in each environment:

**Local:**
- Use Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- Creates test webhook events
- Gives you a webhook secret: `whsec_xxx`

**Railway:**
- Configure webhook in Stripe Dashboard
- Endpoint: `https://your-app.railway.app/api/webhooks/stripe`
- Get webhook secret from Stripe and add to Railway env vars
- Webhooks are sent automatically by Stripe when events occur

See [STRIPE_SETUP.md](STRIPE_SETUP.md) for detailed webhook setup.
