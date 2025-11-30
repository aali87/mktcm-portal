import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get s3Key from query params
    const { searchParams } = new URL(request.url);
    const s3Key = searchParams.get('s3Key');

    if (!s3Key) {
      return NextResponse.json(
        { error: 'Missing s3Key parameter' },
        { status: 400 }
      );
    }

    // Find workbook video by S3 key
    const workbookVideo = await prisma.workbookVideo.findFirst({
      where: { s3Key },
      include: {
        workbook: true,
      },
    });

    if (!workbookVideo) {
      return NextResponse.json(
        { error: 'Video not found for this S3 key' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: workbookVideo.id,
      title: workbookVideo.title,
      workbookId: workbookVideo.workbookId,
      workbookSlug: workbookVideo.workbook.slug,
    });
  } catch (error) {
    console.error('Error looking up workbook video:', error);
    return NextResponse.json(
      { error: 'Failed to lookup video' },
      { status: 500 }
    );
  }
}
