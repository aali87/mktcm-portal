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
    update: {
      priceId: process.env.STRIPE_PRICE_ID_SFG || 'price_1SToTU3rioCqkoangJhHwXE8',
    },
    create: {
      name: 'Stress-free Goddess Program',
      slug: 'stress-free-goddess',
      description: '12 weeks of TCM practices to reduce stress, improve sleep, and boost energy. Learn Qigong, Reflexology & Guasha techniques for deep calm and vitality.',
      price: 2900, // $29.00
      type: ProductType.PAID_PROGRAM,
      featured: false,
      order: 3,
      priceId: process.env.STRIPE_PRICE_ID_SFG || 'price_1SToTU3rioCqkoangJhHwXE8',
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

  // Create Stress-free Goddess videos
  console.log('\nCreating Stress-free Goddess videos...');

  const stressFreeGoddessVideos = [
    {
      id: 'sfg-week-1',
      title: 'Week 1: Qigong to Improve Metabolism',
      description: 'Move, transform and free stagnations. Nourish your mind, body and spirit through the transformation of fluids into blood.',
      url: 'videos/stress-free-goddess/week-01-qigong-metabolism.mp4',
      duration: 900, // 15 minutes
      order: 1,
    },
    {
      id: 'sfg-week-2',
      title: 'Week 2: Reflexology to Relieve Stress',
      description: 'Use ear seed reflexology to stimulate a feedback loop to your brain that encourages relaxation and relieves stress-related tension.',
      url: 'videos/stress-free-goddess/week-02-reflexology-stress.mp4',
      duration: 720, // 12 minutes
      order: 2,
    },
    {
      id: 'sfg-week-3',
      title: 'Week 3: Qigong to Calm the Mind and Relax Tension',
      description: 'Free pent-up tension using qigong and breathwork to improve circulation of lymphatic fluids and calm rising energy.',
      url: 'videos/stress-free-goddess/week-03-qigong-calm-mind.mp4',
      duration: 1080, // 18 minutes
      order: 3,
    },
    {
      id: 'sfg-week-4',
      title: 'Week 4: Qigong to Mist & Nourish Tissue and Organs',
      description: 'Help your body distribute nutrient-rich fluids to every cell, tissue and organ. Strengthen the Metal element related to your Lungs.',
      url: 'videos/stress-free-goddess/week-04-qigong-mist-nourish.mp4',
      duration: 960, // 16 minutes
      order: 4,
    },
    {
      id: 'sfg-week-5',
      title: 'Week 5: Reflexology to Reduce Anxiety',
      description: 'Apply ear seeds to points that help your body open up and return to vibrancy. Breathe deeper and calm your heart rate.',
      url: 'videos/stress-free-goddess/week-05-reflexology-anxiety.mp4',
      duration: 600, // 10 minutes
      order: 5,
    },
    {
      id: 'sfg-week-6',
      title: 'Week 6: Guasha (Peaceful Skin Scraping) to Relieve Anxiety',
      description: 'Gentle scraping to release trapped heat and stagnant blood. Bring blood to the surface to promote relaxation and calm.',
      url: 'videos/stress-free-goddess/week-06-guasha-anxiety.mp4',
      duration: 840, // 14 minutes
      order: 6,
    },
    {
      id: 'sfg-week-7',
      title: 'Week 7: Reflexology to Improve Digestion',
      description: 'Support your body\'s ability to metabolize nutrients with ear seed reflexology. Address bloating, gas, and digestive sluggishness.',
      url: 'videos/stress-free-goddess/week-07-reflexology-digestion.mp4',
      duration: 660, // 11 minutes
      order: 7,
    },
    {
      id: 'sfg-week-8',
      title: 'Week 8: Qigong to Support Digestion',
      description: 'Strengthen your digestive system by building the Earth element related to Stomach & Spleen. Optimize nutrient absorption.',
      url: 'videos/stress-free-goddess/week-08-qigong-digestion.mp4',
      duration: 1020, // 17 minutes
      order: 8,
    },
    {
      id: 'sfg-week-9',
      title: 'Week 9: Reflexology to Improve Sleep',
      description: 'Stimulate blood production that is essential for calming the mind. Support your body\'s nighttime recovery and rejuvenation.',
      url: 'videos/stress-free-goddess/week-09-reflexology-sleep.mp4',
      duration: 600, // 10 minutes
      order: 9,
    },
    {
      id: 'sfg-week-10',
      title: 'Week 10: Qigong to Nourish the Body',
      description: 'Raise clear fluids and energy upward to clear, calm and relax your mind. Support healthy fluid filtration and radiant skin.',
      url: 'videos/stress-free-goddess/week-10-qigong-nourish.mp4',
      duration: 1140, // 19 minutes
      order: 10,
    },
    {
      id: 'sfg-week-11',
      title: 'Week 11: Guasha to Improve Sleep',
      description: 'Clear trapped heat that rises and prevents relaxation. Use gentle skin scraping daily to support better sleep.',
      url: 'videos/stress-free-goddess/week-11-guasha-sleep.mp4',
      duration: 780, // 13 minutes
      order: 11,
    },
    {
      id: 'sfg-week-12',
      title: 'Week 12: Reflexology to Improve Energy',
      description: 'Stimulate the three main energetic systems that produce Qi in your body. Boost vitality after periods of stress or insomnia.',
      url: 'videos/stress-free-goddess/week-12-reflexology-energy.mp4',
      duration: 720, // 12 minutes
      order: 12,
    },
  ];

  for (const videoData of stressFreeGoddessVideos) {
    await prisma.video.upsert({
      where: { id: videoData.id },
      update: {
        url: videoData.url,
        duration: videoData.duration,
      },
      create: {
        productId: stressFreeGoddess.id,
        ...videoData,
      },
    });
  }

  console.log(`Created ${stressFreeGoddessVideos.length} videos for Stress-free Goddess`);

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
