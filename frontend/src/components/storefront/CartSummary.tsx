"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Ticket, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useCartStore } from "@/store/useCartStore";

interface CartSummaryProps {
  subtotal: number;
  onCheckout?: () => void;
  className?: string;
}

export function CartSummary({
  subtotal,
  onCheckout,
  className = ""
}: CartSummaryProps) {
  const [couponCode, setCouponCode] = useState("");
  const {
    appliedCoupon,
    couponDiscountPercent,
    couponDiscountAmount,
    applyCoupon,
    removeCoupon
  } = useCartStore();

  // Delivery Fee logic: Free delivery on orders over $35, otherwise $4.99
  const deliveryThreshold = 35;
  const isFreeDelivery = subtotal >= deliveryThreshold;
  const deliveryFee = subtotal > 0 ? (isFreeDelivery ? 0 : 4.99) : 0;

  // Tax logic: 8% estimated tax
  const taxPercent = 0.08;
  const tax = subtotal > 0 ? subtotal * taxPercent : 0;

  // Grand Total calculation
  const grandTotal = Math.max(0, subtotal - couponDiscountAmount + deliveryFee + tax);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();

    if (!code) return;

    const success = applyCoupon(code);
    if (success) {
      toast.success(`Coupon ${code} applied successfully!`);
    } else {
      toast.error(`Invalid coupon code or minimum conditions not met. Check offers!`);
    }
    setCouponCode("");
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    toast.info("Coupon removed");
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR"
    }).format(val);
  };

  return (
    <div className={`bg-card border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col gap-6 text-left ${className}`}>
      <h3 className="font-bold text-slate-800 text-lg">Order Summary</h3>

      {/* Coupon Application */}
      <div className="border-b border-slate-100 pb-4">
        {appliedCoupon ? (
          <div className="flex items-center justify-between bg-emerald-50 border border-primary/20 rounded-xl p-3 text-xs text-primary font-bold">
            <div className="flex items-center gap-1.5">
              <Check size={16} className="text-primary" />
              <span>Coupon {appliedCoupon} Applied ({couponDiscountPercent}%)</span>
            </div>
            <Button
              variant="link"
              onClick={handleRemoveCoupon}
              className="text-red-500 hover:text-red-600 font-bold p-0 h-auto cursor-pointer"
            >
              Remove
            </Button>
          </div>
        ) : (
          <form onSubmit={handleApplyCoupon} className="flex gap-2">
            <div className="relative flex-1">
              <Ticket size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                type="text"
                placeholder="Promo code (e.g. WELCOME10)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="pl-9 h-10 text-xs border border-slate-200 focus-visible:ring-primary focus-visible:border-primary rounded-xl bg-slate-50/50 uppercase"
              />
            </div>
            <Button
              type="submit"
              className="bg-secondary hover:bg-secondary/95 text-white font-bold text-xs h-10 px-4 rounded-xl cursor-pointer"
            >
              Apply
            </Button>
          </form>
        )}
      </div>

      {/* Pricing Rows */}
      <div className="flex flex-col gap-3 text-sm font-semibold border-b border-slate-100 pb-5">
        <div className="flex justify-between text-slate-600">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        
        {couponDiscountAmount > 0 && (
          <div className="flex justify-between text-primary font-bold">
            <span>Discount ({couponDiscountPercent}%)</span>
            <span>-{formatCurrency(couponDiscountAmount)}</span>
          </div>
        )}

        <div className="flex justify-between text-slate-600">
          <span>Delivery Fee</span>
          {isFreeDelivery ? (
            <span className="text-primary font-bold">FREE</span>
          ) : (
            <span>{formatCurrency(deliveryFee)}</span>
          )}
        </div>

        <div className="flex justify-between text-slate-600">
          <span>Estimated Tax</span>
          <span>{formatCurrency(tax)}</span>
        </div>

        {/* Free Delivery Promo Progress */}
        {!isFreeDelivery && subtotal > 0 && (
          <div className="bg-amber-50 border border-amber-200/50 rounded-xl p-3 text-[11px] text-amber-800 leading-normal font-medium mt-1">
            Add <span className="font-bold">{formatCurrency(deliveryThreshold - subtotal)}</span> more to your cart to unlock <span className="font-bold">FREE delivery</span>!
          </div>
        )}
      </div>

      {/* Grand Total */}
      <div className="flex justify-between items-baseline font-black">
        <span className="text-slate-800 text-base">Grand Total</span>
        <span className="text-2xl text-secondary">{formatCurrency(grandTotal)}</span>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 mt-2">
        <Button
          onClick={onCheckout}
          disabled={subtotal === 0}
          className="w-full bg-primary hover:bg-primary/95 text-white font-bold h-12 rounded-full flex items-center justify-center gap-2 shadow-md shadow-emerald-700/10 cursor-pointer"
        >
          <span>Proceed to Checkout</span>
          <ArrowRight size={18} />
        </Button>
        <Link href="/products" className="block w-full">
          <Button
            variant="outline"
            className="w-full border-slate-200 hover:bg-slate-50 text-slate-600 font-bold h-12 rounded-full cursor-pointer"
          >
            Continue Shopping
          </Button>
        </Link>
      </div>

    </div>
  );
}
