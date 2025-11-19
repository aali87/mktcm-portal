import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import VideoPlayer from "@/components/VideoPlayer";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: {
    videoId: string;
  };
}

export default async function StressFreeGoddessVideoPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  // Get the video
  const video = await prisma.video.findUnique({
    where: { id: params.videoId },
    include: {
      product: true,
    },
  });

  if (!video) {
    notFound();
  }

  // Verify user has purchased the product
  const purchase = await prisma.purchase.findFirst({
    where: {
      userId: session.user.id,
      productId: video.productId,
      status: "COMPLETED",
    },
  });

  if (!purchase) {
    redirect("/programs/stress-free-goddess");
  }

  // Get user's progress for this video
  const userProgress = await prisma.userProgress.findUnique({
    where: {
      userId_videoId: {
        userId: session.user.id,
        videoId: video.id,
      },
    },
  });

  console.log('[Server] User progress for video:', {
    videoId: video.id,
    userId: session.user.id,
    progressPercent: userProgress?.progressPercent || 0,
    hasProgress: !!userProgress,
  });

  // Get all videos in this product for navigation
  const allVideos = await prisma.video.findMany({
    where: {
      productId: video.productId,
    },
    orderBy: {
      order: "asc",
    },
    select: {
      id: true,
      order: true,
    },
  });

  // Find previous and next videos
  const currentIndex = allVideos.findIndex((v) => v.id === video.id);
  const previousVideo = currentIndex > 0 ? allVideos[currentIndex - 1] : null;
  const nextVideo =
    currentIndex < allVideos.length - 1 ? allVideos[currentIndex + 1] : null;

  const weekNumber = video.order;

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard/programs/stress-free-goddess"
            className="inline-flex items-center text-sm text-neutral-600 hover:text-primary mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Program
          </Link>

          <div className="space-y-2">
            <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm rounded-full mb-2">
              Week {weekNumber}
            </div>
            <h1 className="font-serif text-3xl md:text-4xl text-neutral-800">
              {video.title}
            </h1>
            {video.description && (
              <p className="text-neutral-600 text-lg">{video.description}</p>
            )}
          </div>
        </div>

        {/* Video Player */}
        <div className="mb-8">
          <VideoPlayer
            videoId={video.id}
            initialProgress={userProgress?.progressPercent || 0}
          />
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          {previousVideo ? (
            <Link
              href={`/dashboard/programs/stress-free-goddess/video/${previousVideo.id}`}
            >
              <Button variant="outline">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous Week
              </Button>
            </Link>
          ) : (
            <div />
          )}

          {nextVideo ? (
            <Link
              href={`/dashboard/programs/stress-free-goddess/video/${nextVideo.id}`}
            >
              <Button>
                Next Week
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          ) : (
            <div />
          )}
        </div>

        {/* Additional Info */}
        <div className="mt-8 bg-white border border-neutral-200 rounded-lg p-6">
          <h3 className="font-serif text-xl text-neutral-800 mb-3">
            Practice Tips
          </h3>
          <ul className="space-y-2 text-neutral-600">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Practice in a quiet, comfortable space where you won't be disturbed</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Follow along with the video daily for best results</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Listen to your body - never force any movement or pressure</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Consistency is key - even 5-10 minutes daily makes a difference</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
