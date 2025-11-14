import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Clock, CheckCircle } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function FreeWorkshopPage() {
  const session = await getServerSession(authOptions);

  // Fetch the Free Workshop product
  const product = await prisma.product.findUnique({
    where: { slug: 'free-workshop' },
    include: {
      videos: {
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!product) {
    return (
      <div className="max-w-container mx-auto px-6 py-12">
        <p>Workshop not found.</p>
      </div>
    );
  }

  // Check if user has access
  let hasAccess = false;
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (user) {
      const purchase = await prisma.purchase.findFirst({
        where: {
          userId: user.id,
          productId: product.id,
          status: 'COMPLETED',
        },
      });

      hasAccess = !!purchase;

      // If user has access, redirect to dashboard
      if (hasAccess) {
        redirect('/dashboard/programs/free-workshop');
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl md:text-5xl text-neutral-800 mb-4">
            {product.name}
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            {product.description}
          </p>
        </div>

        {/* What's Included */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="font-serif text-2xl">What's Inside This Free Workshop</CardTitle>
            <CardDescription>
              Three comprehensive video modules to support your fertility journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {product.videos.map((video, index) => (
                <div key={video.id} className="flex items-start gap-4 p-4 rounded-lg bg-neutral-50">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white font-semibold flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-neutral-800 mb-1">{video.title}</h3>
                    <p className="text-sm text-neutral-600 mb-2">{video.description}</p>
                    <div className="flex items-center gap-2 text-sm text-neutral-500">
                      <Clock className="h-4 w-4" />
                      <span>{video.duration ? Math.round(video.duration / 60) : 0} minutes</span>
                    </div>
                  </div>
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Benefits Section */}
        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="font-serif text-2xl">Why Take This Workshop?</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-neutral-700">
                  Learn evidence-based techniques from Traditional Chinese Medicine to support fertility
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-neutral-700">
                  Understand how stress, nutrition, and lifestyle impact your fertility journey
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-neutral-700">
                  Get practical, actionable steps you can implement today
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-neutral-700">
                  Access the workshop anytime, anywhere - it's yours to keep forever
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center">
          {!session?.user ? (
            <div className="space-y-4">
              <p className="text-neutral-600 mb-4">
                Create a free account to get instant access to the workshop
              </p>
              <Link href="/auth/signup?redirect=/programs/free-workshop">
                <Button size="lg" className="gap-2">
                  <Play className="h-5 w-5" />
                  Get Free Access
                </Button>
              </Link>
              <p className="text-sm text-neutral-500">
                Already have an account?{' '}
                <Link href="/auth/login?redirect=/programs/free-workshop" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-neutral-600 mb-4">
                You're logged in! Click below to claim your free access
              </p>
              <form action="/api/products/free-workshop/claim" method="POST">
                <Button type="submit" size="lg" className="gap-2">
                  <Play className="h-5 w-5" />
                  Start Workshop Now
                </Button>
              </form>
            </div>
          )}
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 pt-8 border-t border-neutral-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">100%</div>
              <div className="text-sm text-neutral-600">Free Forever</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">3</div>
              <div className="text-sm text-neutral-600">Expert-Led Videos</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">∞</div>
              <div className="text-sm text-neutral-600">Lifetime Access</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
