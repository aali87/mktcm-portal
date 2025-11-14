/**
 * Database seeding script
 * Run with: npx ts-node --compiler-options {"module":"CommonJS"} lib/db/seed.ts
 */

import { PrismaClient, ProductType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create products
  const freeWorkshop = await prisma.product.upsert({
    where: { slug: 'free-workshop' },
    update: {},
    create: {
      name: 'Free Workshop',
      slug: 'free-workshop',
      description: 'Three comprehensive video workshops introducing fertility optimization through TCM. Learn foundational concepts and begin your journey.',
      price: 0,
      type: ProductType.FREE_WORKSHOP,
      featured: true,
      order: 1,
    },
  });

  const optimalFertilityBlueprint = await prisma.product.upsert({
    where: { slug: 'optimal-fertility-blueprint' },
    update: {
      priceId: process.env.STRIPE_PRICE_ID_OFB_ONE_TIME || 'price_xxx',
      paymentPlanPriceId: process.env.STRIPE_PRICE_ID_OFB_PLAN || 'price_yyy',
    },
    create: {
      name: 'Optimal Fertility Blueprint',
      slug: 'optimal-fertility-blueprint',
      description: '9-week comprehensive program with weekly workbooks, video lessons, acupressure demonstrations, meditations, and supplement protocols. Includes bonus content for full payment.',
      price: 14900, // $149.00
      type: ProductType.PAID_PROGRAM,
      featured: true,
      order: 2,
      // TODO: Replace with actual Stripe Price IDs from your Stripe Dashboard
      // Create these in Stripe: https://dashboard.stripe.com/test/products
      priceId: process.env.STRIPE_PRICE_ID_OFB_ONE_TIME || 'price_xxx', // One-time payment: $149
      paymentPlanPriceId: process.env.STRIPE_PRICE_ID_OFB_PLAN || 'price_yyy', // Payment plan: 3 x $59/month
    },
  });

  const stressFreeGoddess = await prisma.product.upsert({
    where: { slug: 'stress-free-goddess' },
    update: {},
    create: {
      name: 'Stress-free Goddess Program',
      slug: 'stress-free-goddess',
      description: 'Learn powerful stress management techniques designed specifically for your fertility journey. Reduce cortisol and create a calm, nurturing environment for conception.',
      price: 2900, // $29.00
      type: ProductType.PAID_PROGRAM,
      featured: false,
      order: 3,
    },
  });

  const fearlesslyFertileYoga = await prisma.product.upsert({
    where: { slug: 'fearlessly-fertile-yoga' },
    update: {},
    create: {
      name: 'Fearlessly Fertile Yoga',
      slug: 'fearlessly-fertile-yoga',
      description: 'Gentle, fertility-focused yoga sequences that support reproductive health and emotional balance. Practice at your own pace with guided video instruction.',
      price: 1500, // $15.00
      type: ProductType.DIGITAL_PRODUCT,
      featured: false,
      order: 4,
    },
  });

  const freePrintables = await prisma.product.upsert({
    where: { slug: 'free-printables' },
    update: {},
    create: {
      name: 'Free Printables',
      slug: 'free-printables',
      description: 'Downloadable resources including cycle tracking sheets, fertility affirmations, meal planning templates, and self-care checklists.',
      price: 0,
      type: ProductType.FREE_RESOURCE,
      featured: false,
      order: 5,
    },
  });

  console.log('Products created:', {
    freeWorkshop,
    optimalFertilityBlueprint,
    stressFreeGoddess,
    fearlesslyFertileYoga,
    freePrintables,
  });

  // Create Free Workshop videos
  console.log('\nCreating Free Workshop videos...');

  const video1 = await prisma.video.upsert({
    where: { id: 'free-workshop-video-1' },
    update: {
      url: 'videos/free-workshop/living-vibrantly-day-1.mp4',
    },
    create: {
      id: 'free-workshop-video-1',
      productId: freeWorkshop.id,
      title: 'Day 1: Foundation of Vibrant Living',
      description: 'Discover the essential principles of Traditional Chinese Medicine and how they apply to your fertility journey. Learn the foundations of living vibrantly.',
      url: 'videos/free-workshop/living-vibrantly-day-1.mp4',
      duration: 1200, // 20 minutes in seconds
      order: 1,
    },
  });

  const video2 = await prisma.video.upsert({
    where: { id: 'free-workshop-video-2' },
    update: {
      url: 'videos/free-workshop/living-vibrantly-day-2.mp4',
    },
    create: {
      id: 'free-workshop-video-2',
      productId: freeWorkshop.id,
      title: 'Day 2: Nutrition and Lifestyle',
      description: 'Explore how nutrition and lifestyle choices impact your fertility from a TCM perspective. Get practical tips you can implement today.',
      url: 'videos/free-workshop/living-vibrantly-day-2.mp4',
      duration: 1500, // 25 minutes in seconds
      order: 2,
    },
  });

  const video3 = await prisma.video.upsert({
    where: { id: 'free-workshop-video-3' },
    update: {
      url: 'videos/free-workshop/living-vibrantly-day-3.mp4',
    },
    create: {
      id: 'free-workshop-video-3',
      productId: freeWorkshop.id,
      title: 'Day 3: Stress Management & Next Steps',
      description: 'Master stress management techniques specifically designed for fertility support. Learn your personalized next steps on this journey.',
      url: 'videos/free-workshop/living-vibrantly-day-3.mp4',
      duration: 1800, // 30 minutes in seconds
      order: 3,
    },
  });

  console.log('Free Workshop videos created:', {
    video1,
    video2,
    video3,
  });

  console.log('\nSeed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
