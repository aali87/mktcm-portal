import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import VideoPlayer from '@/components/VideoPlayer';

interface VideoPageProps {
  params: {
    videoId: string;
  };
}

export default async function VideoPlayerPage({ params }: VideoPageProps) {
  const session = await getServerSession(authOptions);

  // Require authentication
  if (!session?.user?.email) {
    redirect('/auth/login?redirect=/dashboard/programs/free-workshop');
  }

  // Get user from database
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    redirect('/auth/login');
  }

  // Get the video
  const video = await prisma.video.findUnique({
    where: { id: params.videoId },
    include: {
      product: true,
    },
  });

  if (!video) {
    return (
      <div className="max-w-container mx-auto px-6 py-12">
        <p>Video not found.</p>
      </div>
    );
  }

  // Check if user has access to the product
  const purchase = await prisma.purchase.findFirst({
    where: {
      userId: user.id,
      productId: video.product.id,
      status: 'COMPLETED',
    },
  });

  if (!purchase) {
    redirect('/programs/free-workshop');
  }

  // Get user's progress for this video
  const userProgress = await prisma.userProgress.findUnique({
    where: {
      userId_videoId: {
        userId: user.id,
        videoId: video.id,
      },
    },
  });

  // Get all videos in this product for navigation
  const allVideos = await prisma.video.findMany({
    where: { productId: video.product.id },
    orderBy: { order: 'asc' },
  });

  const currentIndex = allVideos.findIndex((v) => v.id === video.id);
  const previousVideo = currentIndex > 0 ? allVideos[currentIndex - 1] : null;
  const nextVideo = currentIndex < allVideos.length - 1 ? allVideos[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-neutral-900">
      {/* Top Navigation */}
      <div className="bg-neutral-800 border-b border-neutral-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link href="/dashboard/programs/free-workshop">
            <Button variant="ghost" size="sm" className="text-neutral-300 hover:text-white">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Program
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Video Player Section */}
        <div className="bg-black">
          <VideoPlayer
            videoId={video.id}
            initialProgress={userProgress?.progressPercent || 0}
          />
        </div>

        {/* Video Info Section */}
        <div className="bg-white px-6 py-8">
          <div className="max-w-4xl mx-auto">

            <h1 className="font-serif text-3xl text-neutral-800 mb-2">
              {video.title}
            </h1>
            <p className="text-lg text-neutral-600 mb-6">
              {video.description}
            </p>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between gap-4 pt-6 border-t border-neutral-200">
              <div className="flex-1">
                {previousVideo ? (
                  <Link href={`/dashboard/programs/free-workshop/video/${previousVideo.id}`}>
                    <Button variant="outline" className="gap-2">
                      <ArrowLeft className="h-4 w-4" />
                      Previous: {previousVideo.title}
                    </Button>
                  </Link>
                ) : (
                  <div />
                )}
              </div>

              <div className="flex-1 flex justify-end">
                {nextVideo ? (
                  <Link href={`/dashboard/programs/free-workshop/video/${nextVideo.id}`}>
                    <Button className="gap-2">
                      Next: {nextVideo.title}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <Link href="/dashboard/programs/free-workshop">
                    <Button className="gap-2">
                      Back to Workshop
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
