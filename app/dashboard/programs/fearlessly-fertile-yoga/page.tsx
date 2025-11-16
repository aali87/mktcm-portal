import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, CheckCircle2, Clock, ArrowLeft, Sparkles } from "lucide-react";

export default async function FearlesslyFertileYogaDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  // Get the product
  const product = await prisma.product.findUnique({
    where: { slug: "fearlessly-fertile-yoga" },
  });

  if (!product) {
    redirect("/dashboard");
  }

  // Check if user has purchased
  const purchase = await prisma.purchase.findFirst({
    where: {
      userId: session.user.id,
      productId: product.id,
      status: "COMPLETED",
    },
  });

  if (!purchase) {
    redirect("/programs/fearlessly-fertile-yoga");
  }

  // Get all videos with progress
  const videos = await prisma.video.findMany({
    where: { productId: product.id },
    orderBy: { order: "asc" },
    include: {
      progress: {
        where: { userId: session.user.id },
        select: {
          progressPercent: true,
          lastWatchedAt: true,
        },
      },
    },
  });

  // Calculate progress
  const completedCount = videos.filter(
    (v) => v.progress[0]?.progressPercent >= 90
  ).length;
  const progressPercent = Math.round((completedCount / videos.length) * 100);

  // Helper function to extract mantra from description
  const extractMantra = (description: string) => {
    const mantraMatch = description.match(/Weekly mantra:(.+?)$/i);
    return mantraMatch ? mantraMatch[1].trim() : null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-neutral-50">
      <div className="max-w-container mx-auto px-6 py-12">
        {/* Back button */}
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-6 w-6 text-primary" />
            <h1 className="font-serif text-3xl md:text-4xl text-neutral-800">
              Your Fertility Yoga Journey
            </h1>
          </div>
          <p className="text-neutral-600 text-lg max-w-2xl">
            Welcome to your 10-session TCM-inspired yoga practice. Each session includes
            breathwork, acupressure, and a weekly mantra to support your fertility journey.
          </p>
        </div>

        {/* Progress Overview */}
        <div className="bg-white border border-neutral-200 rounded-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-serif text-2xl text-neutral-800 mb-1">
                Your Progress
              </h2>
              <p className="text-neutral-600">
                {completedCount} of {videos.length} sessions completed
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">{progressPercent}%</div>
              <div className="text-sm text-neutral-500">Complete</div>
            </div>
          </div>
          <Progress value={progressPercent} className="h-3" />
        </div>

        {/* Sessions Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {videos.map((video, index) => {
            const sessionNumber = index + 1;
            const userProgress = video.progress[0];
            const progressPercent = userProgress?.progressPercent || 0;
            const isCompleted = progressPercent >= 90;
            const hasStarted = progressPercent > 0;
            const minutes = Math.round((video.duration || 0) / 60);
            const mantra = video.description ? extractMantra(video.description) : null;

            // Extract main description (before mantra)
            const mainDescription = video.description
              ? video.description.split(/Weekly mantra:/i)[0].trim()
              : "";

            return (
              <div
                key={video.id}
                className="bg-white border border-neutral-200 rounded-lg p-6 hover:border-primary transition-colors"
              >
                {/* Session Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {isCompleted ? (
                        <CheckCircle2 className="h-6 w-6 text-primary" />
                      ) : (
                        <span className="font-serif text-primary font-semibold">
                          {sessionNumber}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="text-xs text-neutral-500 uppercase tracking-wide mb-1">
                        Session {sessionNumber}
                      </div>
                      <h3 className="font-serif text-lg text-neutral-800 leading-tight">
                        {video.title}
                      </h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-neutral-500 flex-shrink-0">
                    <Clock className="h-4 w-4" />
                    {minutes} min
                  </div>
                </div>

                {/* Description */}
                <p className="text-neutral-600 text-sm leading-relaxed mb-4 line-clamp-3">
                  {mainDescription}
                </p>

                {/* Mantra */}
                {mantra && (
                  <div className="bg-primary/5 border border-primary/20 rounded-md p-3 mb-4">
                    <div className="text-xs text-primary font-medium mb-1">
                      Weekly Mantra
                    </div>
                    <p className="text-sm italic text-neutral-700">{mantra}</p>
                  </div>
                )}

                {/* Progress Bar */}
                {hasStarted && !isCompleted && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
                      <span>In Progress</span>
                      <span>{Math.round(progressPercent)}%</span>
                    </div>
                    <Progress value={progressPercent} className="h-2" />
                  </div>
                )}

                {/* Action Button */}
                <Link href={`/dashboard/programs/fearlessly-fertile-yoga/video/${video.id}`}>
                  <Button
                    className="w-full"
                    variant={isCompleted ? "outline" : "default"}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {isCompleted
                      ? "Practice Again"
                      : hasStarted
                      ? "Continue Practice"
                      : "Start Practice"}
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Completion Message */}
        {completedCount === videos.length && (
          <div className="mt-12 bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 rounded-lg p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-serif text-2xl text-neutral-800 mb-2">
              Journey Complete! 🎉
            </h3>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              Congratulations on completing all 10 sessions of Fearlessly Fertile Yoga.
              You've cultivated Yin-Yang balance, enhanced circulation, and connected
              deeply with your body's wisdom. Continue practicing these sessions as often
              as you like to maintain your fertility wellness.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
