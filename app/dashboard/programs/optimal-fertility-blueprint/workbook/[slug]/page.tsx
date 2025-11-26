import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { WorkbookViewer } from "@/components/WorkbookViewer";
import { DynamicPdfViewer } from "@/components/DynamicPdfViewer";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: {
    slug: string;
  };
}

export default async function WorkbookPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  // Get workbook by slug
  const workbook = await prisma.workbook.findUnique({
    where: { slug: params.slug },
    include: {
      product: true,
    },
  });

  if (!workbook) {
    redirect("/dashboard/programs/optimal-fertility-blueprint");
  }

  // Verify user has purchased the product
  const purchase = await prisma.purchase.findFirst({
    where: {
      userId: session.user.id,
      productId: workbook.productId,
      status: "COMPLETED",
    },
  });

  if (!purchase) {
    redirect("/programs/optimal-fertility-blueprint");
  }

  // Check bonus workbook eligibility
  if (workbook.bonusOnly) {
    const isEligible =
      purchase.paymentType === "FULL" ||
      (purchase.paymentType === "PLAN" && purchase.planComplete);

    if (!isEligible) {
      redirect("/dashboard/programs/optimal-fertility-blueprint");
    }
  }

  // Validate workbook content - must have either PDF or images
  const hasPdf = !!workbook.fileUrl;
  const hasImages = !!workbook.s3FolderPath && !!workbook.totalPages;

  if (!hasPdf && !hasImages) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="text-center space-y-4">
            <h1 className="font-serif text-3xl text-neutral-800">
              Workbook Not Available
            </h1>
            <p className="text-neutral-600">
              This workbook content is not yet available. Please check back later.
            </p>
            <Link
              href="/dashboard/programs/optimal-fertility-blueprint"
              className="inline-flex items-center text-primary hover:underline"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Program
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Get user's progress for this workbook
  const progress = await prisma.workbookProgress.findUnique({
    where: {
      userId_workbookId: {
        userId: session.user.id,
        workbookId: workbook.id,
      },
    },
  });

  const initialPage = progress?.lastViewedPage || 1;

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/programs/optimal-fertility-blueprint"
            className="inline-flex items-center text-sm text-neutral-600 hover:text-primary mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Program
          </Link>

          <div className="space-y-2">
            <h1 className="font-serif text-3xl md:text-4xl text-neutral-800">
              {workbook.title}
            </h1>
            {workbook.description && (
              <p className="text-neutral-600">{workbook.description}</p>
            )}
            {workbook.bonusOnly && (
              <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                Bonus Workbook
              </div>
            )}
          </div>
        </div>

        {/* Workbook Viewer - PDF or Image based */}
        {hasPdf ? (
          <DynamicPdfViewer
            workbookId={workbook.id}
            initialPage={initialPage}
          />
        ) : (
          <WorkbookViewer
            workbookId={workbook.id}
            totalPages={workbook.totalPages!}
            initialPage={initialPage}
          />
        )}
      </div>
    </div>
  );
}
