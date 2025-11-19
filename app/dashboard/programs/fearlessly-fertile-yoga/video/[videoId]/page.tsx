import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import VideoPlayer from "@/components/VideoPlayer";
import { ArrowLeft, ChevronLeft, ChevronRight, Sparkles, Heart } from "lucide-react";

interface PageProps {
  params: {
    videoId: string;
  };
}

export default async function VideoPage({ params }: PageProps) {
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
    redirect("/dashboard");
  }

  // Check if user has purchased the product
  const purchase = await prisma.purchase.findFirst({
    where: {
      userId: session.user.id,
      productId: video.productId,
      status: "COMPLETED",
    },
  });

  if (!purchase) {
    redirect(`/programs/${video.product.slug}`);
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
    where: { productId: video.productId },
    orderBy: { order: "asc" },
    select: { id: true, order: true },
  });

  // Find previous and next videos
  const currentIndex = allVideos.findIndex((v) => v.id === video.id);
  const previousVideo = currentIndex > 0 ? allVideos[currentIndex - 1] : null;
  const nextVideo =
    currentIndex < allVideos.length - 1 ? allVideos[currentIndex + 1] : null;

  // Get main description and mantra
  const description = video.description || "";
  const parts = description.split(/Weekly mantra:/i);
  const mainDescription = parts[0].trim();
  const mantra = parts.length > 1 ? parts[1].trim() : null;

  const sessionNumber = video.order;
  const minutes = Math.round((video.duration || 0) / 60);

  return (
    <div className="min-h-screen bg-neutral-900">
      {/* Top Navigation */}
      <div className="bg-neutral-800 border-b border-neutral-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link href={`/dashboard/programs/${video.product.slug}`}>
            <Button variant="ghost" size="sm" className="text-neutral-300 hover:text-white">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Program
            </Button>
          </Link>
        </div>
      </div>

      {/* Video Player */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="aspect-video bg-black rounded-lg overflow-hidden mb-8">
          <VideoPlayer
            videoId={video.id}
            initialProgress={userProgress?.progressPercent || 0}
          />
        </div>

        {/* Video Info */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Meta */}
            <div>
              <div className="flex items-center gap-2 text-sm text-neutral-400 mb-2">
                <span>Session {sessionNumber}</span>
                <span>•</span>
                <span>{minutes} minutes</span>
              </div>
              <h1 className="font-serif text-3xl text-white mb-4">{video.title}</h1>
              <p className="text-neutral-300 leading-relaxed">{mainDescription}</p>
            </div>

            {/* Weekly Mantra */}
            {mantra && (
              <div className="bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h2 className="font-serif text-xl text-white">Weekly Mantra</h2>
                </div>
                <p className="text-lg italic text-neutral-200 leading-relaxed">{mantra}</p>
                <p className="text-sm text-neutral-400 mt-3">
                  Repeat this mantra throughout your practice to deepen your mind-body connection
                </p>
              </div>
            )}

            {/* Practice Tips */}
            <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="h-5 w-5 text-primary" />
                <h2 className="font-serif text-xl text-white">Practice Tips</h2>
              </div>
              <ul className="space-y-3 text-neutral-300">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Find a quiet, comfortable space where you won't be interrupted</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Have a yoga mat, blanket, and water nearby</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Listen to your body and modify poses as needed</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Focus on your breath and stay present with each movement</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Practice regularly for best results in supporting your fertility journey</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Sidebar - Navigation */}
          <div className="space-y-4">
            <h2 className="font-serif text-xl text-white mb-4">Continue Your Journey</h2>

            {/* Previous Video */}
            {previousVideo && (
              <Link
                href={`/dashboard/programs/${video.product.slug}/video/${previousVideo.id}`}
              >
                <Button variant="outline" className="w-full justify-start" size="lg">
                  <ChevronLeft className="mr-2 h-5 w-5" />
                  Previous Session
                </Button>
              </Link>
            )}

            {/* Next Video */}
            {nextVideo && (
              <Link
                href={`/dashboard/programs/${video.product.slug}/video/${nextVideo.id}`}
              >
                <Button className="w-full justify-start" size="lg">
                  Next Session
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            )}

            {/* Back to All Sessions */}
            <Link href={`/dashboard/programs/${video.product.slug}`}>
              <Button variant="ghost" className="w-full" size="lg">
                View All Sessions
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
