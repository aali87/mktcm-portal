import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Lock, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function OptimalFertilityBlueprintDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  // Get the product
  const product = await prisma.product.findUnique({
    where: { slug: "optimal-fertility-blueprint" },
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
    redirect("/programs/optimal-fertility-blueprint");
  }

  // Get all workbooks with user progress
  const workbooks = await prisma.workbook.findMany({
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
      orderIndex: "asc",
    },
  });

  // Separate regular workbooks and bonus
  const regularWorkbooks = workbooks.filter((w) => !w.bonusOnly);
  const bonusWorkbook = workbooks.find((w) => w.bonusOnly);

  // Calculate progress
  const completedCount = regularWorkbooks.filter(
    (w) => w.progress[0]?.completed
  ).length;
  const progressPercent = Math.round((completedCount / regularWorkbooks.length) * 100);

  // Check if user is eligible for bonus
  const bonusEligible =
    purchase.paymentType === "FULL" ||
    (purchase.paymentType === "PLAN" && purchase.planComplete);

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
              The Optimal Fertility Blueprint
            </h1>
            <p className="text-lg text-neutral-600 max-w-3xl">
              9 weeks to reproductive health. Each week focuses on a different organ system
              and energy channel in Traditional Chinese Medicine.
            </p>

            {/* Overall Progress */}
            <div className="bg-white p-6 rounded-lg border border-neutral-200">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-serif text-xl text-neutral-800">Your Progress</h2>
                <span className="text-sm text-neutral-600">
                  {completedCount} of {regularWorkbooks.length} completed
                </span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-3">
                <div
                  className="bg-primary h-3 rounded-full transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Workbooks Grid */}
        <div className="mb-12">
          <h2 className="font-serif text-2xl text-neutral-800 mb-6">Weekly Workbooks</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularWorkbooks.map((workbook) => {
              const userProgress = workbook.progress[0];
              const isCompleted = userProgress?.completed;
              const lastPage = userProgress?.lastViewedPage || 0;
              const hasStarted = lastPage > 0;

              return (
                <div
                  key={workbook.id}
                  className="bg-white border border-neutral-200 rounded-lg p-6 hover:border-primary transition-colors"
                >
                  <div className="space-y-4">
                    {/* Week badge */}
                    <div className="flex items-start justify-between">
                      <div className="px-3 py-1 bg-neutral-100 text-neutral-700 text-sm rounded-full">
                        Week {workbook.weekNumber}
                      </div>
                      {isCompleted && (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-serif text-xl text-neutral-800">
                      {workbook.title}
                    </h3>

                    {/* Description */}
                    {workbook.description && (
                      <p className="text-sm text-neutral-600 line-clamp-3">
                        {workbook.description}
                      </p>
                    )}

                    {/* Progress indicator */}
                    {hasStarted && !isCompleted && workbook.totalPages && (
                      <div className="text-sm text-neutral-600">
                        Page {lastPage} of {workbook.totalPages}
                      </div>
                    )}

                    {/* Action button */}
                    <Link href={`/dashboard/programs/optimal-fertility-blueprint/workbook/${workbook.slug}`}>
                      <Button className="w-full" variant={isCompleted ? "outline" : "default"}>
                        <BookOpen className="h-4 w-4 mr-2" />
                        {isCompleted
                          ? "Review Workbook"
                          : hasStarted
                          ? "Continue"
                          : "Start Workbook"}
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bonus Workbook */}
        {bonusWorkbook && (
          <div className="mb-8">
            <h2 className="font-serif text-2xl text-neutral-800 mb-6">Bonus Content</h2>
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20 rounded-lg p-8">
              <div className="max-w-3xl">
                <div className="flex items-start gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <h3 className="font-serif text-2xl text-neutral-800">
                        {bonusWorkbook.title}
                      </h3>
                      {!bonusEligible && (
                        <Lock className="h-5 w-5 text-neutral-500" />
                      )}
                    </div>

                    {bonusWorkbook.description && (
                      <p className="text-neutral-700">{bonusWorkbook.description}</p>
                    )}

                    {bonusEligible ? (
                      <>
                        {bonusWorkbook.progress[0]?.completed && (
                          <div className="flex items-center gap-2 text-primary">
                            <CheckCircle2 className="h-5 w-5" />
                            <span className="text-sm font-medium">Completed</span>
                          </div>
                        )}
                        <Link href={`/dashboard/programs/optimal-fertility-blueprint/workbook/${bonusWorkbook.slug}`}>
                          <Button size="lg" className="mt-2">
                            <BookOpen className="h-4 w-4 mr-2" />
                            View Bonus Workbook
                          </Button>
                        </Link>
                      </>
                    ) : (
                      <div className="bg-white/80 p-4 rounded-lg border border-neutral-200">
                        <div className="flex items-start gap-3">
                          <Lock className="h-5 w-5 text-neutral-500 mt-0.5" />
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-neutral-800">
                              Unlock the Bonus Workbook
                            </p>
                            <p className="text-sm text-neutral-600">
                              {purchase.paymentType === "PLAN"
                                ? "Complete all 3 payments of your payment plan to unlock this bonus content."
                                : "This bonus is available with the full payment option."}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Program Info */}
        <div className="bg-white border border-neutral-200 rounded-lg p-6">
          <h3 className="font-serif text-xl text-neutral-800 mb-4">
            How to Use This Program
          </h3>
          <div className="space-y-3 text-neutral-600">
            <p>
              This 9-week program is designed to be completed sequentially, one week at a time.
              Each workbook builds on the previous week's foundation.
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Complete one workbook per week for optimal results</li>
              <li>Practice the techniques daily for best integration</li>
              <li>Your progress is saved automatically as you read</li>
              <li>Return anytime to review previous workbooks</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
