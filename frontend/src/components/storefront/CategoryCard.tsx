import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Category } from "@/types";
import { Apple, Leaf, GlassWater, Landmark } from "lucide-react";

interface CategoryCardProps {
  category: Category;
  className?: string;
}

export function CategoryCard({ category, className = "" }: CategoryCardProps) {
  const { name, slug, imageUrl } = category;

  // Set standard icon fallbacks for categories
  const getIcon = (slug: string) => {
    switch (slug) {
      case "fresh-fruits":
        return <Apple size={28} className="text-emerald-600" />;
      case "fresh-vegetables":
        return <Leaf size={28} className="text-emerald-600" />;
      case "daily-essentials":
        return <GlassWater size={28} className="text-emerald-600" />;
      default:
        return <Landmark size={28} className="text-emerald-600" />;
    }
  };

  return (
    <Link
      href={`/category/${slug}`}
      className={`group flex flex-col items-center justify-center p-5 rounded-2xl bg-card border-2 border-slate-800 hover:border-[#064e3b] hover:shadow-md transition-all duration-300 cursor-pointer ${className}`}
    >
      {/* Category Image Circle */}
      <div className="w-16 h-16 rounded-full bg-emerald-50/50 flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors duration-300">
        {imageUrl ? (
          <div className="relative w-10 h-10 overflow-hidden rounded-full">
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-contain transition-transform duration-300 group-hover:scale-110"
              onError={(e) => {
                // If local image fails to load, render icon
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          </div>
        ) : (
          getIcon(slug)
        )}
      </div>

      <span className="text-sm font-semibold text-slate-800 group-hover:text-primary transition-colors text-center">
        {name}
      </span>
    </Link>
  );
}
