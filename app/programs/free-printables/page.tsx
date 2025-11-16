import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import Link from "next/link";
import { CheckCircle2, Download, FileText, Sparkles, ArrowRight, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

export default async function FreePrintablesPage() {
  const session = await getServerSession(authOptions);

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
    redirect("/programs");
  }

  // Check if user has already claimed access
  let hasAccess = false;
  if (session?.user?.id) {
    const purchase = await prisma.purchase.findFirst({
      where: {
        userId: session.user.id,
        productId: product.id,
        status: "COMPLETED",
      },
    });
    hasAccess = !!purchase;
  }

  // If already has access, redirect to dashboard
  if (hasAccess) {
    redirect("/dashboard/programs/free-printables");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-neutral-50">
      <Header user={session?.user} />

      <main>
        {/* Hero Section */}
        <div className="max-w-container mx-auto px-6 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
              <Gift className="h-4 w-4" />
              100% Free • Instant Download
            </div>

            <h1 className="font-serif text-4xl md:text-6xl text-neutral-800 leading-tight">
              Free TCM Food Therapy Printables 🌿
            </h1>

            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              4 Downloadable Guides to Nourish Your Fertility Journey with Traditional Chinese Medicine Nutrition
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              {session?.user ? (
                <form action="/api/products/free-printables/claim" method="POST">
                  <Button size="lg" type="submit" className="text-lg px-8">
                    <Download className="mr-2 h-5 w-5" />
                    Claim Your Free Printables
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </form>
              ) : (
                <>
                  <Link href="/auth/signup?redirect=/programs/free-printables">
                    <Button size="lg" className="text-lg px-8">
                      <Download className="mr-2 h-5 w-5" />
                      Get Free Access - Sign Up
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/auth/login?redirect=/programs/free-printables">
                    <Button size="lg" variant="outline" className="text-lg px-8">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>

            <p className="text-sm text-neutral-500">
              No credit card required • Created by FABORM-certified TCM practitioner
            </p>
          </div>
        </div>

        {/* What's Included */}
        <div className="bg-white py-16">
          <div className="max-w-container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-serif text-3xl md:text-4xl text-neutral-800 text-center mb-4">
                4 Comprehensive Food Therapy Guides
              </h2>
              <p className="text-neutral-600 text-center mb-12 max-w-2xl mx-auto">
                Each guide provides specific dietary recommendations, food lists, and meal ideas
                based on TCM patterns—tailored to support your fertility and wellness journey.
              </p>

              <div className="space-y-6">
                {product.printables.map((printable, index) => (
                  <div
                    key={printable.id}
                    className="bg-gradient-to-r from-primary/5 to-white border border-neutral-200 rounded-lg p-6 hover:border-primary transition-colors"
                  >
                    <div className="flex items-start gap-6">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileText className="h-8 w-8 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h3 className="font-serif text-xl text-neutral-800">
                            {printable.title}
                          </h3>
                          <span className="text-xs text-primary font-medium bg-primary/10 px-3 py-1 rounded-full flex-shrink-0">
                            Guide {index + 1}
                          </span>
                        </div>
                        <p className="text-neutral-600 leading-relaxed">
                          {printable.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="py-16">
          <div className="max-w-container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-serif text-3xl md:text-4xl text-neutral-800 text-center mb-12">
                Why TCM Food Therapy?
              </h2>

              <div className="grid md:grid-cols-2 gap-6 mb-12">
                {[
                  "Learn TCM dietary principles for fertility",
                  "Get specific food lists for your pattern",
                  "Understand foods to favor and avoid",
                  "Support fertility naturally through nutrition",
                  "Printable PDFs for kitchen reference",
                  "Created by certified TCM practitioner",
                  "Perfect for all fertility journey stages",
                  "Free instant download—no payment needed",
                ].map((benefit) => (
                  <div key={benefit} className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-neutral-700">{benefit}</span>
                  </div>
                ))}
              </div>

              {/* Educational Note */}
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 rounded-lg p-8">
                <div className="flex items-start gap-4">
                  <Sparkles className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-serif text-2xl text-neutral-800 mb-3">
                      Expert-Created Nutrition Guidance
                    </h3>
                    <p className="text-neutral-700 leading-relaxed mb-4">
                      These guides are created by a FABORM-certified Traditional Chinese Medicine
                      practitioner with years of experience supporting fertility through nutrition.
                      Each pattern—Dampness, Depleted Blood, Depleted Yang, and Depleted Yin—is
                      carefully explained with practical food recommendations you can implement today.
                    </p>
                    <p className="text-neutral-600 text-sm">
                      Print these guides and keep them in your kitchen for easy reference while
                      cooking and meal planning!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Who This Is For */}
        <div className="bg-white py-16">
          <div className="max-w-container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-serif text-3xl md:text-4xl text-neutral-800 text-center mb-12">
                Perfect For You If...
              </h2>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6">
                  <h3 className="font-serif text-lg text-neutral-800 mb-3">
                    On a Fertility Journey
                  </h3>
                  <p className="text-neutral-600 text-sm">
                    Support your conception efforts with TCM nutrition that nourishes your
                    reproductive health naturally.
                  </p>
                </div>

                <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6">
                  <h3 className="font-serif text-lg text-neutral-800 mb-3">
                    Curious About TCM
                  </h3>
                  <p className="text-neutral-600 text-sm">
                    Learn how Traditional Chinese Medicine views nutrition and how specific
                    foods can balance your body's patterns.
                  </p>
                </div>

                <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6">
                  <h3 className="font-serif text-lg text-neutral-800 mb-3">
                    Seeking Natural Healing
                  </h3>
                  <p className="text-neutral-600 text-sm">
                    Use food as medicine to address hormonal imbalance, energy depletion,
                    and other wellness concerns.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="bg-gradient-to-br from-primary/5 to-primary/10 py-16">
          <div className="max-w-container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h2 className="font-serif text-3xl md:text-4xl text-neutral-800">
                Ready to Nourish Your Fertility?
              </h2>
              <p className="text-xl text-neutral-600">
                Get instant access to all 4 TCM Food Therapy guides—completely free
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                {session?.user ? (
                  <form action="/api/products/free-printables/claim" method="POST">
                    <Button size="lg" type="submit" className="text-lg px-8">
                      <Download className="mr-2 h-5 w-5" />
                      Download Your Free Guides
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </form>
                ) : (
                  <Link href="/auth/signup?redirect=/programs/free-printables">
                    <Button size="lg" className="text-lg px-8">
                      <Download className="mr-2 h-5 w-5" />
                      Get Instant Access
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                )}
              </div>
              <p className="text-sm text-neutral-600">
                Join thousands using TCM nutrition for fertility • No credit card required
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
