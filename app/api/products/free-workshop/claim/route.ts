import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
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

    console.log('Free workshop claim origin:', origin);

    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.redirect(
        new URL('/auth/login?redirect=/programs/free-workshop', origin)
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

    // Get the Free Workshop product
    const product = await prisma.product.findUnique({
      where: { slug: 'free-workshop' },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if user already has access
    const existingPurchase = await prisma.purchase.findFirst({
      where: {
        userId: user.id,
        productId: product.id,
        status: 'COMPLETED',
      },
    });

    if (existingPurchase) {
      // Already has access, redirect to dashboard
      return NextResponse.redirect(
        new URL('/dashboard/programs/free-workshop', origin)
      );
    }

    // Create a free purchase record (tracks user access)
    await prisma.purchase.create({
      data: {
        userId: user.id,
        productId: product.id,
        amount: 0,
        status: 'COMPLETED',
        paymentType: 'FREE',
      },
    });

    console.log('Free workshop access granted to user:', user.email);

    // Redirect to the workshop dashboard
    return NextResponse.redirect(
      new URL('/dashboard/programs/free-workshop', origin)
    );
  } catch (error) {
    console.error('Free workshop claim error:', error);

    // Get origin for error redirect
    let origin = request.headers.get('x-forwarded-host');
    if (origin) {
      const protocol = request.headers.get('x-forwarded-proto') || 'https';
      origin = `${protocol}://${origin}`;
    } else {
      origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    }

    return NextResponse.redirect(
      new URL('/dashboard?error=claim-failed', origin)
    );
  }
}
