import { prisma } from '../lib/db';

async function checkPrices() {
  try {
    const products = await prisma.product.findMany({
      select: {
        slug: true,
        name: true,
        priceId: true,
        paymentPlanPriceId: true,
      },
    });

    console.log('Current Stripe Price IDs:\n');
    products.forEach((product) => {
      console.log(`${product.name} (${product.slug}):`);
      console.log(`  One-time: ${product.priceId || 'NOT SET'}`);
      console.log(`  Payment plan: ${product.paymentPlanPriceId || 'NOT SET'}`);
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
