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

  // Create Optimal Fertility Blueprint workbooks
  console.log('\nCreating Optimal Fertility Blueprint workbooks...');

  const workbooksData = [
    {
      slug: 'week-1-lungs',
      title: 'Week 1: Lungs - Strengthen Qi & Immunity',
      description: 'Learn how the lungs govern your Qi and defensive energy. Includes acupressure points, breathing exercises, and immune-boosting practices.',
      weekNumber: 1,
      s3FolderPath: 'workbooks/optimal-fertility-blueprint/week-1-lungs',
      totalPages: 8,
      bonusOnly: false,
      orderIndex: 1,
    },
    {
      slug: 'week-2-qi',
      title: 'Week 2: Qi - Cultivate Your Vital Energy',
      description: 'Discover how to build and circulate Qi for optimal reproductive health. Qigong movements and energy cultivation practices.',
      weekNumber: 2,
      s3FolderPath: 'workbooks/optimal-fertility-blueprint/week-2-qi',
      totalPages: 8,
      bonusOnly: false,
      orderIndex: 2,
    },
    {
      slug: 'week-3-spleen',
      title: 'Week 3: Spleen - Nourish Digestion & Blood',
      description: 'Support your spleen to transform food into rich, nourishing blood. Dietary therapy and self-care practices.',
      weekNumber: 3,
      s3FolderPath: 'workbooks/optimal-fertility-blueprint/week-3-spleen',
      totalPages: 8,
      bonusOnly: false,
      orderIndex: 3,
    },
    {
      slug: 'week-4-kidneys',
      title: 'Week 4: Kidneys - Build Essence & Vitality',
      description: 'The kidneys store your reproductive essence (Jing). Learn how to preserve and build this vital resource.',
      weekNumber: 4,
      s3FolderPath: 'workbooks/optimal-fertility-blueprint/week-4-kidneys',
      totalPages: 8,
      bonusOnly: false,
      orderIndex: 4,
    },
    {
      slug: 'week-5-liver',
      title: 'Week 5: Liver - Harmonize Emotions & Flow',
      description: 'The liver ensures smooth flow of Qi and blood. Emotional release techniques and stress management.',
      weekNumber: 5,
      s3FolderPath: 'workbooks/optimal-fertility-blueprint/week-5-liver',
      totalPages: 8,
      bonusOnly: false,
      orderIndex: 5,
    },
    {
      slug: 'week-6-heart',
      title: 'Week 6: Heart - Cultivate Joy & Connection',
      description: 'The heart houses your spirit (Shen). Heart-opening practices and meditation for emotional well-being.',
      weekNumber: 6,
      s3FolderPath: 'workbooks/optimal-fertility-blueprint/week-6-heart',
      totalPages: 8,
      bonusOnly: false,
      orderIndex: 6,
    },
    {
      slug: 'week-7-blood',
      title: 'Week 7: Blood - Build & Circulate Life Force',
      description: 'Blood nourishes your reproductive organs and supports conception. Blood-building nutrition and practices.',
      weekNumber: 7,
      s3FolderPath: 'workbooks/optimal-fertility-blueprint/week-7-blood',
      totalPages: 8,
      bonusOnly: false,
      orderIndex: 7,
    },
    {
      slug: 'week-8-yin',
      title: 'Week 8: Yin - Deepen Rest & Nourishment',
      description: 'Yin is the cooling, nourishing, restorative aspect of your being. Yin yoga and self-nourishment practices.',
      weekNumber: 8,
      s3FolderPath: 'workbooks/optimal-fertility-blueprint/week-8-yin',
      totalPages: 8,
      bonusOnly: false,
      orderIndex: 8,
    },
    {
      slug: 'week-9-yang',
      title: 'Week 9: Yang - Activate Warmth & Movement',
      description: 'Yang is the warming, activating energy. Learn to balance yin and yang for optimal fertility.',
      weekNumber: 9,
      s3FolderPath: 'workbooks/optimal-fertility-blueprint/week-9-yang',
      totalPages: 8,
      bonusOnly: false,
      orderIndex: 9,
    },
    {
      slug: 'bonus-workbook',
      title: 'Bonus: Complete Fertility Toolkit',
      description: 'Your comprehensive reference guide with supplement protocols, meal plans, cycle tracking, and advanced techniques.',
      weekNumber: null,
      s3FolderPath: 'workbooks/optimal-fertility-blueprint/bonus-workbook',
      totalPages: 12,
      bonusOnly: true,
      orderIndex: 10,
    },
  ];

  for (const workbookData of workbooksData) {
    await prisma.workbook.upsert({
      where: { slug: workbookData.slug },
      update: {
        s3FolderPath: workbookData.s3FolderPath,
        totalPages: workbookData.totalPages,
      },
      create: {
        productId: optimalFertilityBlueprint.id,
        ...workbookData,
      },
    });
  }

  console.log(`Created ${workbooksData.length} workbooks for Optimal Fertility Blueprint`);

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
