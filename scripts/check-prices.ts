import { prisma } from '../lib/db';

async function checkPrices() {
  try {
    const products = await prisma.product.findMany({
      select: {
        slug: true,
        name: true,
        priceId: true,
        paymentPlanPriceId: true,
        testPriceId: true,
        testPaymentPlanPriceId: true,
      },
    });

    console.log('Current Stripe Price IDs:\n');
    products.forEach((product) => {
      console.log(`${product.name} (${product.slug}):`);
      console.log(`  LIVE One-time: ${product.priceId || 'NOT SET'}`);
      console.log(`  LIVE Payment plan: ${product.paymentPlanPriceId || 'NOT SET'}`);
      console.log(`  TEST One-time: ${product.testPriceId || 'NOT SET'}`);
      console.log(`  TEST Payment plan: ${product.testPaymentPlanPriceId || 'NOT SET'}`);
      console.log('');
    });
  } catch (error) {
    console.error('Error checking prices:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkPrices();
