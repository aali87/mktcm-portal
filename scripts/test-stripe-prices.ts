import { stripe } from '../lib/stripe';
import { prisma } from '../lib/db';

async function testStripePrices() {
  try {
    console.log('Testing Stripe price IDs...\n');

    const products = await prisma.product.findMany({
      where: {
        OR: [
          { priceId: { not: null } },
          { paymentPlanPriceId: { not: null } },
        ],
      },
      select: {
        slug: true,
        name: true,
        priceId: true,
        paymentPlanPriceId: true,
      },
    });

    for (const product of products) {
      console.log(`\n${product.name} (${product.slug}):`);

      // Test one-time price
      if (product.priceId) {
        try {
          const price = await stripe.prices.retrieve(product.priceId);
          console.log(`  ✓ One-time price: ${product.priceId}`);
          console.log(`    Amount: $${price.unit_amount! / 100}`);
          console.log(`    Active: ${price.active}`);
        } catch (error: any) {
          console.log(`  ✗ One-time price ERROR: ${product.priceId}`);
          console.log(`    Error: ${error.message}`);
        }
      }

      // Test payment plan price
      if (product.paymentPlanPriceId) {
        try {
          const price = await stripe.prices.retrieve(product.paymentPlanPriceId);
          console.log(`  ✓ Payment plan price: ${product.paymentPlanPriceId}`);
          console.log(`    Amount: $${price.unit_amount! / 100}`);
          console.log(`    Active: ${price.active}`);
          console.log(`    Recurring: ${price.recurring?.interval}`);
        } catch (error: any) {
          console.log(`  ✗ Payment plan price ERROR: ${product.paymentPlanPriceId}`);
          console.log(`    Error: ${error.message}`);
        }
      }
    }
  } catch (error) {
    console.error('Error testing Stripe prices:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

testStripePrices();
