import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Download, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function StressFreeGoddessDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  // Get the product
  const product = await prisma.product.findUnique({
    where: { slug: "stress-free-goddess" },
  });

  if (!product) {
    redirect("/dashboard");
  }

  // Verify user has purchased
  const purchase = await prisma.purchase.findFirst({
    where: {
      userId: session.user.id,
      productId: product.id,
      status: "COMPLETED",
    },
  });

  if (!purchase) {
    redirect("/programs/stress-free-goddess");
  }

  // Get all videos with user progress
  const videos = await prisma.video.findMany({
    where: {
      productId: product.id,
    },
    include: {
      progress: {
        where: {
          userId: session.user.id,
        },
      },
    },
    orderBy: {
      order: "asc",
    },
  });

  // Calculate progress
  const completedCount = videos.filter(
    (v) => v.progress[0]?.progressPercent >= 90
  ).length;
  const progressPercent = Math.round((completedCount / videos.length) * 100);

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-neutral-600 hover:text-primary mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>

          <div className="space-y-4">
            <h1 className="font-serif text-4xl md:text-5xl text-neutral-800">
              Stress-free Goddess Program
            </h1>
            <p className="text-lg text-neutral-600 max-w-3xl">
              12 weeks of TCM practices to reduce stress, improve sleep, and boost your
              energy. Practice Qigong, Reflexology & Guasha at your own pace.
            </p>

            {/* Overall Progress */}
            <div className="bg-white p-6 rounded-lg border border-neutral-200">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-serif text-xl text-neutral-800">Your Progress</h2>
                <span className="text-sm text-neutral-600">
                  {completedCount} of {videos.length} completed
                </span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-3">
                <div
                  className="bg-primary h-3 rounded-full transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Download Guide */}
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-lg text-neutral-800 mb-1">
                    Program Guide
                  </h3>
                  <p className="text-sm text-neutral-600">
                    Download your comprehensive 12-week reference guide
                  </p>
                </div>
                <a
                  href="/api/pdfs/stress-free-goddess/guide"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Video Grid */}
        <div className="mb-8">
          <h2 className="font-serif text-2xl text-neutral-800 mb-6">Weekly Practices</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video, index) => {
              const weekNumber = index + 1;
              const userProgress = video.progress[0];
              const progressPercent = userProgress?.progressPercent || 0;
              const isCompleted = progressPercent >= 90;
              const hasStarted = progressPercent > 0;
              const minutesDisplay = video.duration
                ? Math.round(video.duration / 60)
                : 0;

              return (
                <div
                  key={video.id}
                  className="bg-white border border-neutral-200 rounded-lg p-6 hover:border-primary transition-colors"
                >
                  <div className="space-y-4">
                    {/* Week badge */}
                    <div className="flex items-start justify-between">
                      <div className="px-3 py-1 bg-neutral-100 text-neutral-700 text-sm rounded-full">
                        Week {weekNumber}
                      </div>
                      {isCompleted && (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-serif text-lg text-neutral-800 leading-snug">
                      {video.title}
                    </h3>

                    {/* Description */}
                    {video.description && (
                      <p className="text-sm text-neutral-600 line-clamp-2">
                        {video.description}
                      </p>
                    )}

                    {/* Duration */}
                    <div className="text-sm text-neutral-500">
                      {minutesDisplay} minutes
                    </div>

                    {/* Progress bar */}
                    {hasStarted && !isCompleted && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-neutral-600">
                          <span>Progress</span>
                          <span>{progressPercent}%</span>
                        </div>
                        <div className="w-full bg-neutral-200 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Action button */}
                    <Link
                      href={`/dashboard/programs/stress-free-goddess/video/${video.id}`}
                    >
                      <Button
                        className="w-full"
                        variant={isCompleted ? "outline" : "default"}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        {isCompleted
                          ? "Watch Again"
                          : hasStarted
                          ? "Continue Watching"
                          : "Start Practice"}
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Program Info */}
        <div className="bg-white border border-neutral-200 rounded-lg p-6">
          <h3 className="font-serif text-xl text-neutral-800 mb-4">
            How to Use This Program
          </h3>
          <div className="space-y-3 text-neutral-600">
            <p>
              This 12-week program is designed to be practiced one week at a time, but
              you can move at your own pace.
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Practice each technique daily for best results</li>
              <li>Videos range from 10-19 minutes - perfect for busy schedules</li>
              <li>Your progress is saved automatically as you watch</li>
              <li>Download the program guide for offline reference</li>
              <li>Return anytime to review previous weeks</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
