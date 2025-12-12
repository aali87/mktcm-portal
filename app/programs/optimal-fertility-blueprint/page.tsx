import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CheckoutButton } from "@/components/CheckoutButton";
import Link from "next/link";
import { CheckCircle2, BookOpen, Lock, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

export default async function OptimalFertilityBlueprintPage() {
  const session = await getServerSession(authOptions);

  // Get the product
  const product = await prisma.product.findUnique({
    where: { slug: "optimal-fertility-blueprint" },
  });

  if (!product) {
    redirect("/programs");
  }

  // Check if user has already purchased
  let hasPurchased = false;
  if (session?.user?.id) {
    const purchase = await prisma.purchase.findFirst({
      where: {
        userId: session.user.id,
        productId: product.id,
        status: "COMPLETED",
      },
    });
    hasPurchased = !!purchase;
  }

  // If already purchased, redirect to dashboard
  if (hasPurchased) {
    redirect("/dashboard/programs/optimal-fertility-blueprint");
  }

  const fullPrice = product.price / 100; // $149
  const planPrice = 59; // $59 per month

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-neutral-50">
      <Header user={session?.user} />

      <main>
        {/* Hero Section */}
        <div className="max-w-container mx-auto px-6 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
              9-Week Comprehensive Program
            </div>

            <h1 className="font-serif text-4xl md:text-6xl text-neutral-800 leading-tight">
              9 Weeks to Reproductive Health
            </h1>

            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              A comprehensive Traditional Chinese Medicine program with weekly workbooks,
              acupressure demonstrations, meditations, and supplement protocols.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              {session?.user ? (
                <Link href="#pricing">
                  <Button size="lg" className="text-lg px-8">
                    Get Started Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/auth/signup">
                    <Button size="lg" className="text-lg px-8">
                      Get Started Now
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/auth/login">
                    <Button size="lg" variant="outline" className="text-lg px-8">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* What's Included */}
        <div className="bg-white py-16">
          <div className="max-w-container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-serif text-3xl md:text-4xl text-neutral-800 text-center mb-12">
                What's Included
              </h2>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-serif text-xl text-neutral-800 mb-2">
                      9 Weekly Workbooks
                    </h3>
                    <p className="text-neutral-600">
                      Comprehensive guides for each organ system with practical exercises,
                      acupressure points, and self-care practices.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-serif text-xl text-neutral-800 mb-2">
                      Acupressure Demonstrations
                    </h3>
                    <p className="text-neutral-600">
                      Step-by-step guidance for fertility-supporting acupressure points you
                      can practice at home.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-serif text-xl text-neutral-800 mb-2">
                      Guided Meditations
                    </h3>
                    <p className="text-neutral-600">
                      Fertility-focused meditations to reduce stress and create an optimal
                      environment for conception.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-serif text-xl text-neutral-800 mb-2">
                      Supplement Protocols
                    </h3>
                    <p className="text-neutral-600">
                      Evidence-based supplement recommendations tailored to each phase of your
                      fertility journey.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bonus Callout */}
              <div className="mt-12 bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20 rounded-lg p-8">
                <div className="flex items-start gap-4">
                  <Sparkles className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-serif text-2xl text-neutral-800 mb-3">
                      Bonus: Complete Fertility Toolkit
                    </h3>
                    <p className="text-neutral-700 mb-4">
                      Get instant access to the comprehensive bonus workbook when you pay in
                      full. Includes advanced techniques, meal plans, cycle tracking guides, and
                      your complete supplement reference.
                    </p>
                    <p className="text-sm text-neutral-600 italic">
                      Payment plan members receive the bonus workbook after completing all 3 payments.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Curriculum */}
        <div className="py-16">
          <div className="max-w-container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-serif text-3xl md:text-4xl text-neutral-800 text-center mb-4">
                9-Week Curriculum
              </h2>
              <p className="text-neutral-600 text-center mb-12 max-w-2xl mx-auto">
                Each week focuses on a different organ system and energy channel in Traditional
                Chinese Medicine, building on the previous week's foundation.
              </p>

              <div className="space-y-4">
                {[
                  {
                    week: 1,
                    title: "Lungs - Strengthen Qi & Immune function",
                    description:
                      "Learn how the lungs govern your Qi and defensive energy. Includes breathing exercises and immune-boosting practices.",
                  },
                  {
                    week: 2,
                    title: "Qi - Replenishing Vital Energy & Enhancing Resilience",
                    description:
                      "Discover how to build and circulate Qi for optimal reproductive health through Qigong movements.",
                  },
                  {
                    week: 3,
                    title: "Spleen Qi - Nourishing your foundation",
                    description:
                      "Support your spleen to transform food into rich, nourishing blood through dietary therapy.",
                  },
                  {
                    week: 4,
                    title: "Blood: Nourishing and Moving",
                    description:
                      "Blood nourishes your reproductive organs. Blood-building nutrition and circulation practices.",
                  },
                  {
                    week: 5,
                    title: "Liver - Restore Flow & Balance",
                    description:
                      "Ensure smooth flow of Qi and blood with emotional release techniques and stress management.",
                  },
                  {
                    week: 6,
                    title: "Shen - Harmonizing the Mind, Spirit, and Emotions",
                    description:
                      "The heart houses your spirit (Shen). Heart-opening practices and meditation for emotional well-being.",
                  },
                  {
                    week: 7,
                    title: "Kidneys - Restore & Replenish",
                    description:
                      "The kidneys store your reproductive essence (Jing). Learn to preserve and build this vital resource.",
                  },
                  {
                    week: 8,
                    title: "Heart - Joy & Circulation",
                    description:
                      "Yin is the cooling, nourishing aspect of your being. Restorative practices and self-nourishment.",
                  },
                  {
                    week: 9,
                    title: "Yang - Activate Warmth & Movement",
                    description:
                      "Yang is the warming, activating energy. Learn to balance yin and yang for optimal fertility.",
                  },
                ].map((item) => (
                  <div
                    key={item.week}
                    className="bg-white border border-neutral-200 rounded-lg p-6 hover:border-primary transition-colors"
                  >
                    <div className="flex gap-6">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="font-serif text-primary font-semibold">
                            {item.week}
                          </span>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-serif text-xl text-neutral-800 mb-2">
                          {item.title}
                        </h3>
                        <p className="text-neutral-600">{item.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div id="pricing" className="bg-white py-16">
          <div className="max-w-container mx-auto px-6">
            <div className="max-w-5xl mx-auto">
              <h2 className="font-serif text-3xl md:text-4xl text-neutral-800 text-center mb-4">
                Choose Your Payment Option
              </h2>
              <p className="text-neutral-600 text-center mb-12 max-w-2xl mx-auto">
                Start your journey to optimal fertility today. Both options include all 9 weekly
                workbooks and comprehensive program materials.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Full Payment */}
                <div className="relative bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary rounded-lg p-8">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-white text-sm font-medium rounded-full">
                    Best Value
                  </div>

                  <div className="text-center mb-6">
                    <h3 className="font-serif text-2xl text-neutral-800 mb-2">
                      Pay in Full
                    </h3>
                    <div className="flex items-baseline justify-center gap-2 mb-2">
                      <span className="text-5xl font-bold text-neutral-800">${fullPrice}</span>
                    </div>
                    <p className="text-neutral-600">One-time payment</p>
                  </div>

                  <div className="space-y-3 mb-8">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-neutral-700">All 9 weekly workbooks</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-neutral-700">Complete program materials</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-neutral-700 font-medium">
                        Instant access to Bonus Workbook
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-neutral-700">Lifetime access</span>
                    </div>
                  </div>

                  {session?.user ? (
                    <CheckoutButton
                      productId={product.id}
                      priceType="one-time"
                      size="lg"
                      className="w-full"
                    >
                      Enroll Now - ${fullPrice}
                    </CheckoutButton>
                  ) : (
                    <Link href="/auth/signup">
                      <Button size="lg" className="w-full">
                        Get Started
                      </Button>
                    </Link>
                  )}
                </div>

                {/* Payment Plan */}
                <div className="bg-white border-2 border-neutral-200 rounded-lg p-8">
                  <div className="text-center mb-6">
                    <h3 className="font-serif text-2xl text-neutral-800 mb-2">
                      Payment Plan
                    </h3>
                    <div className="flex items-baseline justify-center gap-2 mb-2">
                      <span className="text-5xl font-bold text-neutral-800">${planPrice}</span>
                      <span className="text-neutral-600">/month</span>
                    </div>
                    <p className="text-neutral-600">3 monthly payments</p>
                    <p className="text-sm text-neutral-500 mt-1">${planPrice * 3} total</p>
                  </div>

                  <div className="space-y-3 mb-8">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-neutral-700">All 9 weekly workbooks</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-neutral-700">Complete program materials</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Lock className="h-5 w-5 text-neutral-400 flex-shrink-0 mt-0.5" />
                      <span className="text-neutral-600">
                        Bonus Workbook unlocks after final payment
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-neutral-700">Lifetime access</span>
                    </div>
                  </div>

                  {session?.user ? (
                    <CheckoutButton
                      productId={product.id}
                      priceType="payment-plan"
                      size="lg"
                      variant="outline"
                      className="w-full"
                    >
                      Start with ${planPrice}/month
                    </CheckoutButton>
                  ) : (
                    <Link href="/auth/signup">
                      <Button size="lg" variant="outline" className="w-full">
                        Get Started
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
