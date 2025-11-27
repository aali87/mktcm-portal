/**
 * Stripe Integration Test Script
 *
 * This script verifies your Stripe setup is configured correctly.
 * Run with: npm run test:stripe
 */

import 'dotenv/config';
import { stripe } from '../lib/stripe';
import { prisma } from '../lib/db';

async function testStripeIntegration() {
  console.log('🧪 Testing Stripe Integration...\n');

  // Test 1: Stripe API Connection
  console.log('1️⃣  Testing Stripe API connection...');
  const isTestMode = process.env.STRIPE_MODE === 'test';
  const secretKey = isTestMode
    ? (process.env.STRIPE_TEST_SECRET_KEY || process.env.STRIPE_SECRET_KEY)
    : (process.env.STRIPE_LIVE_SECRET_KEY || process.env.STRIPE_SECRET_KEY);

  try {
    const balance = await stripe.balance.retrieve();
    console.log('✅ Connected to Stripe API successfully');
    console.log(`   STRIPE_MODE: ${process.env.STRIPE_MODE || 'not set (defaulting to live)'}`);
    console.log(`   Mode: ${secretKey?.startsWith('sk_test') ? 'TEST' : 'LIVE'}`);
    console.log(`   Available balance: $${(balance.available[0]?.amount || 0) / 100}\n`);
  } catch (error) {
    console.error('❌ Failed to connect to Stripe API');
    console.error(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    return;
  }

  // Test 2: Database Products
  console.log('2️⃣  Checking database products...');
  try {
    const products = await prisma.product.findMany({
      where: {
        price: { gt: 0 },
      },
    });

    console.log(`✅ Found ${products.length} paid product(s) in database`);

    for (const product of products) {
      console.log(`\n   📦 ${product.name}`);
      console.log(`      Price: $${product.price / 100}`);
      console.log(`      LIVE One-time: ${product.priceId || '❌ NOT SET'}`);
      console.log(`      LIVE Payment plan: ${product.paymentPlanPriceId || '❌ NOT SET'}`);
      console.log(`      TEST One-time: ${(product as any).testPriceId || '❌ NOT SET'}`);
      console.log(`      TEST Payment plan: ${(product as any).testPaymentPlanPriceId || '❌ NOT SET'}`);
    }
    console.log();
  } catch (error) {
    console.error('❌ Failed to fetch products from database');
    console.error(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    return;
  }

  // Test 3: Verify Stripe Prices
  console.log('3️⃣  Verifying Stripe price IDs...');
  const optimalBlueprint = await prisma.product.findUnique({
    where: { slug: 'optimal-fertility-blueprint' },
  });

  if (!optimalBlueprint) {
    console.error('❌ Optimal Fertility Blueprint not found in database\n');
    return;
  }

  let validPrices = 0;

  // Check one-time price
  if (optimalBlueprint.priceId) {
    try {
      const price = await stripe.prices.retrieve(optimalBlueprint.priceId);
      console.log(`✅ One-time price verified: ${price.id}`);
      console.log(`   Amount: $${(price.unit_amount || 0) / 100} ${price.currency.toUpperCase()}`);
      console.log(`   Type: ${price.type}`);
      validPrices++;
    } catch (error) {
      console.error(`❌ Invalid one-time price ID: ${optimalBlueprint.priceId}`);
      console.error(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  } else {
    console.warn('⚠️  One-time price ID not set');
  }

  // Check payment plan price
  if (optimalBlueprint.paymentPlanPriceId) {
    try {
      const price = await stripe.prices.retrieve(optimalBlueprint.paymentPlanPriceId);
      console.log(`✅ Payment plan price verified: ${price.id}`);
      console.log(`   Amount: $${(price.unit_amount || 0) / 100} ${price.currency.toUpperCase()}`);
      console.log(`   Type: ${price.type}`);
      console.log(`   Recurring: ${price.recurring?.interval} (${price.recurring?.interval_count || 1} ${price.recurring?.interval})`);
      validPrices++;
    } catch (error) {
      console.error(`❌ Invalid payment plan price ID: ${optimalBlueprint.paymentPlanPriceId}`);
      console.error(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  } else {
    console.warn('⚠️  Payment plan price ID not set');
  }

  console.log();

  // Test 4: Environment Variables
  console.log('4️⃣  Checking environment variables...');
  const requiredVars = [
    'STRIPE_MODE',
    'STRIPE_LIVE_SECRET_KEY',
    'STRIPE_TEST_SECRET_KEY',
    'STRIPE_LIVE_WEBHOOK_SECRET',
    'STRIPE_TEST_WEBHOOK_SECRET',
    'NEXT_PUBLIC_APP_URL',
  ];

  // Also accept legacy vars for backwards compatibility
  const legacyVars = [
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
  ];

  let missingVars = 0;
  for (const varName of requiredVars) {
    if (process.env[varName]) {
      console.log(`✅ ${varName} is set`);
    } else {
      console.warn(`⚠️  ${varName} is not set`);
      missingVars++;
    }
  }

  console.log('\n   Legacy variables (for backwards compatibility):');
  for (const varName of legacyVars) {
    if (process.env[varName]) {
      console.log(`✅ ${varName} is set`);
    } else {
      console.log(`   ${varName} is not set (optional)`);
    }
  }
  console.log();

  // Summary
  console.log('📊 Summary:');
  console.log('─'.repeat(50));

  if (validPrices === 2 && missingVars === 0) {
    console.log('✅ Stripe integration is fully configured!');
    console.log('\n🚀 Next steps:');
    console.log('   1. Run: stripe listen --forward-to localhost:3000/api/webhooks/stripe');
    console.log('   2. Start dev server: npm run dev');
    console.log('   3. Test checkout at: http://localhost:3000/programs/optimal-fertility-blueprint');
    console.log('   4. Use test card: 4242 4242 4242 4242');
  } else {
    console.log('⚠️  Stripe integration needs attention:');
    if (validPrices < 2) {
      console.log(`   - Set up Stripe prices (${validPrices}/2 configured)`);
      console.log('   - See STRIPE_SETUP.md for instructions');
    }
    if (missingVars > 0) {
      console.log(`   - Add missing environment variables (${missingVars} missing)`);
      console.log('   - Check .env.example for reference');
    }
  }

  console.log('─'.repeat(50));
}

// Run the test
testStripeIntegration()
  .catch((error) => {
    console.error('💥 Test script failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
