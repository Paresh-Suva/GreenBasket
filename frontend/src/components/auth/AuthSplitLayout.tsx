import React from "react";
import { cn } from "@/lib/utils";

interface AuthSplitLayoutProps {
  children: React.ReactNode;
  renderLeft: React.ReactNode;
}

export function AuthSplitLayout({ children, renderLeft }: AuthSplitLayoutProps) {
  return (
    <div className="w-full max-w-[1200px] bg-white rounded-[2rem] shadow-[0_8px_40px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col lg:flex-row min-h-[650px] relative z-10">
      
      {/* Left Column (Branding & Illustration) */}
      <div className="w-full lg:w-[45%] lg:min-w-[450px] relative overflow-hidden bg-gradient-to-br from-[#F5FBF7] to-[#E9F6EE] p-8 lg:p-12 flex flex-col">
        {/* Soft floating leaves */}
        <div className="absolute top-10 right-12 w-4 h-4 bg-primary/20 rounded-full blur-[1px] rotate-45 rounded-tr-none" />
        <div className="absolute top-1/3 left-8 w-6 h-6 bg-primary/30 rounded-full blur-[2px] -rotate-12 rounded-bl-none" />
        <div className="absolute bottom-1/4 right-1/4 w-5 h-5 bg-primary/10 rounded-full blur-[1px] rotate-90 rounded-tl-none" />

        {/* Dynamic Left Content */}
        <div className="relative z-10 flex-1 flex flex-col h-full">
          {renderLeft}
        </div>
      </div>

      {/* Right Column (Form) */}
      <div className="w-full lg:flex-1 p-8 lg:p-12 xl:p-16 flex items-center justify-center bg-white">
        <div className="w-full max-w-[420px]">
          {children}
        </div>
      </div>
    </div>
  );
}

export function AuthCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("w-full max-w-[480px] bg-white rounded-[2rem] shadow-[0_8px_40px_rgb(0,0,0,0.06)] p-8 sm:p-12 relative z-10", className)}>
      {children}
    </div>
  );
}
