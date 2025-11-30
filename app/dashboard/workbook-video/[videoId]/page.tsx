import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import WorkbookVideoPlayer from "@/components/WorkbookVideoPlayer";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: {
    videoId: string;
  };
  searchParams: {
    returnPage?: string;
    workbookSlug?: string;
    productSlug?: string;
  };
}

export default async function WorkbookVideoPage({ params, searchParams }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  // Get the workbook video
  const workbookVideo = await prisma.workbookVideo.findUnique({
    where: { id: params.videoId },
    include: {
      workbook: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!workbookVideo) {
    notFound();
  }

  // Verify user has purchased the product
  const purchase = await prisma.purchase.findFirst({
    where: {
      userId: session.user.id,
      productId: workbookVideo.workbook.product.id,
      status: "COMPLETED",
    },
  });

  if (!purchase) {
    redirect(`/programs/${workbookVideo.workbook.product.slug}`);
  }

  // Get user's progress for this video
  const userProgress = await prisma.workbookVideoProgress.findUnique({
    where: {
      userId_workbookVideoId: {
        userId: session.user.id,
        workbookVideoId: workbookVideo.id,
      },
    },
  });

  // Build return URL
  const returnPage = searchParams.returnPage ? parseInt(searchParams.returnPage) : 1;
  const workbookSlug = searchParams.workbookSlug || workbookVideo.workbook.slug;
  const productSlug = searchParams.productSlug || workbookVideo.workbook.product.slug;

  const returnUrl = `/dashboard/programs/${productSlug}/workbook/${workbookSlug}?page=${returnPage}`;

  // Determine week or bonus label
  const weekNumber = workbookVideo.workbook.weekNumber;
  const isBonus = workbookVideo.workbook.bonusOnly;

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={returnUrl}
            className="inline-flex items-center text-sm text-neutral-600 hover:text-primary mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Workbook
          </Link>

          <div className="space-y-2">
            <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm rounded-full mb-2">
              {isBonus ? "Bonus Content" : `Week ${weekNumber}`}
            </div>
            <h1 className="font-serif text-3xl md:text-4xl text-neutral-800">
              {workbookVideo.title}
            </h1>
            {workbookVideo.description && (
              <p className="text-neutral-600 text-lg">{workbookVideo.description}</p>
            )}
          </div>
        </div>

        {/* Video Player */}
        <div className="mb-8">
          <WorkbookVideoPlayer
            videoId={workbookVideo.id}
            initialProgress={userProgress?.progressPercent || 0}
          />
        </div>

        {/* Return to Workbook Button */}
        <div className="flex justify-center">
          <Link
            href={returnUrl}
            className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Return to Workbook (Page {returnPage})
          </Link>
        </div>

        {/* Practice Tips */}
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
