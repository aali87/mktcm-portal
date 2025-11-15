import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import Link from "next/link";
import { CheckCircle2, Download, Play, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

export default async function StressFreeGoddessPage() {
  const session = await getServerSession(authOptions);

  // Get the product
  const product = await prisma.product.findUnique({
    where: { slug: "stress-free-goddess" },
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
    redirect("/dashboard/programs/stress-free-goddess");
  }

  const price = product.price / 100; // $29

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-neutral-50">
      <Header user={session?.user} />

      <main>
        {/* Hero Section */}
        <div className="max-w-container mx-auto px-6 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="font-serif text-5xl md:text-6xl text-neutral-800 leading-tight">
              Become a Stress-free Goddess
            </h1>

            <p className="text-2xl text-neutral-600 max-w-2xl mx-auto">
              12 Weeks of TCM Practices for Deep Calm & Vitality
            </p>

            <p className="text-lg text-neutral-600 max-w-3xl mx-auto">
              Learn ancient Qigong, Reflexology & Guasha techniques to reduce stress,
              improve sleep, boost digestion, and reclaim your vibrant energy.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              {session?.user ? (
                <form action="/api/checkout" method="POST">
                  <input type="hidden" name="productId" value={product.id} />
                  <input type="hidden" name="priceType" value="full" />
                  <Button type="submit" size="lg" className="text-lg px-8">
                    Get Lifetime Access - ${price}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </form>
              ) : (
                <>
                  <Link href="/auth/signup">
                    <Button size="lg" className="text-lg px-8">
                      Get Started - ${price}
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

        {/* Free Download Section */}
        <div className="bg-gradient-to-br from-primary/5 to-primary/10 py-12">
          <div className="max-w-container mx-auto px-6">
            <div className="max-w-3xl mx-auto bg-white rounded-lg border-2 border-primary/20 p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Download className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h2 className="font-serif text-2xl text-neutral-800 mb-3">
                Download Your Free Program Guide
              </h2>
              <p className="text-neutral-600 mb-6">
                Get a sneak peek of all 12 weeks with our comprehensive program guide.
                No purchase required!
              </p>
              <a href="/api/pdfs/stress-free-goddess/guide" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline">
                  <Download className="mr-2 h-5 w-5" />
                  Download Free Guide (PDF)
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* Who This Is For */}
        <div className="py-16">
          <div className="max-w-container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-serif text-3xl md:text-4xl text-neutral-800 text-center mb-4">
                Is This For You?
              </h2>
              <p className="text-neutral-600 text-center mb-12 max-w-2xl mx-auto">
                This program is perfect if you're experiencing...
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                {[
                  "Chronic stress and overwhelm",
                  "Difficulty sleeping or insomnia",
                  "Anxiety and racing thoughts",
                  "Low energy and fatigue",
                  "Digestive issues (bloating, gas)",
                  "Tension headaches",
                  "Mood swings and irritability",
                  "Desire to learn holistic self-care",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                    <span className="text-neutral-700 text-lg">{item}</span>
                  </div>
                ))}
              </div>
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

              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Play className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-serif text-xl text-neutral-800 mb-2">
                    12 Weekly Videos
                  </h3>
                  <p className="text-neutral-600">
                    Follow-along practice videos teaching Qigong, Reflexology & Guasha
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-serif text-xl text-neutral-800 mb-2">
                    3 TCM Modalities
                  </h3>
                  <p className="text-neutral-600">
                    Master three powerful Traditional Chinese Medicine techniques
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Download className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-serif text-xl text-neutral-800 mb-2">
                    Program Guide
                  </h3>
                  <p className="text-neutral-600">
                    Downloadable PDF with weekly practices and reference materials
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="py-16">
          <div className="max-w-container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-serif text-3xl md:text-4xl text-neutral-800 text-center mb-12">
                Transform Your Stress in 12 Weeks
              </h2>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white border border-neutral-200 rounded-lg p-6">
                  <h3 className="font-serif text-xl text-neutral-800 mb-3">
                    Reduce Stress & Anxiety
                  </h3>
                  <p className="text-neutral-600">
                    Learn powerful breathwork and reflexology techniques that calm your
                    nervous system and promote deep relaxation.
                  </p>
                </div>

                <div className="bg-white border border-neutral-200 rounded-lg p-6">
                  <h3 className="font-serif text-xl text-neutral-800 mb-3">
                    Improve Sleep Quality
                  </h3>
                  <p className="text-neutral-600">
                    Clear trapped heat and calm your mind with Guasha and reflexology
                    practices designed for better sleep.
                  </p>
                </div>

                <div className="bg-white border border-neutral-200 rounded-lg p-6">
                  <h3 className="font-serif text-xl text-neutral-800 mb-3">
                    Boost Digestive Health
                  </h3>
                  <p className="text-neutral-600">
                    Support your body's ability to metabolize nutrients and address
                    bloating with targeted TCM techniques.
                  </p>
                </div>

                <div className="bg-white border border-neutral-200 rounded-lg p-6">
                  <h3 className="font-serif text-xl text-neutral-800 mb-3">
                    Increase Energy & Vitality
                  </h3>
                  <p className="text-neutral-600">
                    Stimulate your body's natural Qi production systems to reclaim your
                    vibrant, goddess energy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Curriculum Preview */}
        <div className="bg-white py-16">
          <div className="max-w-container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-serif text-3xl md:text-4xl text-neutral-800 text-center mb-4">
                12-Week Curriculum
              </h2>
              <p className="text-neutral-600 text-center mb-12 max-w-2xl mx-auto">
                Each week builds on the previous, creating a comprehensive foundation in
                TCM stress-relief practices.
              </p>

              <div className="space-y-3">
                {product.videos.map((video, index) => {
                  const weekNumber = index + 1;
                  const minutesDisplay = video.duration
                    ? Math.round(video.duration / 60)
                    : 0;

                  return (
                    <div
                      key={video.id}
                      className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 flex items-start gap-4"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="font-serif text-primary font-semibold text-sm">
                            {weekNumber}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-serif text-lg text-neutral-800 mb-1">
                          {video.title}
                        </h3>
                        <p className="text-sm text-neutral-600">{video.description}</p>
                      </div>
                      <div className="flex-shrink-0 text-sm text-neutral-500">
                        {minutesDisplay} min
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-br from-primary/5 to-primary/10 py-16">
          <div className="max-w-container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h2 className="font-serif text-3xl md:text-4xl text-neutral-800">
                Ready to Become a Stress-free Goddess?
              </h2>
              <p className="text-lg text-neutral-600">
                Get lifetime access to all 12 weeks for just ${price}
              </p>

              <div className="flex flex-col items-center gap-4 pt-4">
                {session?.user ? (
                  <form action="/api/checkout" method="POST">
                    <input type="hidden" name="productId" value={product.id} />
                    <input type="hidden" name="priceType" value="full" />
                    <Button type="submit" size="lg" className="text-lg px-12">
                      Get Lifetime Access - ${price}
                    </Button>
                  </form>
                ) : (
                  <Link href="/auth/signup">
                    <Button size="lg" className="text-lg px-12">
                      Get Started - ${price}
                    </Button>
                  </Link>
                )}

                <p className="text-sm text-neutral-600">
                  One-time payment • Lifetime access • 12 weeks of practices
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
