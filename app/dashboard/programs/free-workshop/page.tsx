import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, CheckCircle, Clock, ArrowLeft } from 'lucide-react';

export default async function FreeWorkshopDashboard() {
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

  // Get the Free Workshop product
  const product = await prisma.product.findUnique({
    where: { slug: 'free-workshop' },
    include: {
      videos: {
        orderBy: { orderIndex: 'asc' },
      },
    },
  });

  if (!product) {
    return (
      <div className="max-w-container mx-auto px-6 py-12">
        <p>Workshop not found.</p>
      </div>
    );
  }

  // Check if user has access
  const purchase = await prisma.purchase.findFirst({
    where: {
      userId: user.id,
      productId: product.id,
      status: 'COMPLETED',
    },
  });

  if (!purchase) {
    redirect('/programs/free-workshop');
  }

  // Get user progress for all videos
  const progressRecords = await prisma.userProgress.findMany({
    where: {
      userId: user.id,
      videoId: {
        in: product.videos.map((v) => v.id),
      },
    },
  });

  const progressMap = new Map(
    progressRecords.map((p) => [p.videoId, p.progressPercent])
  );

  const videosWithProgress = product.videos.map((video) => ({
    ...video,
    progress: progressMap.get(video.id) || 0,
  }));

  // Calculate overall completion
  const completedVideos = videosWithProgress.filter((v) => v.progress >= 90).length;
  const totalVideos = product.videos.length;
  const overallProgress = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="font-serif text-4xl text-neutral-800 mb-2">
            {product.name}
          </h1>
          <p className="text-lg text-neutral-600 mb-4">{product.description}</p>

          {/* Progress Bar */}
          <div className="bg-white rounded-lg p-4 border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-neutral-700">
                Overall Progress
              </span>
              <span className="text-sm font-medium text-primary">
                {completedVideos} of {totalVideos} completed
              </span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Video List */}
        <div className="space-y-4">
          {videosWithProgress.map((video, index) => {
            const isCompleted = video.progress >= 90;
            const isStarted = video.progress > 0 && video.progress < 90;

            return (
              <Card key={video.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-semibold flex-shrink-0">
                          {index + 1}
                        </div>
                        <div>
                          <CardTitle className="font-serif text-xl">
                            {video.title}
                          </CardTitle>
                          <div className="flex items-center gap-4 mt-1">
                            <div className="flex items-center gap-1 text-sm text-neutral-500">
                              <Clock className="h-4 w-4" />
                              <span>{video.duration ? Math.round(video.duration / 60) : 0} min</span>
                            </div>
                            {isCompleted && (
                              <div className="flex items-center gap-1 text-sm text-green-600">
                                <CheckCircle className="h-4 w-4" />
                                <span>Completed</span>
                              </div>
                            )}
                            {isStarted && (
                              <div className="text-sm text-primary">
                                {Math.round(video.progress)}% watched
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <CardDescription className="ml-13">
                        {video.description}
                      </CardDescription>
                    </div>

                    <Link href={`/dashboard/programs/free-workshop/video/${video.id}`}>
                      <Button className="gap-2 flex-shrink-0">
                        <Play className="h-4 w-4" />
                        {isCompleted
                          ? 'Watch Again'
                          : isStarted
                          ? 'Continue'
                          : 'Start Video'}
                      </Button>
                    </Link>
                  </div>
                </CardHeader>

                {/* Progress bar for individual video */}
                {video.progress > 0 && (
                  <CardContent>
                    <div className="w-full bg-neutral-200 rounded-full h-1.5">
                      <div
                        className="bg-primary h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${video.progress}%` }}
                      />
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        {/* Completion Message */}
        {completedVideos === totalVideos && totalVideos > 0 && (
          <Card className="mt-8 border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                <h3 className="font-serif text-2xl text-neutral-800 mb-2">
                  Congratulations! 🎉
                </h3>
                <p className="text-neutral-600 mb-4">
                  You've completed the Free Workshop. Ready to take the next step?
                </p>
                <Link href="/programs">
                  <Button size="lg">Explore Our Programs</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
