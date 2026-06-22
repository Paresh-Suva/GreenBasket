import React from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

export function AuthHeader({ 
  title, 
  subtitle,
  align = "center" 
}: { 
  title: string; 
  subtitle?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={cn("mb-8", align === "center" ? "text-center" : "text-left")}>
      <h1 className="text-2xl md:text-[28px] font-bold text-foreground mb-2 tracking-tight">{title}</h1>
      {subtitle && <p className="text-muted-foreground text-[15px]">{subtitle}</p>}
    </div>
  );
}

export function AuthFormContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("space-y-5", className)}>{children}</div>;
}

export function AuthFooterLinks({
  text,
  linkText,
  href,
}: {
  text: string;
  linkText: string;
  href: string;
}) {
  return (
    <div className="mt-8 text-center text-[14px] text-muted-foreground">
      {text}{" "}
      <Link href={href} className="font-semibold text-primary hover:text-primary/80 transition-colors">
        {linkText}
      </Link>
    </div>
  );
}

export function BrandLogo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2 mb-8", className)}>
      <div className="relative w-8 h-8 md:w-10 md:h-10">
        <Image 
          src="/images/Logo.png" 
          alt="GreenBasket Logo" 
          fill 
          sizes="(max-width: 768px) 32px, 40px"
          className="object-contain" 
        />
      </div>
      <div>
        <h2 className="font-bold text-xl md:text-2xl tracking-tight leading-none text-[#1A4F2C]">GreenBasket</h2>
        <p className="text-[10px] md:text-xs text-[#528C63] font-medium leading-tight">Fresh Groceries, Delivered</p>
      </div>
    </Link>
  );
}
