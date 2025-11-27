import Link from "next/link";
import { Heart } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-50 border-t border-neutral-100 mt-20">
      <div className="max-w-container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="font-serif text-xl text-neutral-800 font-semibold">
              ClearPath Fertility
            </h3>
            <p className="text-sm text-neutral-600">
              Supporting your journey to optimal fertility through Traditional Chinese Medicine and holistic wellness.
            </p>
          </div>

          {/* Programs */}
          <div>
            <h4 className="font-sans text-sm font-semibold text-neutral-800 mb-4">
              Programs
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/programs/free-workshop"
                  className="text-sm text-neutral-600 hover:text-primary transition-colors"
                >
                  Free Workshop
                </Link>
              </li>
              <li>
                <Link
                  href="/programs/optimal-fertility-blueprint"
                  className="text-sm text-neutral-600 hover:text-primary transition-colors"
                >
                  Optimal Fertility Blueprint
                </Link>
              </li>
              <li>
                <Link
                  href="/programs/stress-free-goddess"
                  className="text-sm text-neutral-600 hover:text-primary transition-colors"
                >
                  Stress-free Goddess Program
                </Link>
              </li>
              <li>
                <Link
                  href="/programs/fearlessly-fertile-yoga"
                  className="text-sm text-neutral-600 hover:text-primary transition-colors"
                >
                  Fearlessly Fertile Yoga
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-sans text-sm font-semibold text-neutral-800 mb-4">
              Account
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/dashboard"
                  className="text-sm text-neutral-600 hover:text-primary transition-colors"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/login"
                  className="text-sm text-neutral-600 hover:text-primary transition-colors"
                >
                  Sign In
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/signup"
                  className="text-sm text-neutral-600 hover:text-primary transition-colors"
                >
                  Create Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-sans text-sm font-semibold text-neutral-800 mb-4">
              Legal
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-neutral-600 hover:text-primary transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-neutral-600 hover:text-primary transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-neutral-200">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-neutral-600">
              © {currentYear} ClearPath Fertility. All rights reserved.
            </p>
            <p className="text-sm text-neutral-600 flex items-center gap-1">
              Made with <Heart className="h-4 w-4 text-primary fill-primary" /> for your fertility journey
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
