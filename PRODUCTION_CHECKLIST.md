# Production Deployment Checklist

## Pre-Deployment Security Audit ✅

### Authentication & Authorization
- ✅ All API routes require authentication where needed
- ✅ Purchase verification on all protected resources (videos, workbooks, printables)
- ✅ Bonus workbook access properly gated by payment type
- ✅ Duplicate purchase prevention implemented
- ✅ Password reset with secure token system (1-hour expiration)
- ✅ No authentication bypass vulnerabilities

### Data Security
- ✅ No hardcoded secrets or API keys in code
- ✅ All sensitive data in environment variables
- ✅ Passwords hashed with bcrypt
- ✅ Database queries use Prisma ORM (SQL injection protected)
- ✅ .env file properly gitignored
- ✅ S3 signed URLs with expiration (1 hour)

### Code Security
- ✅ No `dangerouslySetInnerHTML` usage (XSS protected)
- ✅ No `eval()` or `Function()` usage
- ✅ Input validation using Zod schemas
- ✅ CSRF protection via NextAuth
- ✅ Debug API routes removed

### API Security
- ✅ Rate limiting on auth endpoints (via Railway/hosting provider)
- ✅ Proper HTTP status codes (401, 403, 404, 500)
- ✅ Error messages don't leak sensitive information
- ✅ Stripe webhook signature verification
- ✅ Force dynamic rendering on all API routes

## Environment Variables Required

### Authentication
```
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
NEXTAUTH_URL=<your production URL>
```

### Database
```
DATABASE_URL=<Railway PostgreSQL connection string>
```

### Stripe
```
STRIPE_SECRET_KEY=<live key: sk_live_...>
STRIPE_PUBLISHABLE_KEY=<live key: pk_live_...>
STRIPE_WEBHOOK_SECRET=<webhook signing secret>
STRIPE_PRICE_ID_OFB_ONE_TIME=<price ID for one-time payment>
STRIPE_PRICE_ID_OFB_PLAN=<price ID for payment plan>
```

### Brevo (Email)
```
BREVO_API_KEY=<your Brevo API key>
BREVO_FROM_EMAIL=<verified sender email>
BREVO_FROM_NAME=<sender name>
```

### AWS S3
```
AWS_ACCESS_KEY_ID=<IAM user access key>
AWS_SECRET_ACCESS_KEY=<IAM user secret key>
AWS_REGION=<e.g., us-east-1>
AWS_S3_BUCKET=<bucket name>
```

### App
```
NEXT_PUBLIC_APP_URL=<your production URL>
```

## Pre-Deployment Tasks

### 1. Database Migration
```bash
npx prisma migrate deploy
npx prisma generate
```

### 2. Build Test
```bash
npm run build
```

### 3. Environment Variables
- [ ] All production environment variables set in Railway/hosting provider
- [ ] Verified Stripe webhook endpoint configured
- [ ] Verified AWS S3 bucket permissions
- [ ] Verified Brevo sender email

### 4. Stripe Configuration
- [ ] Switch to live mode API keys
- [ ] Create production price IDs
- [ ] Configure webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`
- [ ] Enable webhook events:
  - `checkout.session.completed`
  - `checkout.session.async_payment_succeeded`
  - `checkout.session.async_payment_failed`
  - `invoice.payment_succeeded`

### 5. Email Configuration
- [ ] Verify sender domain/email in Brevo
- [ ] Test all three email types:
  - Welcome email
  - Purchase confirmation
  - Password reset

### 6. S3 Configuration
- [ ] Bucket CORS configured for your domain
- [ ] IAM user has proper permissions (GetObject, ListBucket)
- [ ] All videos/workbooks/printables uploaded
- [ ] Test signed URL generation

## Post-Deployment Verification

### Critical User Flows
- [ ] User signup + welcome email
- [ ] User login
- [ ] Password reset flow
- [ ] Free workshop claim
- [ ] Free printables access
- [ ] Paid product purchase (one-time)
- [ ] Paid product purchase (payment plan)
- [ ] Purchase confirmation email
- [ ] Video playback with progress tracking
- [ ] Workbook viewing with page navigation
- [ ] Printable PDF download
- [ ] Bonus workbook access (full payment vs plan)

### Security Tests
- [ ] Cannot access videos without purchase
- [ ] Cannot access workbooks without purchase
- [ ] Cannot access bonus workbook without eligibility
- [ ] Cannot purchase same product twice
- [ ] Cannot access other users' content
- [ ] S3 URLs expire after 1 hour
- [ ] Password reset tokens expire after 1 hour

### Performance Tests
- [ ] Page load times < 3 seconds
- [ ] Video streaming works smoothly
- [ ] Workbook pages load quickly
- [ ] Mobile responsive on all pages

## Monitoring & Maintenance

### Set Up Monitoring
- [ ] Railway/hosting provider alerts configured
- [ ] Database performance monitoring
- [ ] Error tracking (consider: Sentry)
- [ ] Stripe dashboard alerts

### Regular Maintenance
- [ ] Weekly database backups
- [ ] Monitor failed payment webhook events
- [ ] Review authentication logs for suspicious activity
- [ ] Keep dependencies updated (npm audit)

## Rollback Plan

If critical issues occur:

1. **Database**: Railway provides automatic backups
2. **Code**: Revert to previous git commit and redeploy
3. **Stripe**: Keep test mode as backup during first week

## Support Contact

- Railway Database: Railway dashboard
- Stripe Issues: Stripe dashboard > Webhooks
- AWS S3 Issues: AWS Console > S3
- Brevo Email: Brevo dashboard

---

## Security Best Practices Implemented

✅ **Authentication**: NextAuth.js with secure session management
✅ **Authorization**: Purchase verification on all protected routes
✅ **Data Protection**: Prisma ORM prevents SQL injection
✅ **Password Security**: bcrypt hashing with salt rounds
✅ **Token Security**: Cryptographically secure random tokens
✅ **Rate Limiting**: Handled at hosting provider level
✅ **HTTPS**: Enforced via hosting provider
✅ **Input Validation**: Zod schemas on all API inputs
✅ **Error Handling**: No sensitive data leaked in errors
✅ **Webhook Security**: Stripe signature verification

---

**Last Updated**: November 19, 2024
**Production Ready**: ✅ YES
