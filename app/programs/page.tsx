import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

export default async function ProgramsPage() {
  const session = await getServerSession(authOptions);

  // Fetch all products
  const products = await prisma.product.findMany({
    orderBy: { order: "asc" },
    include: {
      videos: {
        select: { id: true },
      },
      workbooks: {
        select: { id: true },
      },
    },
  });

  // If user is logged in, fetch their purchases
  const userPurchases = session?.user
    ? await prisma.purchase.findMany({
        where: {
          userId: session.user.id,
          status: "COMPLETED",
        },
        select: {
          productId: true,
        },
      })
    : [];

  const purchasedProductIds = new Set(userPurchases.map((p: typeof userPurchases[number]) => p.productId));

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-neutral-50">
      <Header user={session?.user} />

      <main className="max-w-container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="font-serif text-4xl md:text-5xl text-neutral-800 mb-4">
            Your Fertility Journey Starts Here
          </h1>
          <p className="text-body-lg text-neutral-600">
            Choose from our carefully crafted programs designed to support optimal fertility
            through Traditional Chinese Medicine, mindfulness, and holistic wellness.
          </p>
        </div>

        {/* Featured Programs */}
        <div className="mb-16">
          <h2 className="font-serif text-2xl text-neutral-800 mb-6">Featured Programs</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {products
              .filter((p: typeof products[number]) => p.featured)
              .map((product: typeof products[number]) => {
                const isPurchased = purchasedProductIds.has(product.id);
                const isFree = product.price === 0;

                return (
                  <Card
                    key={product.id}
                    className="hover:border-primary transition-all hover:shadow-lg flex flex-col"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <CardTitle className="font-serif text-xl">
                          {product.name}
                        </CardTitle>
                        {isPurchased && (
                          <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                            Purchased
                          </span>
                        )}
                      </div>
                      <CardDescription>{product.description}</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4 flex-1 flex flex-col">
                      {/* What's included */}
                      <div className="space-y-2">
                        {product.videos.length > 0 && (
                          <div className="flex items-center gap-2 text-sm text-neutral-600">
                            <Check className="h-4 w-4 text-primary" />
                            <span>{product.videos.length} video lessons</span>
                          </div>
                        )}
                        {product.workbooks.length > 0 && (
                          <div className="flex items-center gap-2 text-sm text-neutral-600">
                            <Check className="h-4 w-4 text-primary" />
                            <span>{product.workbooks.length} workbooks & resources</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-neutral-600">
                          <Check className="h-4 w-4 text-primary" />
                          <span>Lifetime access</span>
                        </div>
                      </div>

                      {/* Price - hide for purchased products, use flex-grow to push to bottom */}
                      <div className="flex-1" />
                      {!isPurchased && (
                        <div className="pt-4 border-t border-neutral-100">
                          {isFree ? (
                            <span className="text-2xl font-serif text-neutral-800">Free</span>
                          ) : (
                            <div>
                              <span className="text-3xl font-serif text-neutral-800">
                                {formatCurrency(product.price / 100)}
                              </span>
                              {product.paymentPlanPriceId && (
                                <p className="text-sm text-neutral-600 mt-1">
                                  Payment plans available
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>

                    <CardFooter>
                      {isPurchased ? (
                        <Link href={`/dashboard/programs/${product.slug}`} className="w-full">
                          <Button className="w-full gap-2">
                            Go to Program
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      ) : (
                        <Link href={`/programs/${product.slug}`} className="w-full">
                          <Button className="w-full gap-2">
                            {isFree ? "Get Free Access" : "Learn More"}
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
          </div>
        </div>

        {/* All Programs */}
        <div>
          <h2 className="font-serif text-2xl text-neutral-800 mb-6">All Programs</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {products
              .filter((p: typeof products[number]) => !p.featured)
              .map((product: typeof products[number]) => {
                const isPurchased = purchasedProductIds.has(product.id);
                const isFree = product.price === 0;

                return (
                  <Card
                    key={product.id}
                    className="hover:border-primary transition-all hover:shadow-md flex flex-col"
                  >
                    <CardHeader>
                      <CardTitle className="font-serif text-lg">
                        {product.name}
                      </CardTitle>
                      {isPurchased && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium w-fit">
                          Purchased
                        </span>
                      )}
                    </CardHeader>

                    <CardContent className="space-y-4 flex-1 flex flex-col">
                      <p className="text-sm text-neutral-600 line-clamp-3">
                        {product.description}
                      </p>

                      {/* Spacer to push content to bottom */}
                      <div className="flex-1" />

                      {/* Price - hide for purchased products */}
                      {!isPurchased && (
                        <div className="pt-2">
                          {isFree ? (
                            <span className="text-xl font-serif text-neutral-800">Free</span>
                          ) : (
                            <span className="text-2xl font-serif text-neutral-800">
                              {formatCurrency(product.price / 100)}
                            </span>
                          )}
                        </div>
                      )}
                    </CardContent>

                    <CardFooter>
                      <Link
                        href={isPurchased ? `/dashboard/programs/${product.slug}` : `/programs/${product.slug}`}
                        className="w-full"
                      >
                        <Button
                          variant={isPurchased ? "default" : "outline"}
                          className="w-full"
                        >
                          {isPurchased
                            ? "Go to Program"
                            : isFree
                            ? "Get Free Access"
                            : "View Details"}
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                );
              })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center bg-primary/5 rounded-lg p-12">
          <h2 className="font-serif text-3xl text-neutral-800 mb-4">
            Not sure where to start?
          </h2>
          <p className="text-body-lg text-neutral-600 mb-6 max-w-2xl mx-auto">
            Begin with our free workshop to discover the foundations of fertility
            optimization through Traditional Chinese Medicine.
          </p>
          <Link href="/programs/free-workshop">
            <Button size="lg" className="gap-2">
              Start Free Workshop
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
