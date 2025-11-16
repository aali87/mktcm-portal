import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getSignedPdfUrl } from '@/lib/s3';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { printableId: string } }
) {
  try {
    // Get the proper origin for redirects
    let origin = request.headers.get('x-forwarded-host');
    if (origin) {
      const protocol = request.headers.get('x-forwarded-proto') || 'https';
      origin = `${protocol}://${origin}`;
    } else {
      origin = request.headers.get('origin') ||
               request.headers.get('referer')?.split('?')[0].replace(/\/$/, '') ||
               process.env.NEXT_PUBLIC_APP_URL ||
               'http://localhost:3000';
    }

    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.redirect(
        new URL('/auth/login', origin)
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

    // Get the printable
    const printable = await prisma.printable.findUnique({
      where: { id: params.printableId },
      include: {
        product: true,
      },
    });

    if (!printable) {
      return NextResponse.json(
        { error: 'Printable not found' },
        { status: 404 }
      );
    }

    // Check if user has purchased the product
    const purchase = await prisma.purchase.findFirst({
      where: {
        userId: user.id,
        productId: printable.productId,
        status: 'COMPLETED',
      },
    });

    if (!purchase) {
      return NextResponse.redirect(
        new URL(`/programs/${printable.product.slug}`, origin)
      );
    }

    // Generate signed URL for the PDF
    const signedUrl = await getSignedPdfUrl(printable.s3Key, 3600); // 1 hour expiration

    console.log('PDF download requested:', {
      user: user.email,
      printable: printable.title,
      s3Key: printable.s3Key,
    });

    // Redirect to the signed URL for download
    return NextResponse.redirect(signedUrl);
  } catch (error) {
    console.error('Printable download error:', error);

    // Get origin for error redirect
    let origin = request.headers.get('x-forwarded-host');
    if (origin) {
      const protocol = request.headers.get('x-forwarded-proto') || 'https';
      origin = `${protocol}://${origin}`;
    } else {
      origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    }

    return NextResponse.redirect(
      new URL('/dashboard?error=download-failed', origin)
    );
  }
}
