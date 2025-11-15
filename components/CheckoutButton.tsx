"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface CheckoutButtonProps {
  productId: string;
  priceType?: "one-time" | "payment-plan";
  children: React.ReactNode;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export function CheckoutButton({
  productId,
  priceType = "one-time",
  children,
  className,
  size,
  variant,
}: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    setIsLoading(true);

    try {
      console.log('Creating checkout session:', { productId, priceType });

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          priceType,
        }),
      });

      const data = await response.json();
      console.log('Checkout response:', { status: response.status, data });

      if (!response.ok) {
        console.error('Checkout failed:', data);
        alert(data.error || "Failed to create checkout session");
        setIsLoading(false);
        return;
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        console.log('Redirecting to Stripe:', data.url);
        window.location.href = data.url;
      } else {
        console.error('No URL in response:', data);
        alert("Failed to get checkout URL");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCheckout}
      disabled={isLoading}
      className={className}
      size={size}
      variant={variant}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        children
      )}
    </Button>
  );
}
