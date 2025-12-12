import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getSignedPdfUrl } from '@/lib/s3';

export const dynamic = 'force-dynamic';

// S3 key for the BBT printable chart
const BBT_CHART_S3_KEY = 'workbooks/optimal-fertility-blueprint/pdfs/bbt-printable-chart.pdf';

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has purchased the Optimal Fertility Blueprint
    const purchase = await prisma.purchase.findFirst({
      where: {
        userId: session.user.id,
        product: {
          slug: 'optimal-fertility-blueprint',
        },
        status: 'COMPLETED',
      },
    });

    if (!purchase) {
      return NextResponse.json(
        { error: 'Purchase required to download this resource' },
        { status: 403 }
      );
    }

    // Check bonus eligibility (full payment or completed plan)
    const isEligible =
      purchase.paymentType === 'FULL' ||
      (purchase.paymentType === 'PLAN' && purchase.planComplete);

    if (!isEligible) {
      return NextResponse.json(
        { error: 'Bonus content requires full payment or completed payment plan' },
        { status: 403 }
      );
    }

    // Generate signed URL for the BBT chart PDF
    const url = await getSignedPdfUrl(BBT_CHART_S3_KEY, 3600); // 1 hour expiration

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Error generating BBT chart download URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate download URL' },
      { status: 500 }
    );
  }
}
