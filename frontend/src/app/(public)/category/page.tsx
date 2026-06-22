"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { categoriesService } from "@/services/categories.service";
import { getFullImageUrl } from "@/services/api";
import { LoadingState } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { FolderTree, Sparkles, ArrowRight } from "lucide-react";
import { Category } from "@/types";

export default function CategoriesPage() {
  const { data: categoriesRes, isLoading } = useQuery({
    queryKey: ["active-categories"],
    queryFn: () => categoriesService.getAllActiveCategories()
  });

  const categories = categoriesRes?.data || [];

  // Fallback category illustration helper
  const getCategoryImg = (cat: Category) => {
    if (cat.imageUrl) return getFullImageUrl(cat.imageUrl);
    const n = cat.name.toLowerCase();
    if (n.includes("vegetable")) return "/images/cat-vegetables.png";
    if (n.includes("fruit")) return "/images/cat-fruits.png";
    if (n.includes("dairy")) return "/images/cat-dairy.png";
    if (n.includes("beverage")) return "/images/cat-beverages.png";
    if (n.includes("snack")) return "/images/cat-snacks.png";
    if (n.includes("bakery")) return "/images/cat-bakery.png";
    if (n.includes("care")) return "/images/cat-personal-care.png";
    return "/images/Logo.png";
  };

  return (
    <div className="flex-1 max-w-[1250px] min-w-0 h-full overflow-y-auto flex flex-col gap-6 hide-scrollbar pb-12 font-outfit text-left px-2 sm:px-6">
      
      {/* Page Header */}
      <div className="border-b border-slate-100 pb-4">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
          <FolderTree className="w-6 h-6 text-[#064e3b]" />
          <span>Shop by Category</span>
        </h1>
        <p className="text-xs text-slate-400 font-semibold mt-1">
          Explore our handpicked categories for organic fruits, farm-fresh vegetables, dairy, pantry staples and more.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <LoadingState text="Loading categories..." />
        </div>
      ) : categories.length === 0 ? (
        <div className="w-full py-12">
          <EmptyState
            icon={FolderTree}
            title="No Active Categories"
            description="Our categories catalog is currently empty. Check back soon!"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-2">
          {categories.map((cat) => (
            <Link
              href={`/category/${cat.slug}`}
              key={cat.id}
              className="bg-card border-2 border-[#064e3b] rounded-3xl p-5 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col gap-4 group cursor-pointer"
            >
              {/* Image Circle Container */}
              <div className="aspect-square bg-slate-50 rounded-2xl border border-slate-100/50 flex items-center justify-center overflow-hidden p-4 group-hover:scale-[1.03] group-hover:border-[#064e3b]/15 transition-all duration-300 relative">
                <img
                  src={getCategoryImg(cat)}
                  alt={cat.name}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Title & Info */}
              <div className="flex flex-col gap-1 text-left">
                <h3 className="font-extrabold text-slate-800 text-base group-hover:text-[#064e3b] transition-colors leading-tight">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 font-medium leading-relaxed mt-1">
                  {cat.description || `Browse our selection of premium ${cat.name.toLowerCase()} products.`}
                </p>
              </div>

              {/* Card Footer action button */}
              <div className="mt-auto pt-2 border-t border-slate-50 flex items-center justify-between text-xs font-black text-[#064e3b]/70 group-hover:text-[#064e3b] transition-colors">
                <span>View Department</span>
                <ArrowRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      )}

    </div>
  );
}
