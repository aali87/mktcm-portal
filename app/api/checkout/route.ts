import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { stripe } from '@/lib/stripe';

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'You must be logged in to make a purchase' },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();
    const { productId, priceType } = body;

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Validate priceType
    if (priceType && !['one-time', 'payment-plan'].includes(priceType)) {
      return NextResponse.json(
        { error: 'Invalid price type. Must be "one-time" or "payment-plan"' },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get product from database
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if user already owns this product
    const existingPurchase = await prisma.purchase.findFirst({
      where: {
        userId: user.id,
        productId: product.id,
        status: 'COMPLETED',
      },
    });

    if (existingPurchase) {
      return NextResponse.json(
        { error: 'You already own this product', redirectTo: '/dashboard' },
        { status: 400 }
      );
    }

    // Determine if we're in test mode or live mode
    // STRIPE_MODE can be 'test' or 'live' (defaults to 'live' in production)
    const isTestMode = process.env.STRIPE_MODE === 'test';

    // Determine which Stripe price ID to use based on mode and price type
    let stripePriceId: string | null = null;

    if (priceType === 'payment-plan') {
      // Payment plan price ID
      stripePriceId = isTestMode
        ? product.testPaymentPlanPriceId
        : product.paymentPlanPriceId;
    } else {
      // One-time price ID
      stripePriceId = isTestMode
        ? product.testPriceId
        : product.priceId;
    }

    if (!stripePriceId) {
      const modeText = isTestMode ? 'test' : 'live';
      console.error(`No ${modeText} mode price ID configured for product:`, product.slug);
      return NextResponse.json(
        { error: `This product does not have a Stripe price configured for ${modeText} mode` },
        { status: 400 }
      );
    }

    console.log('Stripe checkout config:', {
      mode: isTestMode ? 'test' : 'live',
      priceType,
      stripePriceId,
      productSlug: product.slug,
    });

    // Get the base URL from the request
    // Priority: 1) origin header, 2) referer header's origin, 3) NEXT_PUBLIC_APP_URL, 4) localhost
    let origin = request.headers.get('origin');

    if (!origin) {
      // Try to get origin from referer
      const referer = request.headers.get('referer');
      if (referer) {
        try {
          const refererUrl = new URL(referer);
          origin = refererUrl.origin;
        } catch (e) {
          // Invalid referer URL
        }
      }
    }

    // Fallback to environment variable or localhost
    if (!origin) {
      origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    }

    console.log('Checkout redirect URLs:', {
      origin,
      success_url: `${origin}/api/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/programs/${product.slug}?canceled=true`,
    });

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer_email: user.email,
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      mode: priceType === 'payment-plan' ? 'subscription' : 'payment',
      success_url: `${origin}/api/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/programs/${product.slug}?canceled=true`,
      metadata: {
        userId: user.id,
        productId: product.id,
        priceType: priceType || 'one-time',
      },
    });

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (error: any) {
    console.error('Checkout error:', error);
    console.error('Checkout error message:', error?.message);
    console.error('Checkout error type:', error?.type);

    // Return more specific error for debugging
    const errorMessage = error?.message || 'Failed to create checkout session';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
