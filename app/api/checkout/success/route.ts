import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe } from '@/lib/stripe';

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get the proper origin for redirects
    let origin = request.headers.get('x-forwarded-host');
    if (origin) {
      // Railway and other proxies use x-forwarded-host
      const protocol = request.headers.get('x-forwarded-proto') || 'https';
      origin = `${protocol}://${origin}`;
    } else {
      // Fallback to other methods
      origin = request.headers.get('origin') ||
               request.headers.get('referer')?.split('?')[0].replace(/\/$/, '') ||
               process.env.NEXT_PUBLIC_APP_URL ||
               'http://localhost:3000';
    }

    console.log('Success redirect origin:', origin);

    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.redirect(
        new URL('/auth/login?error=unauthorized', origin)
      );
    }

    // Get session_id from query params
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.redirect(
        new URL('/dashboard?error=missing-session', origin)
      );
    }

    // Retrieve the checkout session from Stripe
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

    // Verify the session belongs to the current user
    if (checkoutSession.customer_email !== session.user.email) {
      return NextResponse.redirect(
        new URL('/dashboard?error=unauthorized', origin)
      );
    }

    // Check payment status
    if (checkoutSession.payment_status === 'paid') {
      // Payment successful - redirect to dashboard with success message
      return NextResponse.redirect(
        new URL('/dashboard?success=true', origin)
      );
    } else if (checkoutSession.payment_status === 'unpaid') {
      // Payment pending (async payment methods)
      return NextResponse.redirect(
        new URL('/dashboard?pending=true', origin)
      );
    } else {
      // Payment failed or incomplete
      return NextResponse.redirect(
        new URL('/dashboard?error=payment-failed', origin)
      );
    }
  } catch (error) {
    console.error('Checkout success error:', error);

    // Get origin for error redirect
    let origin = request.headers.get('x-forwarded-host');
    if (origin) {
      const protocol = request.headers.get('x-forwarded-proto') || 'https';
      origin = `${protocol}://${origin}`;
    } else {
      origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    }

    return NextResponse.redirect(
      new URL('/dashboard?error=verification-failed', origin)
    );
  }
}
