import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function OfferBanner() {
  return (
    <section className="flex flex-col gap-2 shrink-0">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-extrabold text-slate-800 tracking-tight">Exclusive Offers</h2>
        <Link href="/offers" className="text-xs font-bold text-[#064e3b] hover:underline">
          View All
        </Link>
      </div>

      <div className="relative overflow-hidden bg-[#f4faec] rounded-[16px] w-full max-w-full h-[135px] flex items-center justify-between px-8 border border-[#e8f3e6] shadow-[0_1px_3px_rgba(0,0,0,0.02)] select-none group shrink-0">
        
        {/* Left Content */}
        <div className="flex flex-col items-start gap-1 z-10 max-w-sm">
          <div className="px-2 py-0.5 rounded-full bg-white/60 border border-white text-slate-700 text-[8px] font-bold tracking-wide uppercase leading-none">
            Limited Time Offer
          </div>
          
          <h3 className="text-base font-extrabold text-slate-800 leading-tight">
            Get Special Offers
          </h3>
          
          <div className="flex items-center gap-4 mt-0.5">
            <div className="flex items-baseline gap-1">
              <span className="text-slate-500 font-semibold text-xs leading-none">Up to</span>
              <span className="text-2xl font-black text-[#16a34a] leading-none">30%</span>
              <span className="text-xs font-bold text-slate-800 leading-none">OFF</span>
            </div>
            
            <Link href="/offers">
              <Button className="bg-[#064e3b] hover:bg-[#064e3b]/90 text-white font-extrabold px-4 h-7 rounded-[12px] text-[10px] flex items-center gap-1.5 cursor-pointer shadow-none">
                <span>Shop Now</span>
                <span className="font-bold">→</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Right Content / Exclusive Offer Illustration */}
        <div className="absolute right-[40px] bottom-0 top-0 w-[200px] pointer-events-none select-none flex items-center justify-center shrink-0">
          <div className="relative w-full h-[110px]">
            <Image
              src="/images/exclusive-offer.png"
              alt="Exclusive Offer"
              fill
              className="object-contain"
            />
          </div>
        </div>

      </div>
    </section>
  );
}
