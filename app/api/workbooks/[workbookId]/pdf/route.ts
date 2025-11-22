import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getSignedPdfUrl } from '@/lib/s3';

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

    // Check if workbook has a PDF file URL
    if (!workbook.fileUrl) {
      return NextResponse.json(
        { error: 'Workbook PDF not available' },
        { status: 404 }
      );
    }

    // Generate signed URL for the PDF (1 hour expiration)
    const signedUrl = await getSignedPdfUrl(workbook.fileUrl, 3600);

    return NextResponse.json({
      url: signedUrl,
      workbook: {
        id: workbook.id,
        title: workbook.title,
      },
    });
  } catch (error) {
    console.error('Error fetching workbook PDF:', error);
    return NextResponse.json(
      { error: 'Failed to load workbook PDF' },
      { status: 500 }
    );
  }
}
