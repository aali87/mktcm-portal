import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getSignedUrlsForFolder } from '@/lib/s3';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: {
    workbookId: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get workbook
    const workbook = await prisma.workbook.findUnique({
      where: { id: params.workbookId },
      include: {
        product: true,
      },
    });

    if (!workbook) {
      return NextResponse.json(
        { error: 'Workbook not found' },
        { status: 404 }
      );
    }

    // Check if user has purchased the product
    const purchase = await prisma.purchase.findFirst({
      where: {
        userId: session.user.id,
        productId: workbook.productId,
        status: 'COMPLETED',
      },
    });

    if (!purchase) {
      return NextResponse.json(
        { error: 'Purchase required to access this workbook' },
        { status: 403 }
      );
    }

    // Check bonus workbook eligibility
    if (workbook.bonusOnly) {
      const isEligible =
        purchase.paymentType === 'FULL' ||
        (purchase.paymentType === 'PLAN' && purchase.planComplete);

      if (!isEligible) {
        return NextResponse.json(
          {
            error: 'Bonus workbook access requires full payment or completed payment plan',
          },
          { status: 403 }
        );
      }
    }

    // Validate S3 folder path and total pages
    if (!workbook.s3FolderPath || !workbook.totalPages) {
      return NextResponse.json(
        { error: 'Workbook content not available' },
        { status: 404 }
      );
    }

    // Generate signed URLs for all pages
    const pages = await getSignedUrlsForFolder(
      workbook.s3FolderPath,
      workbook.totalPages,
      3600 // 1 hour expiration
    );

    return NextResponse.json({
      workbook: {
        id: workbook.id,
        title: workbook.title,
        totalPages: workbook.totalPages,
      },
      pages,
    });
  } catch (error) {
    console.error('Error fetching workbook pages:', error);
    return NextResponse.json(
      { error: 'Failed to load workbook pages' },
      { status: 500 }
    );
  }
}
