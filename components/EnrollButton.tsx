'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface EnrollButtonProps {
  productId: string;
  productSlug: string;
  hasPaymentPlan: boolean;
  isFree: boolean;
  isLoggedIn: boolean;
}

export function EnrollButton({
  productId,
  productSlug,
  hasPaymentPlan,
  isFree,
  isLoggedIn,
}: EnrollButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPriceType, setSelectedPriceType] = useState<'one-time' | 'payment-plan'>('one-time');
  const [error, setError] = useState<string | null>(null);

  const handleEnroll = async () => {
    // Check if user is logged in
    if (!isLoggedIn) {
      router.push(`/auth/login?callbackUrl=/programs/${productSlug}`);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // For free products, handle differently (could auto-grant access)
      if (isFree) {
        // TODO: Implement free product enrollment
        // For now, redirect to dashboard
        router.push('/dashboard');
        return;
      }

      // Create checkout session
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          priceType: selectedPriceType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.redirectTo) {
          router.push(data.redirectTo);
          return;
        }
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      console.error('Enrollment error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Payment plan selector */}
      {hasPaymentPlan && !isFree && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Choose Payment Option
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSelectedPriceType('one-time')}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                selectedPriceType === 'one-time'
                  ? 'border-primary bg-primary/5'
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <div className="font-semibold text-neutral-900">Pay in Full</div>
              <div className="text-sm text-neutral-600">$149 one-time</div>
              <div className="text-xs text-primary mt-1">+ Bonus content</div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedPriceType('payment-plan')}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                selectedPriceType === 'payment-plan'
                  ? 'border-primary bg-primary/5'
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <div className="font-semibold text-neutral-900">Payment Plan</div>
              <div className="text-sm text-neutral-600">3 × $59/month</div>
              <div className="text-xs text-neutral-500 mt-1">Total: $177</div>
            </button>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
          {error}
        </div>
      )}

      {/* Enroll button */}
      <Button
        onClick={handleEnroll}
        disabled={isLoading}
        className="w-full bg-primary text-white hover:bg-primary/90 py-6 text-lg"
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Processing...
          </span>
        ) : isFree ? (
          'Enroll for Free'
        ) : (
          'Enroll Now'
        )}
      </Button>

      {!isFree && (
        <p className="text-xs text-center text-neutral-500">
          Secure checkout powered by Stripe
        </p>
      )}
    </div>
  );
}
