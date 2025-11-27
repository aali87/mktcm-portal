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
      // Live mode price IDs
      priceId: process.env.STRIPE_LIVE_PRICE_ID_OFB_ONE_TIME || null,
      paymentPlanPriceId: process.env.STRIPE_LIVE_PRICE_ID_OFB_PLAN || null,
      // Test mode price IDs
      testPriceId: process.env.STRIPE_TEST_PRICE_ID_OFB_ONE_TIME || null,
      testPaymentPlanPriceId: process.env.STRIPE_TEST_PRICE_ID_OFB_PLAN || null,
    },
    create: {
      name: 'Optimal Fertility Blueprint',
      slug: 'optimal-fertility-blueprint',
      description: '9-week comprehensive program with weekly workbooks, video lessons, acupressure demonstrations, meditations, and supplement protocols. Includes bonus content for full payment.',
      price: 14900, // $149.00
      type: ProductType.PAID_PROGRAM,
      featured: true,
      order: 2,
      // Live mode price IDs
      priceId: process.env.STRIPE_LIVE_PRICE_ID_OFB_ONE_TIME || null,
      paymentPlanPriceId: process.env.STRIPE_LIVE_PRICE_ID_OFB_PLAN || null,
      // Test mode price IDs
      testPriceId: process.env.STRIPE_TEST_PRICE_ID_OFB_ONE_TIME || null,
      testPaymentPlanPriceId: process.env.STRIPE_TEST_PRICE_ID_OFB_PLAN || null,
    },
  });

  const stressFreeGoddess = await prisma.product.upsert({
    where: { slug: 'stress-free-goddess' },
    update: {
      priceId: process.env.STRIPE_LIVE_PRICE_ID_SFG || null,
      testPriceId: process.env.STRIPE_TEST_PRICE_ID_SFG || null,
    },
    create: {
      name: 'Stress-free Goddess Program',
      slug: 'stress-free-goddess',
      description: '12 weeks of TCM practices to reduce stress, improve sleep, and boost energy. Learn Qigong, Reflexology & Guasha techniques for deep calm and vitality.',
      price: 2900, // $29.00
      type: ProductType.PAID_PROGRAM,
      featured: false,
      order: 3,
      priceId: process.env.STRIPE_LIVE_PRICE_ID_SFG || null,
      testPriceId: process.env.STRIPE_TEST_PRICE_ID_SFG || null,
    },
  });

  const fearlesslyFertileYoga = await prisma.product.upsert({
    where: { slug: 'fearlessly-fertile-yoga' },
    update: {
      priceId: process.env.STRIPE_LIVE_PRICE_ID_FFY || null,
      testPriceId: process.env.STRIPE_TEST_PRICE_ID_FFY || null,
    },
    create: {
      name: 'Fearlessly Fertile Yoga',
      slug: 'fearlessly-fertile-yoga',
      description: '10 TCM-inspired yoga sessions to enhance fertility, hormonal balance, and vitality. Ancient wisdom meets modern fertility support.',
      price: 1500, // $15.00
      type: ProductType.PAID_PROGRAM,
      featured: false,
      order: 4,
      priceId: process.env.STRIPE_LIVE_PRICE_ID_FFY || null,
      testPriceId: process.env.STRIPE_TEST_PRICE_ID_FFY || null,
    },
  });

  const freePrintables = await prisma.product.upsert({
    where: { slug: 'free-printables' },
    update: {},
    create: {
      name: 'Free TCM Food Therapy Printables',
      slug: 'free-printables',
      description: '4 downloadable TCM food therapy guides to support your fertility journey. Learn dietary principles for Dampness, Depleted Blood, Depleted Yang, and Depleted Yin.',
      price: 0,
      type: ProductType.FREE_RESOURCE,
      featured: true,
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

  // Create Fearlessly Fertile Yoga videos
  console.log('\nCreating Fearlessly Fertile Yoga videos...');

  const fearlesslyFertileYogaVideos = [
    {
      id: 'ffy-video-1',
      title: 'Enhancing Hormonal Well-being',
      description: 'Explore the relationship between Liver, Spleen, and Kidney systems—the key regulators of hormonal stability. Through TCM movement, breath, and acupressure, regulate stress, nourish Yin and Yang, and support endocrine and menstrual cycles. Weekly mantra: Within me is boundless love',
      url: 'videos/fearlessly-fertile-yoga/video-01-hormonal-wellbeing.mov',
      duration: 1980, // 33 minutes
      order: 1,
    },
    {
      id: 'ffy-video-2',
      title: 'Eliminate Waste and Enhance Blood Circulation',
      description: 'Support detoxification through proper Qi and Blood movement to clear stagnation and optimize nutrient delivery to reproductive organs. Stimulate circulation, strengthen liver function, and prepare the body for optimal fertility. Weekly mantra: Please let me feel inner peace of my centre, of my centre of me',
      url: 'videos/fearlessly-fertile-yoga/video-02-eliminate-waste-circulation.mov',
      duration: 2280, // 38 minutes
      order: 2,
    },
    {
      id: 'ffy-video-3',
      title: 'Harnessing Yin Energy for Substance Creation',
      description: 'Cultivate Yin energy—the foundation of blood, essence, and fluids that nourish fertility. Through restorative movement and breathwork, replenish your body\'s reserves, support egg quality, and connect with your innate creative power. Weekly mantra: I have the power to create',
      url: 'videos/fearlessly-fertile-yoga/video-03-yin-energy-substance.mov',
      duration: 2220, // 37 minutes
      order: 3,
    },
    {
      id: 'ffy-video-4',
      title: 'Release & Embrace the Flow',
      description: 'Channel the Water element\'s fluidity through flowing yoga and Qigong. Enhance circulation, calm the nervous system, and awaken reproductive vitality. Dissolve physical and emotional tension with dynamic breathing techniques. Weekly mantra: Breathe it in, let it out, breathe it in, let it go',
      url: 'videos/fearlessly-fertile-yoga/video-04-release-embrace-flow.mov',
      duration: 2040, // 34 minutes
      order: 4,
    },
    {
      id: 'ffy-video-5',
      title: 'Awakening Yang Qi for Growth & Transformation',
      description: 'Awaken your inner fire through dynamic breathwork, acupressure, and Qigong-inspired movement. Experience Kapalabhati (Breath of Fire) as it stimulates circulation, clears stagnation, and ignites reproductive vitality. Weekly mantra: Ease, Release, Relief',
      url: 'videos/fearlessly-fertile-yoga/video-05-yang-qi-transformation.mov',
      duration: 2460, // 41 minutes
      order: 5,
    },
    {
      id: 'ffy-video-6',
      title: 'Fascia Flossing for Stress-Free Living',
      description: 'Blend modern fascia flossing with ancient TCM wisdom to release deep-seated tension and enhance flexibility. Support meridian pathways that nourish organs and balance emotions. Restore structural and emotional freedom. Weekly mantra: Be here now',
      url: 'videos/fearlessly-fertile-yoga/video-06-fascia-flossing.mov',
      duration: 2940, // 49 minutes
      order: 6,
    },
    {
      id: 'ffy-video-7',
      title: 'Awakening the Power Within',
      description: 'Awaken inner power through Qigong, breathwork, cupping techniques, and acupressure. Activate lung and kidney channels to boost Qi circulation, enhance sexual vitality, and nourish creative energy from the core. Weekly mantra: Thank you',
      url: 'videos/fearlessly-fertile-yoga/video-07-power-within.mov',
      duration: 2940, // 49 minutes
      order: 7,
    },
    {
      id: 'ffy-video-8',
      title: 'Fluid Dynamics for a Healthier You',
      description: 'Combine alternating nostril breathing, hip mobility work, and Qigong to awaken your body\'s natural fluid dynamics. Enhance lymphatic drainage, improve blood circulation, and support hormonal balance. Weekly mantra: I\'m all, I need, to get by',
      url: 'videos/fearlessly-fertile-yoga/video-08-fluid-dynamics.mov',
      duration: 2640, // 44 minutes
      order: 8,
    },
    {
      id: 'ffy-video-9',
      title: 'Cool, Calm, and Fired Up',
      description: 'Combine fiery breathwork, side stretches, and acupressure to awaken and ground your inner energy. Heart-opening chest expanders and flowing cat-cow movements release tension while supporting emotional balance. Weekly mantra: The beat that unites us, live to the rhythm of peace',
      url: 'videos/fearlessly-fertile-yoga/video-09-cool-calm-fired-up.mov',
      duration: 2580, // 43 minutes
      order: 9,
    },
    {
      id: 'ffy-video-10',
      title: 'Shine with Your Heart\'s Inner Glow',
      description: 'Combine alternate nostril breathing, heart-centered breathwork, and chest-opening poses to harmonize hormones and cultivate inner calm. Flow through Trikonasana and dynamic chest taps to ignite vitality and confidence. Weekly mantra: I reach up, Feel love, Bring it to my heart',
      url: 'videos/fearlessly-fertile-yoga/video-10-hearts-inner-glow.mov',
      duration: 2820, // 47 minutes
      order: 10,
    },
  ];

  for (const videoData of fearlesslyFertileYogaVideos) {
    await prisma.video.upsert({
      where: { id: videoData.id },
      update: {
        url: videoData.url,
        duration: videoData.duration,
      },
      create: {
        productId: fearlesslyFertileYoga.id,
        ...videoData,
      },
    });
  }

  console.log(`Created ${fearlesslyFertileYogaVideos.length} videos for Fearlessly Fertile Yoga`);

  // Create Free Printables
  console.log('\nCreating Free TCM Printables...');

  const printablesData = [
    {
      title: 'TCM Food Therapy to Treat Dampness',
      description: 'Dietary principles and food lists to drain dampness, support Spleen function, and improve digestion. Includes grains, vegetables, herbs, and foods to avoid. Perfect for clearing bloating, heaviness, and digestive sluggishness.',
      s3Key: 'printables/free-printables/tcm-food-therapy-dampness.pdf',
      orderIndex: 1,
    },
    {
      title: 'TCM Food Therapy to Treat Depleted Blood',
      description: 'Nourish blood with mineral-dense foods. Perfect for fatigue, irregular cycles, or postpartum recovery. Includes healing teas, soups, and blood-building ingredients. Ideal for light periods, dizziness, or pale complexion.',
      s3Key: 'printables/free-printables/tcm-food-therapy-depleted-blood.pdf',
      orderIndex: 2,
    },
    {
      title: 'TCM Food Therapy to Treat Depleted Yang',
      description: 'Warm and tonify Yang energy with stews, soups, and warming spices. Support Kidney and Spleen Yang for better energy, warmth, and vitality. Great for those who feel cold, tired, or have low libido.',
      s3Key: 'printables/free-printables/tcm-food-therapy-depleted-yang.pdf',
      orderIndex: 3,
    },
    {
      title: 'TCM Food Therapy to Treat Depleted Yin',
      description: 'Cool, moisten, and nourish Yin with specific foods and herbs. Support Lung, Liver, and Kidney Yin for better sleep, skin, and hormonal balance. Perfect for night sweats, hot flashes, insomnia, or anxiety.',
      s3Key: 'printables/free-printables/tcm-food-therapy-depleted-yin.pdf',
      orderIndex: 4,
    },
  ];

  for (const printableData of printablesData) {
    await prisma.printable.upsert({
      where: {
        // Create a unique identifier based on productId and s3Key
        productId_s3Key: {
          productId: freePrintables.id,
          s3Key: printableData.s3Key,
        },
      },
      update: {
        title: printableData.title,
        description: printableData.description,
        orderIndex: printableData.orderIndex,
      },
      create: {
        productId: freePrintables.id,
        ...printableData,
      },
    });
  }

  console.log(`Created ${printablesData.length} printables for Free TCM Printables`);

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
