import { NextRequest, NextResponse } from 'next/server';
import { getSignedPdfUrl } from '@/lib/s3';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: {
    productSlug: string;
  };
}

/**
 * Generate signed URL for program guide PDF
 * NO authentication required - this is a free lead magnet
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { productSlug } = params;

    // Map product slug to PDF key in S3
    const pdfKeyMap: Record<string, string> = {
      'stress-free-goddess': 'pdfs/stress-free-goddess/program-guide.pdf',
      // Add more products here as needed
    };

    const pdfKey = pdfKeyMap[productSlug];

    if (!pdfKey) {
      return NextResponse.json(
        { error: 'Program guide not found for this product' },
        { status: 404 }
      );
    }

    // Generate signed URL (1 hour expiration)
    const signedUrl = await getSignedPdfUrl(pdfKey, 3600);

    // Redirect to the signed S3 URL
    return NextResponse.redirect(signedUrl);
  } catch (error) {
    console.error('Error generating PDF URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate download link' },
      { status: 500 }
    );
  }
}
