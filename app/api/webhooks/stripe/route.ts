import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';
import { sendPurchaseConfirmationEmail } from '@/lib/email';
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

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(invoice);
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

  // Determine payment type from metadata or session mode
  const { priceType: metadataPriceType } = session.metadata || {};
  let paymentType: 'FULL' | 'PLAN' | null = null;
  let subscriptionId: string | null = null;

  if (session.mode === 'subscription') {
    paymentType = 'PLAN';
    subscriptionId = session.subscription as string;
  } else if (session.mode === 'payment') {
    // Use metadata priceType if available, otherwise default to FULL
    if (metadataPriceType === 'payment-plan') {
      paymentType = 'PLAN';
    } else {
      paymentType = 'FULL';
    }
  }

  // Create purchase record
  const purchase = await prisma.purchase.create({
    data: {
      userId,
      productId,
      stripePaymentId: session.id,
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: subscriptionId,
      amount: session.amount_total || product.price,
      status: 'COMPLETED',
      paymentType,
      planComplete: paymentType === 'FULL', // Full payment is immediately complete
    },
  });

  console.log('Purchase created:', purchase.id, { paymentType, subscriptionId });

  // Send purchase confirmation email
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (user) {
      const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/programs/${product.slug}`;

      await sendPurchaseConfirmationEmail(
        user.email,
        user.name || 'there',
        product.name,
        purchase.amount,
        dashboardUrl
      );

      console.log('[Webhook] Purchase confirmation email sent:', user.email);
    }
  } catch (emailError) {
    // Don't fail the webhook if email fails
    console.error('[Webhook] Error sending purchase confirmation email:', emailError);
  }
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

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  // Only process subscription invoices
  if (!invoice.subscription) {
    return;
  }

  const subscriptionId = invoice.subscription as string;

  // Find the purchase by subscription ID
  const purchase = await prisma.purchase.findFirst({
    where: {
      stripeSubscriptionId: subscriptionId,
    },
  });

  if (!purchase) {
    console.log('No purchase found for subscription:', subscriptionId);
    return;
  }

  // If already marked complete, skip
  if (purchase.planComplete) {
    return;
  }

  // Get the subscription to check payment count
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  // Count successful invoices for this subscription
  const invoices = await stripe.invoices.list({
    subscription: subscriptionId,
    status: 'paid',
    limit: 100,
  });

  const paidInvoiceCount = invoices.data.length;

  console.log(`Subscription ${subscriptionId} has ${paidInvoiceCount} paid invoices`);

  // For a 3-payment plan, mark complete after 3rd payment
  // Adjust this number based on your payment plan structure
  if (paidInvoiceCount >= 3) {
    await prisma.purchase.update({
      where: { id: purchase.id },
      data: {
        planComplete: true,
      },
    });

    console.log(`Payment plan completed for purchase ${purchase.id}`);

    // TODO: Send bonus workbook access notification email
    console.log('TODO: Send bonus workbook unlocked email to user');
  }
}
