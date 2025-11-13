# Quick Start Guide

Get your TCM Fertility Member Portal up and running in minutes!

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (we recommend [Railway](https://railway.app) for easy setup)
- [Stripe account](https://stripe.com) (for payments)
- [Resend account](https://resend.com) (for emails)

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Environment Variables

1. Copy the example env file:
   ```bash
   cp .env.example .env
   ```

2. Fill in your `.env` file with the following:

```env
# Database (Railway PostgreSQL)
DATABASE_URL="postgresql://username:password@host:port/database"

# NextAuth - Generate a secret
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Stripe (get from https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..." # Get this after setting up webhooks

# Resend (get from https://resend.com/api-keys)
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="noreply@yourdomain.com"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Generate NEXTAUTH_SECRET

Run this command to generate a secure secret:
```bash
openssl rand -base64 32
```

## Step 3: Set Up Database

### Option A: Railway (Recommended)

1. Go to [railway.app](https://railway.app) and create a new project
2. Add a PostgreSQL database
3. Copy the connection string to your `.env` file as `DATABASE_URL`

### Option B: Local PostgreSQL

If you have PostgreSQL installed locally:
```bash
# Create a database
createdb mktcm_portal

# Update .env with your local connection
DATABASE_URL="postgresql://username:password@localhost:5432/mktcm_portal"
```

### Run Migrations

```bash
# Generate Prisma Client
npx prisma generate

# Create database tables
npx prisma migrate dev --name init

# Seed the database with products
npx ts-node --compiler-options {"module":"CommonJS"} lib/db/seed.ts
```

## Step 4: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

## Step 5: Create Your First Account

1. Click "Create Account" on the homepage
2. Fill in your details
3. You'll be automatically logged in and redirected to the dashboard

## Step 6: Explore the Platform

- **Homepage** - Landing page with program overview
- **Programs** - Browse all 5 programs (Free Workshop, Blueprint, etc.)
- **Dashboard** - View your purchased programs (will be empty initially)
- **Sign In/Sign Up** - Fully functional authentication

## What's Included

### ✅ Completed Features

- User authentication (signup, login, password reset flow)
- Product catalog with 5 programs
- Member dashboard
- Clean, calming design matching the Framer site aesthetic
- PostgreSQL database with Prisma ORM
- Fully responsive design

### 🚧 Coming Next (Phase 2)

- Stripe checkout integration
- Video player with progress tracking
- Email automation with Resend
- Workbook delivery system
- User profile management

## Database Exploration

Want to view your database? Use Prisma Studio:

```bash
npx prisma studio
```

This opens a GUI at [http://localhost:5555](http://localhost:5555) where you can:
- View all tables
- Add/edit data
- Explore relationships

## Common Issues

### Port 3000 already in use

```bash
# Kill the process on port 3000 (Windows)
npx kill-port 3000

# Or run on a different port
PORT=3001 npm run dev
```

### Prisma Client errors

```bash
# Regenerate Prisma Client
npx prisma generate

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset
```

### Build errors

```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build
```

## Next Steps

1. **Set up Stripe Products:**
   - Create products in Stripe Dashboard
   - Add price IDs to your products in the database

2. **Configure Email Templates:**
   - Set up Resend domain
   - Create email templates in `lib/email/templates/`

3. **Upload Video Content:**
   - Set up S3 bucket or Railway volumes
   - Add video URLs to database

4. **Customize Design:**
   - Update colors in `tailwind.config.ts`
   - Modify components in `components/`

## Support

- **Documentation:** See [README.md](README.md) for full details
- **Database Schema:** Check [prisma/schema.prisma](prisma/schema.prisma)
- **Questions:** Open an issue or contact the development team

---

Happy building! 🌱
