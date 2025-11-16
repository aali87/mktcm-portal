import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CheckoutButton } from "@/components/CheckoutButton";
import Link from "next/link";
import { CheckCircle2, Heart, Sparkles, ArrowRight, Play, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

export default async function FearlesslyFertileYogaPage() {
  const session = await getServerSession(authOptions);

  // Get the product
  const product = await prisma.product.findUnique({
    where: { slug: "fearlessly-fertile-yoga" },
    include: {
      videos: {
        orderBy: { order: "asc" },
      },
    },
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
    redirect("/dashboard/programs/fearlessly-fertile-yoga");
  }

  const price = product.price / 100; // $15
  const totalMinutes = product.videos.reduce((sum, v) => sum + (v.duration || 0), 0) / 60;
  const totalHours = Math.floor(totalMinutes / 60);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-neutral-50">
      <Header user={session?.user} />

      <main>
        {/* Hero Section */}
        <div className="max-w-container mx-auto px-6 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              10 TCM-Inspired Yoga Sessions
            </div>

            <h1 className="font-serif text-4xl md:text-6xl text-neutral-800 leading-tight">
              Fearlessly Fertile Yoga
            </h1>

            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Ancient Traditional Chinese Medicine wisdom meets modern yoga practice.
              Enhance fertility, hormonal balance, and vitality through breathwork,
              acupressure, and mindful movement.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              {session?.user ? (
                <CheckoutButton
                  productId={product.id}
                  priceType="one-time"
                  size="lg"
                  className="text-lg px-8"
                >
                  Start Your Practice - ${price}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </CheckoutButton>
              ) : (
                <>
                  <Link href="/auth/signup">
                    <Button size="lg" className="text-lg px-8">
                      Start Your Practice - ${price}
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

            <p className="text-sm text-neutral-500">
              Over {totalHours}+ hours of expert-led practice for just ${price} • Lifetime access
            </p>
          </div>
        </div>

        {/* What's Included */}
        <div className="bg-white py-16">
          <div className="max-w-container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-serif text-3xl md:text-4xl text-neutral-800 text-center mb-12">
                What's Included
              </h2>

              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Play className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-serif text-xl text-neutral-800 mb-2">
                      10 Full-Length Sessions
                    </h3>
                    <p className="text-neutral-600">
                      33-49 minutes per class, thoughtfully designed to support your
                      fertility journey through TCM-inspired movement and breathwork.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Heart className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-serif text-xl text-neutral-800 mb-2">
                      TCM Wisdom
                    </h3>
                    <p className="text-neutral-600">
                      Learn ancient principles of Yin-Yang balance, Qi flow, blood
                      circulation, and emotional harmony integrated into your practice.
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
                      Breathwork & Acupressure
                    </h3>
                    <p className="text-neutral-600">
                      Powerful techniques including Kapalabhati (Breath of Fire),
                      alternating nostril breathing, and meridian activation.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-serif text-xl text-neutral-800 mb-2">
                      Weekly Mantras
                    </h3>
                    <p className="text-neutral-600">
                      Each session includes a mindfulness mantra to deepen your practice
                      and connect with your inner wisdom.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Who This Is For */}
        <div className="py-16">
          <div className="max-w-container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-serif text-3xl md:text-4xl text-neutral-800 text-center mb-4">
                Who This Is For
              </h2>
              <p className="text-neutral-600 text-center mb-12 max-w-2xl mx-auto">
                This program is designed for women at any stage of their fertility journey
              </p>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white border border-neutral-200 rounded-lg p-6">
                  <h3 className="font-serif text-lg text-neutral-800 mb-3">
                    Trying to Conceive
                  </h3>
                  <p className="text-neutral-600 text-sm">
                    Support your body's natural fertility through movement, breathwork,
                    and TCM principles that enhance reproductive wellness.
                  </p>
                </div>

                <div className="bg-white border border-neutral-200 rounded-lg p-6">
                  <h3 className="font-serif text-lg text-neutral-800 mb-3">
                    Hormonal Balance
                  </h3>
                  <p className="text-neutral-600 text-sm">
                    Regulate your cycle, reduce PMS, and support endocrine health through
                    practices that harmonize Yin and Yang.
                  </p>
                </div>

                <div className="bg-white border border-neutral-200 rounded-lg p-6">
                  <h3 className="font-serif text-lg text-neutral-800 mb-3">
                    Mind-Body Connection
                  </h3>
                  <p className="text-neutral-600 text-sm">
                    Reduce stress, release emotional blocks, and cultivate a deeper
                    connection with your body's innate wisdom.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Session Preview */}
        <div className="bg-white py-16">
          <div className="max-w-container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-serif text-3xl md:text-4xl text-neutral-800 text-center mb-4">
                Your 10-Session Journey
              </h2>
              <p className="text-neutral-600 text-center mb-12 max-w-2xl mx-auto">
                Progress through foundation, activation, and integration phases
              </p>

              <div className="space-y-4">
                {product.videos.map((video, index) => {
                  const minutes = Math.round((video.duration || 0) / 60);

                  return (
                    <div
                      key={video.id}
                      className="bg-neutral-50 border border-neutral-200 rounded-lg p-6 hover:border-primary transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="font-serif text-primary font-semibold">
                              {index + 1}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <h3 className="font-serif text-lg text-neutral-800">
                              {video.title}
                            </h3>
                            <div className="flex items-center gap-1 text-sm text-neutral-500 flex-shrink-0">
                              <Clock className="h-4 w-4" />
                              {minutes} min
                            </div>
                          </div>
                          <p className="text-neutral-600 text-sm leading-relaxed">
                            {video.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="py-16">
          <div className="max-w-container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-serif text-3xl md:text-4xl text-neutral-800 text-center mb-12">
                Transform Your Fertility Journey
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                {[
                  "Support hormonal balance naturally",
                  "Enhance reproductive vitality",
                  "Cultivate Yin-Yang harmony",
                  "Improve blood and Qi circulation",
                  "Reduce stress and emotional blockages",
                  "Connect with your body's wisdom",
                  "Learn TCM fertility principles",
                  "Practice weekly mantras for mindfulness",
                ].map((benefit) => (
                  <div key={benefit} className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-neutral-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="bg-gradient-to-br from-primary/5 to-primary/10 py-16">
          <div className="max-w-container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h2 className="font-serif text-3xl md:text-4xl text-neutral-800">
                Begin Your Practice Today
              </h2>
              <p className="text-xl text-neutral-600">
                Join women worldwide embracing fertility through TCM yoga
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                {session?.user ? (
                  <CheckoutButton
                    productId={product.id}
                    priceType="one-time"
                    size="lg"
                    className="text-lg px-8"
                  >
                    Get Lifetime Access - ${price}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </CheckoutButton>
                ) : (
                  <Link href="/auth/signup">
                    <Button size="lg" className="text-lg px-8">
                      Get Lifetime Access - ${price}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                )}
              </div>
              <p className="text-sm text-neutral-600">
                One-time payment • Lifetime access • Practice at your own pace
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
