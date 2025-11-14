import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-neutral-50">
      <Header user={session?.user} />
      <main>
      {/* Hero Section */}
      <div className="max-w-container mx-auto px-6 py-20 md:py-32">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h1 className="font-serif text-4xl md:text-6xl text-neutral-800 leading-tight tracking-tight">
            Welcome to Your Fertility Journey
          </h1>

          <p className="text-body-lg text-neutral-600 max-w-2xl mx-auto">
            Access your personalized programs, video workshops, and wellness resources
            designed to support you on your path to optimal fertility.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center px-8 py-3 bg-primary text-white font-sans font-medium rounded-md hover:bg-primary-dark transition-colors"
            >
              Sign In
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>

            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center px-8 py-3 bg-white text-neutral-800 font-sans font-medium rounded-md border border-neutral-200 hover:border-primary hover:text-primary transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white p-8 rounded-lg border border-neutral-100">
            <h3 className="font-serif text-h3 text-neutral-800 mb-3">
              Expert Guidance
            </h3>
            <p className="text-body text-neutral-600">
              Evidence-based TCM practices combined with modern wellness approaches.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg border border-neutral-100">
            <h3 className="font-serif text-h3 text-neutral-800 mb-3">
              Video Workshops
            </h3>
            <p className="text-body text-neutral-600">
              Guided acupressure, meditation, and qigong exercises at your own pace.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg border border-neutral-100">
            <h3 className="font-serif text-h3 text-neutral-800 mb-3">
              Comprehensive Resources
            </h3>
            <p className="text-body text-neutral-600">
              Weekly workbooks, supplement plans, and ongoing support materials.
            </p>
          </div>
        </div>
      </div>
      </main>
      <Footer />
    </div>
  );
}
