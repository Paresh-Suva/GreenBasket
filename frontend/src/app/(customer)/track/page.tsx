"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Truck, Search, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function TrackLookupPage() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState("");

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const query = orderNumber.trim();
    if (!query) {
      toast.error("Please enter an order number");
      return;
    }

    if (!query.startsWith("ORD-")) {
      toast.error("Invalid order number format. Should start with ORD-");
      return;
    }

    router.push(`/tracking/${query}`);
  };

  return (
    <>
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 font-outfit min-h-[60vh] text-left">
        <div className="bg-card border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm max-w-md w-full flex flex-col gap-6">
          
          <div className="flex flex-col items-center text-center gap-2">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-primary flex items-center justify-center">
              <Truck className="w-6 h-6 text-[#064e3b]" />
            </div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight mt-2">
              Track Your Order
            </h1>
            <p className="text-xs text-slate-400 font-semibold max-w-[280px]">
              Enter your unique order number to trace its real-road OSRM path and delivery progression.
            </p>
          </div>

          <form onSubmit={handleTrack} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500">Order Number</label>
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  type="text"
                  placeholder="e.g. ORD-1718900000"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="pl-9 h-11 text-xs border border-slate-200 focus-visible:ring-primary focus-visible:border-primary rounded-xl"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#064e3b] hover:bg-[#064e3b]/90 text-white font-bold h-11 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer mt-1"
            >
              <Truck size={16} />
              <span>Track Delivery</span>
            </Button>
          </form>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex gap-2.5 items-start text-[10px] text-slate-500 font-semibold leading-normal">
            <AlertCircle size={14} className="text-slate-400 shrink-0 mt-0.5" />
            <span>
              {"You can find your order number in the order confirmation email or under your account's \"My Orders\" tab."}
            </span>
          </div>

        </div>
      </div>
    </>
  );
}
