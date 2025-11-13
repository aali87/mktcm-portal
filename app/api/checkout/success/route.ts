import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe } from '@/lib/stripe';

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.redirect(
        new URL('/auth/login?error=unauthorized', request.url)
      );
    }

    // Get session_id from query params
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.redirect(
        new URL('/dashboard?error=missing-session', request.url)
      );
    }

    // Retrieve the checkout session from Stripe
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

    // Verify the session belongs to the current user
    if (checkoutSession.customer_email !== session.user.email) {
      return NextResponse.redirect(
        new URL('/dashboard?error=unauthorized', request.url)
      );
    }

    // Check payment status
    if (checkoutSession.payment_status === 'paid') {
      // Payment successful - redirect to dashboard with success message
      return NextResponse.redirect(
        new URL('/dashboard?success=true', request.url)
      );
    } else if (checkoutSession.payment_status === 'unpaid') {
      // Payment pending (async payment methods)
      return NextResponse.redirect(
        new URL('/dashboard?pending=true', request.url)
      );
    } else {
      // Payment failed or incomplete
      return NextResponse.redirect(
        new URL('/dashboard?error=payment-failed', request.url)
      );
    }
  } catch (error) {
    console.error('Checkout success error:', error);
    return NextResponse.redirect(
      new URL('/dashboard?error=verification-failed', request.url)
    );
  }
}
