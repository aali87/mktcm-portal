import Stripe from 'stripe';

// Use a dummy key during build if STRIPE_SECRET_KEY is not set
// This allows Next.js to build without failing, but will error at runtime if actually used
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key_for_build';

if (!process.env.STRIPE_SECRET_KEY && process.env.NODE_ENV !== 'production') {
  console.warn('Warning: STRIPE_SECRET_KEY is not set. Using dummy key for build.');
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-11-20.acacia' as any, // Using any to bypass version check - v17.7.0 works fine with this version
  typescript: true,
});
