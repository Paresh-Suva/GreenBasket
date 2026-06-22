"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ShoppingBag, ListOrdered, Calendar, ShieldCheck } from "lucide-react";
import { LoadingState } from "@/components/ui/loading-state";

function SuccessContent() {
  const searchParams = useSearchParams();

  const orderNumber = searchParams.get("orderNumber") || "N/A";
  const totalAmount = Number(searchParams.get("totalAmount") || 0);
  const createdAtStr = searchParams.get("createdAt");

  const orderDate = createdAtStr ? new Date(createdAtStr) : new Date();

  // Estimated delivery: 2 days after order date
  const estDelivery = new Date(orderDate);
  estDelivery.setDate(estDelivery.getDate() + 2);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR"
    }).format(val);
  };

  return (
    <div className="max-w-2xl mx-auto py-12 text-center select-none">
      <div className="bg-card border border-slate-100 rounded-3xl p-8 sm:p-12 shadow-sm flex flex-col items-center">
        
        {/* Success Icon */}
        <div className="bg-emerald-50 text-primary rounded-full p-4 mb-6 shadow-sm border border-primary/10">
          <CheckCircle2 size={56} className="stroke-[1.5px]" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-secondary tracking-tight mb-2">
          Order Placed Successfully!
        </h1>
        <p className="text-slate-500 text-sm font-semibold mb-8 max-w-sm">
          Thank you for shopping with GreenBasket. Your fresh organic groceries are on their way!
        </p>

        {/* Order Details Details Panel */}
        <div className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl p-5 text-left flex flex-col gap-3.5 mb-8 text-xs font-semibold text-slate-600">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <span>Order Number</span>
            <span className="font-extrabold text-slate-800 text-sm uppercase">{orderNumber}</span>
          </div>
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <span>Order Date</span>
            <span className="font-bold text-slate-700">{orderDate.toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <span>Total Amount Paid</span>
            <span className="font-extrabold text-secondary text-sm">{formatCurrency(totalAmount)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} className="text-primary" />
              <span>Estimated Delivery</span>
            </span>
            <span className="font-black text-primary">{estDelivery.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</span>
          </div>
        </div>

        {/* Info Box */}
        <div className="flex items-center gap-2.5 bg-[#064e3b]/5 border border-[#064e3b]/10 rounded-xl p-4 text-[11px] text-[#064e3b] font-medium leading-normal mb-8 text-left w-full">
          <ShieldCheck size={18} className="shrink-0 text-[#064e3b]" />
          <span>You can cancel your order at any time before it is packed. Go to your orders dashboard to track or manage delivery assignments.</span>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3.5 w-full justify-center">
          <Link href="/products" className="block sm:flex-1">
            <Button className="w-full bg-primary hover:bg-primary/95 text-white font-bold h-11 rounded-full flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-700/10 cursor-pointer">
              <ShoppingBag size={16} />
              <span>Continue Shopping</span>
            </Button>
          </Link>
          <Link href="/profile/orders" className="block sm:flex-1">
            <Button variant="outline" className="w-full border-slate-200 hover:bg-slate-50 text-slate-600 font-bold h-11 rounded-full flex items-center justify-center gap-1.5 cursor-pointer">
              <ListOrdered size={16} />
              <span>View My Orders</span>
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<LoadingState text="Preparing order confirmation..." />}>
      <SuccessContent />
    </Suspense>
  );
}
