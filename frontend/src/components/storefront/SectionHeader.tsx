import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  viewAllLink?: string;
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  viewAllLink,
  className = ""
}: SectionHeaderProps) {
  return (
    <div className={`flex items-end justify-between border-b border-slate-100 pb-3 mb-6 ${className}`}>
      <div className="flex flex-col text-left gap-1">
        <h2 className="text-xl sm:text-2xl font-black text-secondary tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs sm:text-sm text-muted-foreground font-medium">
            {subtitle}
          </p>
        )}
      </div>
      {viewAllLink && (
        <Link href={viewAllLink} className="shrink-0 cursor-pointer">
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/95 font-bold flex items-center gap-0.5 cursor-pointer">
            <span>View All</span>
            <ChevronRight size={16} />
          </Button>
        </Link>
      )}
    </div>
  );
}
