# TCM Fertility Member Portal & E-Commerce Platform

A modern, full-stack member portal and e-commerce platform for a Traditional Chinese Medicine fertility practice. Built with Next.js 14, TypeScript, PostgreSQL, and Stripe.

## Features

### Phase 1 (Current)
- ✅ User authentication (email/password signup, login, password reset)
- ✅ Product catalog with 5 programs
- ✅ Member dashboard with purchase tracking
- ✅ Clean, calming design aesthetic matching Framer site
- ✅ PostgreSQL database with Prisma ORM
- ✅ Responsive design (mobile-first)
- 🚧 Stripe checkout (integration ready)
- 🚧 Video delivery & progress tracking
- 🚧 Email automation with Resend

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Shadcn/ui components
- **Database:** PostgreSQL (via Railway)
- **ORM:** Prisma
- **Authentication:** NextAuth.js
- **Payments:** Stripe
- **Email:** Resend
- **Fonts:** Inter (sans-serif), Crimson Text (serif)

## Design System

### Colors
- **Primary:** `#7fa69b` (Sage green)
- **Neutral:** Warm grays and creams
- **Background:** White to light beige gradient

### Typography
- **Headings:** Crimson Text (serif)
- **Body:** Inter (sans-serif)
- **Hierarchy:** Clean, spacious, calming

## Getting Started

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database (Railway recommended)
- Stripe account
- Resend account (for emails)

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add:
   ```env
   DATABASE_URL="postgresql://user:password@host:port/database"
   NEXTAUTH_SECRET="your-generated-secret"
   NEXTAUTH_URL="http://localhost:3000"
   STRIPE_SECRET_KEY="sk_test_..."
   STRIPE_PUBLISHABLE_KEY="pk_test_..."
   RESEND_API_KEY="re_..."
   ```

   Generate a secret for `NEXTAUTH_SECRET`:
   ```bash
   openssl rand -base64 32
   ```

3. **Set up the database:**
   ```bash
   # Generate Prisma Client
   npx prisma generate

   # Run database migrations
   npx prisma migrate dev --name init

   # Seed the database with products
   npx ts-node --compiler-options {"module":"CommonJS"} lib/db/seed.ts
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

## Database Schema

### Core Models
- **User** - User accounts with authentication
- **Product** - Programs and digital products
- **Purchase** - Purchase transactions
- **Video** - Video content for programs
- **UserProgress** - Video watch progress tracking
- **Workbook** - Downloadable resources
- **EmailDelivery** - Email automation tracking

See [prisma/schema.prisma](prisma/schema.prisma) for full schema.

## Project Structure

```
/app
  /auth              # Authentication pages (login, signup, reset)
  /dashboard         # Protected member dashboard
  /programs          # Product catalog and program pages
  /api
    /auth            # NextAuth & signup API
    /stripe          # Stripe webhooks (TODO)
/components
  /ui                # Shadcn UI components
  /layout            # Header, Footer
/lib
  /auth              # NextAuth configuration
  /db                # Prisma client & seed
  /stripe            # Stripe utilities (TODO)
  /email             # Resend email templates (TODO)
/prisma              # Database schema & migrations
```

## Products

1. **Free Workshop** - 3 introductory videos (Free)
2. **Optimal Fertility Blueprint** - 9-week program with workbooks ($149)
3. **Stress-free Goddess Program** - Stress management ($29)
4. **Fearlessly Fertile Yoga** - Yoga sequences ($15)
5. **Free Printables** - Downloadable resources (Free)

## Deployment

### Railway (Recommended)

1. **Create new project on Railway**
2. **Add PostgreSQL database**
3. **Deploy from GitHub:**
   - Connect your repository
   - Add environment variables
   - Railway will auto-deploy on push

4. **Run database migrations:**
   ```bash
   railway run npx prisma migrate deploy
   railway run npx ts-node --compiler-options {"module":"CommonJS"} lib/db/seed.ts
   ```

### Environment Variables for Production
Make sure to set all variables from `.env.example` in Railway dashboard.

## Next Steps (TODO)

### Stripe Integration
- [ ] Create Stripe checkout sessions
- [ ] Handle payment success/failure
- [ ] Implement webhook handlers
- [ ] Auto-grant access after payment
- [ ] Payment plan support

### Video Delivery
- [ ] Set up video storage (S3 or Railway volumes)
- [ ] Implement secure video player
- [ ] Track watch progress
- [ ] Resume playback functionality

### Email Automation
- [ ] Welcome email on signup
- [ ] Purchase confirmation emails
- [ ] Weekly workbook delivery (Blueprint program)
- [ ] Password reset emails

### Additional Features
- [ ] User profile page
- [ ] Password change functionality
- [ ] Admin dashboard for content management
- [ ] Analytics and reporting
- [ ] Review/testimonial system

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Prisma commands
npx prisma studio    # Open Prisma Studio (DB GUI)
npx prisma generate  # Generate Prisma Client
npx prisma migrate dev  # Create & run migrations
```

## Security Considerations

- ✅ Passwords hashed with bcrypt
- ✅ Protected routes with NextAuth middleware
- ✅ Input validation with Zod
- ✅ SQL injection protection via Prisma
- 🚧 CSRF protection (configure in production)
- 🚧 Rate limiting (add for production)
- 🚧 Content Security Policy headers

## Support

For questions or issues, please contact the development team.

---

Built with ❤️ for fertility journeys
