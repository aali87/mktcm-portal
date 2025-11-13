import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { EnrollButton } from '@/components/EnrollButton';

interface ProgramPageProps {
  params: {
    slug: string;
  };
  searchParams: {
    canceled?: string;
  };
}

export default async function ProgramPage({ params, searchParams }: ProgramPageProps) {
  const session = await getServerSession(authOptions);

  // Get the product
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      videos: {
        orderBy: { order: 'asc' },
      },
      workbooks: {
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!product) {
    notFound();
  }

  // Check if user already owns this product
  let userOwnsProduct = false;
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        purchases: {
          where: {
            productId: product.id,
            status: 'COMPLETED',
          },
        },
      },
    });

    userOwnsProduct = (user?.purchases?.length || 0) > 0;
  }

  const isFree = product.price === 0;
  const hasPaymentPlan = !!product.paymentPlanPriceId;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-neutral-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Canceled message */}
        {searchParams.canceled === 'true' && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
            Payment was canceled. You can try again when you're ready.
          </div>
        )}

        {/* Product header */}
        <div className="mb-8">
          <h1 className="font-serif text-4xl md:text-5xl text-neutral-900 mb-4">
            {product.name}
          </h1>
          <p className="text-lg text-neutral-600 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price and CTA */}
        <div className="bg-white rounded-lg border border-neutral-200 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              {isFree ? (
                <span className="text-3xl font-semibold text-primary">Free</span>
              ) : (
                <>
                  <span className="text-3xl font-semibold text-neutral-900">
                    ${(product.price / 100).toFixed(0)}
                  </span>
                  {hasPaymentPlan && (
                    <p className="text-sm text-neutral-600 mt-1">
                      Or 3 payments of $59/month
                    </p>
                  )}
                </>
              )}
            </div>
          </div>

          {userOwnsProduct ? (
            <a
              href="/dashboard"
              className="inline-flex items-center justify-center w-full bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Access Your Program
            </a>
          ) : (
            <EnrollButton
              productId={product.id}
              productSlug={product.slug}
              hasPaymentPlan={hasPaymentPlan}
              isFree={isFree}
              isLoggedIn={!!session?.user}
            />
          )}
        </div>

        {/* What's included */}
        {(product.videos.length > 0 || product.workbooks.length > 0) && (
          <div className="bg-white rounded-lg border border-neutral-200 p-8 mb-8">
            <h2 className="font-serif text-2xl text-neutral-900 mb-4">
              What's Included
            </h2>

            {product.videos.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-neutral-800 mb-2">
                  Video Lessons ({product.videos.length})
                </h3>
                <ul className="space-y-2">
                  {product.videos.map((video) => (
                    <li key={video.id} className="flex items-start text-neutral-600">
                      <span className="text-primary mr-2">▸</span>
                      <span>{video.title}</span>
                      {video.duration && (
                        <span className="ml-auto text-sm text-neutral-400">
                          {Math.floor(video.duration / 60)} min
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {product.workbooks.length > 0 && (
              <div>
                <h3 className="font-semibold text-neutral-800 mb-2">
                  Workbooks ({product.workbooks.length})
                </h3>
                <ul className="space-y-2">
                  {product.workbooks.map((workbook) => (
                    <li key={workbook.id} className="flex items-start text-neutral-600">
                      <span className="text-primary mr-2">▸</span>
                      <span>{workbook.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Additional program details - can be customized per product */}
        {product.slug === 'optimal-fertility-blueprint' && (
          <div className="prose prose-neutral max-w-none">
            <h2 className="font-serif text-2xl text-neutral-900 mb-4">
              Transform Your Fertility Journey
            </h2>
            <p className="text-neutral-600 leading-relaxed mb-4">
              The Optimal Fertility Blueprint is a comprehensive 9-week program that combines
              ancient Traditional Chinese Medicine wisdom with modern fertility science.
              Each week, you'll receive:
            </p>
            <ul className="space-y-2 text-neutral-600">
              <li>Detailed video lessons on TCM fertility principles</li>
              <li>Downloadable workbooks with exercises and tracking tools</li>
              <li>Acupressure point demonstrations you can do at home</li>
              <li>Guided meditations for stress reduction</li>
              <li>Customized supplement and nutrition protocols</li>
            </ul>
            <p className="text-neutral-600 leading-relaxed mt-4">
              Plus, when you pay in full, you'll receive exclusive bonus content including
              lifetime access to program updates and a members-only community.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
