# Video Delivery System - Setup Guide

## Overview

Complete video delivery system for the TCM Fertility Member Portal, starting with the Free Workshop product. Videos are stored in AWS S3 and delivered via signed URLs with progress tracking.

## ✅ What's Been Implemented

### 1. AWS S3 Integration
- **File:** [lib/s3.ts](lib/s3.ts)
- S3 client configuration using environment variables
- `getSignedVideoUrl()` function generates secure, time-limited URLs (1-hour expiration)
- Prevents direct access to S3 objects

### 2. Free Workshop Landing Page
- **File:** [app/programs/free-workshop/page.tsx](app/programs/free-workshop/page.tsx)
- **Route:** `/programs/free-workshop`
- Marketing page with compelling copy and video module overview
- Shows "Get Free Access" for non-logged-in users → redirects to signup
- Shows "Start Workshop Now" for logged-in users without access → claims free access
- Auto-redirects to dashboard if user already has access

### 3. Free Access Claim API
- **File:** [app/api/products/free-workshop/claim/route.ts](app/api/products/free-workshop/claim/route.ts)
- **Route:** `POST /api/products/free-workshop/claim`
- Requires authentication
- Creates a $0 purchase record with status "COMPLETED"
- Prevents duplicate claims
- Redirects to workshop dashboard after claiming

### 4. Workshop Dashboard
- **File:** [app/dashboard/programs/free-workshop/page.tsx](app/dashboard/programs/free-workshop/page.tsx)
- **Route:** `/dashboard/programs/free-workshop`
- Protected route (requires auth + purchase verification)
- Lists all 3 videos with:
  - Module number, title, description
  - Duration badge
  - Progress indicator (percentage watched)
  - "Completed" badge for 90%+ watched videos
  - "Start Video" / "Continue" / "Watch Again" buttons
- Overall progress bar showing completion status
- Completion celebration when all videos are watched
- Responsive design matching brand aesthetic

### 5. Video Player Page
- **File:** [app/dashboard/programs/free-workshop/video/[videoId]/page.tsx](app/dashboard/programs/free-workshop/video/[videoId]/page.tsx)
- **Route:** `/dashboard/programs/free-workshop/video/{videoId}`
- Protected route with access verification
- Displays video title and description
- Renders VideoPlayer component
- Previous/Next navigation between videos
- "Back to Workshop" button

### 6. VideoPlayer Component
- **File:** [components/VideoPlayer.tsx](components/VideoPlayer.tsx)
- Client-side component with HTML5 video player
- Fetches signed URL from API on mount
- Resumes from last watched position (if < 90% complete)
- Tracks progress every 10 seconds while playing
- Updates progress on pause
- Disables right-click and download (controlsList="nodownload")
- Loading state with spinner
- Error handling with retry button

### 7. Video URL API
- **File:** [app/api/videos/[videoId]/url/route.ts](app/api/videos/[videoId]/url/route.ts)
- **Route:** `GET /api/videos/{videoId}/url`
- Requires authentication
- Verifies user has purchased the product
- Generates signed S3 URL with 1-hour expiration
- Returns `{ url: signedUrl }`

### 8. Progress Tracking API
- **File:** [app/api/videos/[videoId]/progress/route.ts](app/api/videos/[videoId]/progress/route.ts)
- **Route:** `POST /api/videos/{videoId}/progress`
- Requires authentication
- Accepts `{ progressPercent: number }` (0-100)
- Upserts into `user_progress` table
- Updates `lastWatchedAt` timestamp

## 🔐 Security Features

1. **Authentication Required:** All dashboard routes and video APIs require active session
2. **Purchase Verification:** Video URLs only generated for users who own the product
3. **Signed URLs:** Videos served via time-limited signed URLs (1-hour expiration)
4. **No Direct S3 Access:** S3 bucket should be private, not publicly accessible
5. **Download Prevention:** `controlsList="nodownload"` prevents right-click download
6. **Access Control:** Each request validates user owns the product

## 📋 Environment Variables

Add these to your `.env` file:

```env
# AWS S3 (for video storage)
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="your-bucket-name"
```

## 🎯 User Flow

### New Users (Free Workshop)
1. Visit `/programs/free-workshop` (marketing page)
2. Click "Get Free Access" → Redirected to signup
3. After signup, return to `/programs/free-workshop`
4. Click "Start Workshop Now" → POST to `/api/products/free-workshop/claim`
5. Purchase record created (amount: $0, status: COMPLETED)
6. Redirected to `/dashboard/programs/free-workshop`

### Existing Users (Free Workshop)
1. Visit `/programs/free-workshop`
2. Already has access → Auto-redirect to `/dashboard/programs/free-workshop`
3. Click on a video → Navigate to `/dashboard/programs/free-workshop/video/{videoId}`
4. VideoPlayer fetches signed URL from `/api/videos/{videoId}/url`
5. Video plays, progress tracked every 10 seconds to `/api/videos/{videoId}/progress`
6. Progress saved in database
7. Return to dashboard → See updated progress

## 🗄️ Database Schema

### Videos Table
```prisma
model Video {
  id              String   @id @default(cuid())
  productId       String
  title           String
  description     String?
  s3Key           String   // S3 object key (e.g., "videos/free-workshop/module-1.mp4")
  durationMinutes Int
  orderIndex      Int
  product         Product  @relation(...)
  userProgress    UserProgress[]
}
```

### UserProgress Table
```prisma
model UserProgress {
  id             String   @id @default(cuid())
  userId         String
  videoId        String
  progressPercent Int     // 0-100
  lastWatchedAt  DateTime @default(now())
  user           User     @relation(...)
  video          Video    @relation(...)

  @@unique([userId, videoId])
}
```

### Purchases Table
```prisma
model Purchase {
  id              String   @id @default(cuid())
  userId          String
  productId       String
  amount          Int      // 0 for free products
  status          PurchaseStatus  // COMPLETED
  stripePaymentId String?  // null for free products
  user            User     @relation(...)
  product         Product  @relation(...)
}
```

## 🎬 S3 Video Setup

### 1. Create S3 Bucket
```bash
# Using AWS CLI
aws s3 mb s3://your-bucket-name --region us-east-1
```

### 2. Configure Bucket Policy (Private)
Your S3 bucket should NOT be publicly accessible. Access is granted via signed URLs only.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyPublicAccess",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*",
      "Condition": {
        "StringNotEquals": {
          "aws:PrincipalAccount": "YOUR_AWS_ACCOUNT_ID"
        }
      }
    }
  ]
}
```

### 3. Upload Videos
Upload your videos with the s3Key that matches the database:

```bash
# Example for Free Workshop videos
aws s3 cp module-1.mp4 s3://your-bucket-name/videos/free-workshop/module-1.mp4
aws s3 cp module-2.mp4 s3://your-bucket-name/videos/free-workshop/module-2.mp4
aws s3 cp module-3.mp4 s3://your-bucket-name/videos/free-workshop/module-3.mp4
```

### 4. Update Database with S3 Keys
Make sure your video records have the correct s3Key:

```typescript
// In lib/db/seed.ts or via Prisma Studio
await prisma.video.update({
  where: { id: 'video-id' },
  data: { s3Key: 'videos/free-workshop/module-1.mp4' }
});
```

## 🚀 Testing Checklist

### Local Testing
- [ ] Set AWS environment variables in `.env`
- [ ] Sign up for new account
- [ ] Visit `/programs/free-workshop`
- [ ] Click "Start Workshop Now"
- [ ] Verify redirect to dashboard
- [ ] See all 3 videos listed
- [ ] Click "Start Video" on first video
- [ ] Video loads and plays
- [ ] Pause video, check progress saved
- [ ] Return to dashboard, verify progress shown
- [ ] Complete video to 90%+, verify "Completed" badge
- [ ] Test Previous/Next navigation
- [ ] Complete all videos, see completion celebration

### Production Testing
- [ ] Add AWS credentials to Railway environment variables
- [ ] Upload videos to S3 bucket
- [ ] Update video records with correct s3Keys
- [ ] Test complete user flow on production
- [ ] Verify signed URLs expire after 1 hour
- [ ] Test on mobile devices
- [ ] Verify progress tracking works

## 📊 Extending to Paid Products

To add video delivery to paid products (like Optimal Fertility Blueprint):

1. **Create product page:** `app/programs/optimal-fertility-blueprint/page.tsx`
   - Show Stripe enrollment button instead of free claim

2. **Create dashboard:** `app/dashboard/programs/optimal-fertility-blueprint/page.tsx`
   - Same structure as free workshop dashboard
   - Verify Stripe purchase instead of free claim

3. **Create video pages:** `app/dashboard/programs/optimal-fertility-blueprint/video/[videoId]/page.tsx`
   - Identical to free workshop video page
   - VideoPlayer component is reusable

4. **No API changes needed:** The video URL and progress APIs already verify purchase status

## 🎨 Design Tokens Used

- **Primary Color:** `#7fa69b` (sage green)
- **Heading Font:** Crimson Text (serif)
- **Body Font:** Inter (sans-serif)
- **Components:** Shadcn/ui (Card, Button)
- **Icons:** Lucide (Play, CheckCircle, Clock, ArrowLeft, ArrowRight, Loader2)

## 🔧 Troubleshooting

### Video won't load
- Check AWS credentials in environment variables
- Verify S3 bucket name is correct
- Ensure video has `s3Key` in database
- Check S3 bucket region matches `AWS_REGION`

### Signed URL expired
- Signed URLs expire after 1 hour
- VideoPlayer automatically refreshes on mount
- User must reload page after 1 hour

### Progress not saving
- Check browser console for API errors
- Verify user is authenticated
- Ensure video exists in database
- Check `user_progress` table for records

### Access denied errors
- Verify user has purchase record with status "COMPLETED"
- Check purchase.productId matches video.productId
- For free workshop, ensure claim API was called

## 📈 Next Steps

1. **Upload Videos:** Add actual video files to S3 with correct keys
2. **Test Flow:** Complete end-to-end testing of signup → claim → watch
3. **Add Email:** Send confirmation email after claiming free workshop
4. **Analytics:** Track video completion rates, drop-off points
5. **Paid Products:** Extend system to Optimal Fertility Blueprint
6. **Workbook Downloads:** Add PDF download functionality
7. **Weekly Content:** Schedule automated workbook delivery for Blueprint

---

**Built with care for fertility journeys** 🌱
