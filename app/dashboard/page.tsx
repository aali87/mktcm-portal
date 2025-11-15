import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Play, Download, BookOpen } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login");
  }

  // Fetch user's purchases
  const purchases = await prisma.purchase.findMany({
    where: {
      userId: session.user.id,
      status: "COMPLETED",
    },
    include: {
      product: {
        include: {
          videos: {
            orderBy: { order: "asc" },
          },
          workbooks: {
            orderBy: { orderIndex: "asc" },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Fetch user's progress
  const progress = await prisma.userProgress.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      video: true,
    },
  });

  // Calculate overall progress for each program
  const programProgress = purchases.map((purchase: typeof purchases[number]) => {
    const totalVideos = purchase.product.videos.length;
    const completedVideos = progress.filter(
      (p: typeof progress[number]) =>
        p.completed &&
        purchase.product.videos.some((v: typeof purchase.product.videos[number]) => v.id === p.videoId)
    ).length;

    return {
      product: purchase.product,
      totalVideos,
      completedVideos,
      progressPercent: totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0,
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-neutral-50">
      <Header user={session.user} />

      <main className="max-w-container mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="font-serif text-4xl text-neutral-800 mb-3">
            Welcome back, {session.user.name?.split(" ")[0] || "there"}
          </h1>
          <p className="text-body-lg text-neutral-600">
            Continue your fertility journey with your personalized programs
          </p>
        </div>

        {/* Programs Grid */}
        {programProgress.length === 0 ? (
          <Card className="text-center py-12">
            <CardHeader>
              <CardTitle className="font-serif">No programs yet</CardTitle>
              <CardDescription>
                Explore our programs to begin your fertility journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/programs">
                <Button>Browse Programs</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {programProgress.map(({ product, totalVideos, completedVideos, progressPercent }: typeof programProgress[number]) => (
              <Card key={product.id} className="hover:border-primary transition-colors">
                <CardHeader>
                  <CardTitle className="font-serif text-xl">{product.name}</CardTitle>
                  <CardDescription>{product.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">Progress</span>
                      <span className="font-medium text-neutral-800">
                        {completedVideos} / {totalVideos} videos completed
                      </span>
                    </div>
                    <Progress value={progressPercent} />
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-3">
                    {totalVideos > 0 && (
                      <Link href={`/programs/${product.slug}/videos`}>
                        <Button variant="outline" className="w-full gap-2">
                          <Play className="h-4 w-4" />
                          Watch Videos
                        </Button>
                      </Link>
                    )}

                    {product.workbooks.length > 0 && (
                      <Link href={`/programs/${product.slug}/workbooks`}>
                        <Button variant="outline" className="w-full gap-2">
                          <Download className="h-4 w-4" />
                          Workbooks
                        </Button>
                      </Link>
                    )}
                  </div>

                  <Link href={`/programs/${product.slug}`}>
                    <Button className="w-full gap-2">
                      <BookOpen className="h-4 w-4" />
                      View Program
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Continue Watching Section */}
        {progress.filter((p: typeof progress[number]) => !p.completed && p.progressPercent > 0).length > 0 && (
          <div className="mt-12">
            <h2 className="font-serif text-2xl text-neutral-800 mb-6">
              Continue Watching
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {progress
                .filter((p: typeof progress[number]) => !p.completed && p.progressPercent > 0)
                .slice(0, 3)
                .map((p: typeof progress[number]) => (
                  <Card key={p.id} className="hover:border-primary transition-colors">
                    <CardContent className="p-4">
                      <h3 className="font-serif text-sm font-medium mb-2">
                        {p.video.title}
                      </h3>
                      <Progress value={p.progressPercent} className="mb-3" />
                      <Link href={`/videos/${p.video.id}`}>
                        <Button size="sm" className="w-full gap-2">
                          <Play className="h-3 w-3" />
                          Continue
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
