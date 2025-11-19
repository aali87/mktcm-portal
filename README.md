# MKTCM Fertility Portal

A modern, secure member portal and e-commerce platform for a Traditional Chinese Medicine fertility practice. Built with Next.js 14, TypeScript, PostgreSQL, and Stripe.

## Features

### Core Functionality
- ✅ Secure user authentication (email/password with password reset)
- ✅ Stripe payment integration (one-time and payment plans)
- ✅ Product catalog with multiple programs
- ✅ Protected video streaming with progress tracking
- ✅ Interactive workbook viewer with page navigation
- ✅ Downloadable PDF printables
- ✅ Bonus content gating based on payment type
- ✅ Automated transactional emails (Brevo)
- ✅ Member dashboard with purchase history
- ✅ Responsive design (mobile-first)

### Security Features
- ✅ All protected content requires authentication and purchase verification
- ✅ Duplicate purchase prevention
- ✅ Secure password hashing (bcrypt)
- ✅ Signed S3 URLs with expiration
- ✅ Stripe webhook signature verification
- ✅ SQL injection protection (Prisma ORM)
- ✅ Input validation (Zod schemas)
- ✅ No XSS vulnerabilities

## Tech Stack

- **Framework**: Next.js 14 (App Router) with TypeScript
- **Styling**: Tailwind CSS + Shadcn/ui components
- **Database**: PostgreSQL (Railway) with Prisma ORM
- **Authentication**: NextAuth.js
- **Payments**: Stripe (checkout + webhooks)
- **Email**: Brevo API (transactional emails)
- **Storage**: AWS S3 (videos, workbooks, printables)
- **Hosting**: Railway

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Stripe account
- Brevo account
- AWS S3 bucket

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Run database migrations
npx prisma migrate dev
npx prisma generate

# Start development server
npm run dev
```

Visit `http://localhost:3000`

## Deployment

See [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md) for complete deployment guide.

### Quick Deployment Steps

1. **Set environment variables** in Railway/hosting provider
2. **Run migrations**: `npx prisma migrate deploy`
3. **Configure Stripe webhook**: `https://yourdomain.com/api/webhooks/stripe`
4. **Verify email sender** in Brevo
5. **Upload content** to S3
6. **Deploy**: `git push`

## Project Structure

```
├── app/
│   ├── api/              # API routes
│   ├── auth/             # Authentication pages
│   ├── dashboard/        # Protected member area
│   └── programs/         # Public program pages
├── components/           # React components
├── lib/                  # Utilities & configurations
├── prisma/              # Database schema & migrations
└── public/              # Static assets
```

## Key API Routes

- `/api/auth/signup` - User registration
- `/api/auth/forgot-password` - Password reset request
- `/api/auth/reset-password` - Password reset confirmation
- `/api/checkout` - Create Stripe checkout session
- `/api/webhooks/stripe` - Handle Stripe events
- `/api/videos/[videoId]/url` - Get signed video URL
- `/api/workbooks/[workbookId]/pages` - Get workbook pages
- `/api/printables/[printableId]/download` - Download PDF

## Environment Variables

See [.env.example](./.env.example) for complete list.

Required:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - NextAuth.js secret
- `STRIPE_SECRET_KEY` - Stripe secret key
- `BREVO_API_KEY` - Brevo API key
- `AWS_ACCESS_KEY_ID` - AWS credentials
- `AWS_S3_BUCKET` - S3 bucket name

## Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Database
npx prisma studio          # Open Prisma Studio
npx prisma migrate dev     # Create & apply migration
npx prisma generate        # Generate Prisma Client

# Utilities
npm run lint               # Run ESLint
npx tsx scripts/clear-data.ts  # Clear user data
```

## Business Logic

### Purchase Flow
1. User creates account (free)
2. User browses programs
3. User selects payment option (one-time or plan)
4. Stripe handles payment
5. Webhook creates purchase record
6. User gains access to content

### Bonus Workbook Access
- **One-time payment**: Instant access
- **Payment plan**: Access after 3rd payment

### Content Protection
- Videos: Purchase verification + signed S3 URLs
- Workbooks: Purchase + bonus eligibility check
- Printables: Purchase verification

## Support

- **Issues**: Report bugs via GitHub Issues
- **Documentation**: See [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md)
- **Project Summary**: See [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)

## License

Private - All rights reserved

---

**Status**: Production Ready ✅
**Last Updated**: November 19, 2024
