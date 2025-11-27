import Stripe from 'stripe';

// Determine if we're in test mode or live mode
// STRIPE_MODE can be 'test' or 'live' (defaults to 'live' in production)
const isTestMode = process.env.STRIPE_MODE === 'test';

// Select the appropriate secret key based on mode
// Use STRIPE_TEST_SECRET_KEY for test mode, STRIPE_LIVE_SECRET_KEY for live mode
// Falls back to STRIPE_SECRET_KEY for backwards compatibility
const stripeSecretKey = isTestMode
  ? (process.env.STRIPE_TEST_SECRET_KEY || process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key_for_build')
  : (process.env.STRIPE_LIVE_SECRET_KEY || process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key_for_build');

if (!stripeSecretKey.startsWith('sk_') && process.env.NODE_ENV !== 'production') {
  console.warn('Warning: No valid Stripe secret key set. Using dummy key for build.');
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-11-20.acacia' as any, // Using any to bypass version check - v17.7.0 works fine with this version
  typescript: true,
});
