import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: {
    workbookId: string;
  };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { lastViewedPage, completed } = await request.json();

    if (typeof lastViewedPage !== 'number') {
      return NextResponse.json(
        { error: 'Invalid lastViewedPage' },
        { status: 400 }
      );
    }

    // Verify workbook exists
    const workbook = await prisma.workbook.findUnique({
      where: { id: params.workbookId },
    });

    if (!workbook) {
      return NextResponse.json(
        { error: 'Workbook not found' },
        { status: 404 }
      );
    }

    // Upsert progress record
    const progress = await prisma.workbookProgress.upsert({
      where: {
        userId_workbookId: {
          userId: session.user.id,
          workbookId: params.workbookId,
        },
      },
      update: {
        lastViewedPage,
        completed: completed || false,
        lastViewedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        workbookId: params.workbookId,
        lastViewedPage,
        completed: completed || false,
      },
    });

    return NextResponse.json({ success: true, progress });
  } catch (error) {
    console.error('Error saving workbook progress:', error);
    return NextResponse.json(
      { error: 'Failed to save progress' },
      { status: 500 }
    );
  }
}
