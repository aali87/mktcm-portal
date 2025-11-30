import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getSignedVideoUrl } from '@/lib/s3';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface RouteParams {
  params: {
    videoId: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
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

    // Get the workbook video
    const workbookVideo = await prisma.workbookVideo.findUnique({
      where: { id: params.videoId },
      include: {
        workbook: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!workbookVideo) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    // Verify user has purchased the product
    const purchase = await prisma.purchase.findFirst({
      where: {
        userId: user.id,
        productId: workbookVideo.workbook.product.id,
        status: 'COMPLETED',
      },
    });

    if (!purchase) {
      return NextResponse.json(
        { error: 'Access denied. You must purchase this product first.' },
        { status: 403 }
      );
    }

    // Check if video has an S3 key
    if (!workbookVideo.s3Key) {
      return NextResponse.json(
        { error: 'Video not available. S3 key is missing.' },
        { status: 404 }
      );
    }

    // Generate signed URL (1 hour expiration)
    const signedUrl = await getSignedVideoUrl(workbookVideo.s3Key, 3600);

    return NextResponse.json({ url: signedUrl });
  } catch (error) {
    console.error('Error generating workbook video URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate video URL' },
      { status: 500 }
    );
  }
}
