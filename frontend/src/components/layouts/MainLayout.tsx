import React from "react";
import { Header } from "@/components/storefront/Header";
import { LeftSidebar } from "@/components/storefront/LeftSidebar";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center bg-[#fafaf9] font-sans text-slate-800">
      {/* Responsive layout wrapper centered on screen */}
      <div className="w-full max-w-[1536px] h-screen flex flex-col bg-[#fafaf9] relative overflow-hidden">
        <Header />
        <div className="flex flex-1 min-w-0 overflow-hidden">
          <LeftSidebar />
          <main className="flex-1 min-w-0 overflow-y-auto px-[24px] pb-[24px] pt-[24px]">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
