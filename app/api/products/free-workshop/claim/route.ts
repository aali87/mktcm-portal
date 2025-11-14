import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.redirect(
        new URL('/auth/login?redirect=/programs/free-workshop', request.url)
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
        new URL('/dashboard/programs/free-workshop', request.url)
      );
    }

    // Create a free purchase record
    await prisma.purchase.create({
      data: {
        userId: user.id,
        productId: product.id,
        amount: 0,
        status: 'COMPLETED',
      },
    });

    // Redirect to the workshop dashboard
    return NextResponse.redirect(
      new URL('/dashboard/programs/free-workshop', request.url)
    );
  } catch (error) {
    console.error('Free workshop claim error:', error);
    return NextResponse.json(
      { error: 'Failed to claim free workshop' },
      { status: 500 }
    );
  }
}
