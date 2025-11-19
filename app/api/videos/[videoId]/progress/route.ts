import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface RouteParams {
  params: {
    videoId: string;
  };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
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

    // Get request body
    const body = await request.json();
    const { progressPercent } = body;

    // Validate progress percent
    if (typeof progressPercent !== 'number' || progressPercent < 0 || progressPercent > 100) {
      return NextResponse.json(
        { error: 'Invalid progress percent. Must be a number between 0 and 100.' },
        { status: 400 }
      );
    }

    // Verify video exists
    const video = await prisma.video.findUnique({
      where: { id: params.videoId },
    });

    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    console.log('[API] Saving video progress:', {
      userId: user.id,
      videoId: params.videoId,
      progressPercent: Math.round(progressPercent),
    });

    // Upsert user progress
    const userProgress = await prisma.userProgress.upsert({
      where: {
        userId_videoId: {
          userId: user.id,
          videoId: params.videoId,
        },
      },
      update: {
        progressPercent: Math.round(progressPercent),
        lastWatchedAt: new Date(),
      },
      create: {
        userId: user.id,
        videoId: params.videoId,
        progressPercent: Math.round(progressPercent),
        lastWatchedAt: new Date(),
      },
    });

    console.log('[API] Video progress saved successfully:', userProgress.progressPercent);

    return NextResponse.json({
      success: true,
      progress: userProgress.progressPercent,
    });
  } catch (error) {
    console.error('Error updating video progress:', error);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}
