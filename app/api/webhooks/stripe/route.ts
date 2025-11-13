import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';
import Stripe from 'stripe';

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = headers().get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'checkout.session.async_payment_failed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutFailed(session);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const { userId, productId, priceType } = session.metadata || {};

  if (!userId || !productId) {
    console.error('Missing metadata in checkout session:', session.id);
    return;
  }

  // Check if purchase already exists (prevent duplicates)
  const existingPurchase = await prisma.purchase.findFirst({
    where: {
      stripePaymentId: session.id,
    },
  });

  if (existingPurchase) {
    console.log('Purchase already recorded:', session.id);
    return;
  }

  // Get the product to verify the amount
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    console.error('Product not found:', productId);
    return;
  }

  // Create purchase record
  const purchase = await prisma.purchase.create({
    data: {
      userId,
      productId,
      stripePaymentId: session.id,
      amount: session.amount_total || product.price,
      status: 'COMPLETED',
    },
  });

  console.log('Purchase created:', purchase.id);

  // TODO: Send purchase confirmation email via Resend
  // This will be implemented in the next phase
  console.log('TODO: Send purchase confirmation email to user');
}

async function handleCheckoutFailed(session: Stripe.Checkout.Session) {
  const { userId, productId } = session.metadata || {};

  if (!userId || !productId) {
    console.error('Missing metadata in failed checkout session:', session.id);
    return;
  }

  // Create failed purchase record for tracking
  await prisma.purchase.create({
    data: {
      userId,
      productId,
      stripePaymentId: session.id,
      amount: session.amount_total || 0,
      status: 'FAILED',
    },
  });

  console.log('Failed purchase recorded:', session.id);
}
