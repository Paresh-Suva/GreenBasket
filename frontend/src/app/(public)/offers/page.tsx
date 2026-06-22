"use client";

import React, { useState } from "react";

import { Ticket, Copy, Check, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Coupon {
  code: string;
  discount: string;
  description: string;
  category: string;
  minAmount: number;
}

const OFFERS: Coupon[] = [
  {
    code: "WELCOME10",
    discount: "10% OFF",
    description: "Get 10% off on any order. Minimum order value ₹100.",
    category: "All Categories",
    minAmount: 100
  },
  {
    code: "VEGGIE15",
    discount: "15% OFF",
    description: "Enjoy 15% off on farm-fresh vegetables. Minimum purchase of vegetable items must be ₹150.",
    category: "Fresh Vegetables",
    minAmount: 150
  },
  {
    code: "FRUIT20",
    discount: "20% OFF",
    description: "Get a sweet 20% off on juicy fruits. Minimum purchase of fruit items must be ₹200.",
    category: "Fresh Fruits",
    minAmount: 200
  },
  {
    code: "DAIRY12",
    discount: "12% OFF",
    description: "Save 12% on dairy products (Milk, Cheese, Butter, Cream & Curd). Minimum purchase of dairy items must be ₹150.",
    category: "Dairy & Eggs",
    minAmount: 150
  },
  {
    code: "BAKERY20",
    discount: "20% OFF",
    description: "Treat yourself! Get 20% off on freshly baked bread, buns, and pastries. Minimum purchase of bakery items must be ₹200.",
    category: "Bakery & Cakes",
    minAmount: 200
  },
  {
    code: "MEAT15",
    discount: "15% OFF",
    description: "Get 15% off on fresh poultry and red meat. Minimum purchase of meat items must be ₹300.",
    category: "Meat & Poultry",
    minAmount: 300
  },
  {
    code: "SEAFOOD10",
    discount: "10% OFF",
    description: "Save 10% on ocean seafood and local fish. Minimum purchase of seafood items must be ₹250.",
    category: "Fresh Seafood",
    minAmount: 250
  },
  {
    code: "STAPLES10",
    discount: "10% OFF",
    description: "10% off on pantry staples (Cooking Oils, Rice, Grains, Atta & Pulses). Minimum purchase of staple items must be ₹250.",
    category: "Pantry Staples",
    minAmount: 250
  },
  {
    code: "DRINKS15",
    discount: "15% OFF",
    description: "Quench your thirst! 15% off on juices, sodas, and drinks. Minimum purchase of beverages must be ₹150.",
    category: "Beverages",
    minAmount: 150
  },
  {
    code: "SNACKS15",
    discount: "15% OFF",
    description: "15% off on tasty cookies, biscuits, and potato chips. Minimum purchase of snacks must be ₹150.",
    category: "Snacks & Munchies",
    minAmount: 150
  }
];

export default function OffersPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon code ${code} copied!`);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  };

  return (
    <div className="flex-1 max-w-[1250px] min-w-0 h-full overflow-y-auto flex flex-col gap-6 hide-scrollbar pb-12 font-outfit text-left px-2 sm:px-6">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex flex-col">
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-500" />
            <span>Exclusive Offers & Coupons</span>
          </h1>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            Apply these coupon codes at checkout to unlock amazing discounts on your favorite categories!
          </p>
        </div>
      </div>

      {/* Informative Alert */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex gap-3 items-start">
        <AlertCircle className="w-5 h-5 text-[#064e3b] shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-800 font-semibold leading-relaxed">
          <p className="font-bold text-[#064e3b]">How to use Category Coupons:</p>
          <p className="mt-0.5">
            Category-specific discounts are calculated based on the total value of items belonging to that category in your cart. Simply add eligible items matching the minimum category threshold and apply the code!
          </p>
        </div>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
        {OFFERS.map((coupon) => {
          const isCopied = copiedCode === coupon.code;
          return (
            <div
              key={coupon.code}
              className="bg-card border border-slate-100 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-[#064e3b]/25 transition-all duration-300 flex flex-col sm:flex-row"
            >
              {/* Left Cutout Discount */}
              <div className="bg-[#064e3b] text-white p-6 flex flex-col justify-center items-center text-center sm:w-1/3 shrink-0 relative border-r border-dashed border-white/20 select-none">
                <Ticket className="w-8 h-8 opacity-80 mb-2" />
                <span className="text-xl font-black tracking-tight leading-none">{coupon.discount}</span>
                <span className="text-[10px] text-white/70 font-bold uppercase tracking-wider mt-1">{coupon.category}</span>

                {/* Decorative tickets holes */}
                <div className="absolute top-1/2 -translate-y-1/2 -left-3 w-6 h-6 bg-slate-50/50 rounded-full hidden sm:block"></div>
                <div className="absolute top-1/2 -translate-y-1/2 -right-3 w-6 h-6 bg-white rounded-full hidden sm:block"></div>
              </div>

              {/* Right Details */}
              <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                <div className="flex flex-col gap-1.5">
                  <span className="bg-emerald-50 text-[#064e3b] font-black text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-full self-start">
                    {coupon.category}
                  </span>
                  <h3 className="font-bold text-slate-800 text-sm leading-snug">
                    {coupon.description}
                  </h3>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-50">
                  <div className="bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl text-xs font-black text-slate-700 tracking-wide uppercase select-all">
                    {coupon.code}
                  </div>
                  <Button
                    onClick={() => handleCopy(coupon.code)}
                    className={`h-9 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer select-none ${isCopied
                        ? "bg-emerald-600 text-white hover:bg-emerald-600"
                        : "bg-primary hover:bg-[#064e3b] hover:text-white text-white"
                      }`}
                  >
                    {isCopied ? (
                      <>
                        <Check size={14} />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>Copy Code</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
