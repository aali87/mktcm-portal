import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

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

    // Determine which Stripe price ID to use
    let stripePriceId: string | null = null;
    if (priceType === 'payment-plan' && product.paymentPlanPriceId) {
      stripePriceId = product.paymentPlanPriceId;
    } else if (product.priceId) {
      stripePriceId = product.priceId;
    }

    if (!stripePriceId) {
      return NextResponse.json(
        { error: 'This product does not have a Stripe price configured' },
        { status: 400 }
      );
    }

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
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/programs/${product.slug}?canceled=true`,
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
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
