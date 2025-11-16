import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Download, ArrowLeft, FileText, CheckCircle2 } from "lucide-react";

export default async function FreePrintablesDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  // Get the product
  const product = await prisma.product.findUnique({
    where: { slug: "free-printables" },
    include: {
      printables: {
        orderBy: { orderIndex: "asc" },
      },
    },
  });

  if (!product) {
    redirect("/dashboard");
  }

  // Check if user has access
  const purchase = await prisma.purchase.findFirst({
    where: {
      userId: session.user.id,
      productId: product.id,
      status: "COMPLETED",
    },
  });

  if (!purchase) {
    redirect("/programs/free-printables");
  }

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
            <CheckCircle2 className="h-6 w-6 text-primary" />
            <h1 className="font-serif text-3xl md:text-4xl text-neutral-800">
              Your Free TCM Food Therapy Guides
            </h1>
          </div>
          <p className="text-neutral-600 text-lg max-w-2xl">
            Download your 4 comprehensive TCM food therapy guides. Each guide provides
            specific dietary recommendations, food lists, and meal ideas based on TCM patterns.
          </p>
        </div>

        {/* Printables Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {product.printables.map((printable, index) => (
            <div
              key={printable.id}
              className="bg-white border border-neutral-200 rounded-lg p-6 hover:border-primary transition-colors"
            >
              {/* Icon and Badge */}
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-7 w-7 text-primary" />
                </div>
                <span className="text-xs text-primary font-medium bg-primary/10 px-3 py-1 rounded-full">
                  Guide {index + 1}
                </span>
              </div>

              {/* Title and Description */}
              <h3 className="font-serif text-xl text-neutral-800 mb-3">
                {printable.title}
              </h3>
              <p className="text-neutral-600 text-sm leading-relaxed mb-6">
                {printable.description}
              </p>

              {/* Download Button */}
              <form action={`/api/printables/${printable.id}/download`} method="POST">
                <Button type="submit" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              </form>
            </div>
          ))}
        </div>

        {/* Usage Tips */}
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 rounded-lg p-8">
          <h2 className="font-serif text-2xl text-neutral-800 mb-4">
            How to Use These Guides
          </h2>
          <div className="grid md:grid-cols-2 gap-6 text-neutral-700">
            <div>
              <h3 className="font-semibold mb-2">Print for Kitchen Reference</h3>
              <p className="text-sm">
                Keep these guides in your kitchen for easy reference while meal planning
                and cooking. They're designed to be practical and easy to follow.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Identify Your Pattern</h3>
              <p className="text-sm">
                Work with a TCM practitioner to identify which pattern(s) apply to you,
                then focus on the corresponding food therapy recommendations.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Integrate Gradually</h3>
              <p className="text-sm">
                Start by incorporating a few recommended foods into your diet each week.
                Small, consistent changes are more sustainable than drastic overhauls.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Combine with Other Programs</h3>
              <p className="text-sm">
                These food therapy guides complement our other programs beautifully—pair
                with Fearlessly Fertile Yoga or Stress-free Goddess for holistic support.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
