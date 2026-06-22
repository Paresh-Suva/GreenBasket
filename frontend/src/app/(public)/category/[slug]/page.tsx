"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { categoriesService } from "@/services/categories.service";
import { productsService } from "@/services/products.service";
import { ProductCard } from "@/components/storefront/ProductCard";
import { LoadingState } from "@/components/ui/loading-state";
import { ChevronDown } from "lucide-react";
import { getFullImageUrl } from "@/services/api";
import { Category } from "@/types";

const SORT_OPTIONS = [
  { label: "Popularity", value: "" },
  { label: "Price: Low to High", value: "price,asc" },
  { label: "Price: High to Low", value: "price,desc" },
  { label: "Name: A to Z", value: "name,asc" }
];

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [sort, setSort] = useState("");
  const [page, setPage] = useState(0);

  // 1. Fetch Category Details by slug
  const { data: categoryRes, isLoading: isCategoryLoading, error: categoryError } = useQuery({
    queryKey: ["category", slug],
    queryFn: () => categoriesService.getCategoryBySlug(slug),
    enabled: !!slug
  });

  const category = categoryRes?.data;
  const categoryId = category?.id;

  // 2. Fetch Products for this Category
  const { data: productsRes, isLoading: isProductsLoading } = useQuery({
    queryKey: ["products", "category", categoryId, sort, page],
    queryFn: () =>
      productsService.getProducts({
        categoryId: categoryId!,
        sort: sort || undefined,
        page,
        size: 15 // Exactly 15 items per page (3 rows of 5 cards)
      }),
    enabled: !!categoryId
  });

  const productsPage = productsRes?.data;
  const products = productsPage?.content || [];

  const isLoading = isCategoryLoading || isProductsLoading;

  // Helper for category banner images matching the categories index page
  const getCategoryBannerImg = (cat: Category) => {
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingState text="Loading category shelf..." />
      </div>
    );
  }

  if (categoryError || !category) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 bg-card rounded-2xl border border-slate-100 p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Category Not Found</h2>
        <p className="text-slate-500 mb-6">{"We couldn't find the category you're looking for."}</p>
        <Link href="/" className="inline-flex items-center justify-center bg-[#064e3b] hover:bg-[#064e3b]/90 text-white font-bold px-6 py-2.5 rounded-full text-xs transition-all cursor-pointer">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1250px] mx-auto py-2 flex flex-col gap-[20px] select-none h-full overflow-y-auto hide-scrollbar pr-0.5 pb-12">
      
      {/* Breadcrumbs (Home > CategoryName) */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 text-left">
        <Link href="/" className="hover:text-primary transition-colors cursor-pointer">Home</Link>
        <span>&gt;</span>
        <span className="text-slate-600 font-bold">{category.name}</span>
      </div>

      {/* 1. Category Header Banner (w-full h-[160px]) */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#edf7ef] to-[#edf7ef]/60 rounded-3xl h-[160px] flex items-center justify-between px-8 sm:px-12 text-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.02)] border border-slate-100/50 shrink-0 text-left select-none">
        <div className="relative flex flex-col items-start gap-1 max-w-xl z-10">
          <h1 className="text-3xl font-extrabold text-[#064e3b] tracking-tight">
            {category.name}
          </h1>
          <p className="text-slate-500 text-xs font-semibold max-w-md mt-1 leading-snug">
            {category.description || `Fresh and organic ${category.name.toLowerCase()} straight from farms.`}
          </p>
        </div>
        {/* Category Banner Graphic */}
        <div className="absolute right-0 bottom-0 top-0 w-[260px] sm:w-[320px] select-none pointer-events-none z-0">
          <img
            src={getCategoryBannerImg(category)}
            alt={category.name}
            className="w-full h-full object-contain object-right-bottom"
          />
        </div>
      </div>

      {/* 2. Main content area (Product Grid + Header + Pagination) */}
      <div className="w-full flex flex-col gap-6">
          
          {/* Header Controls */}
          <div className="flex justify-between items-center w-full">
            <span className="text-[13px] font-semibold text-[#8fa0b5]">
              Showing {products.length > 0 ? `1-${products.length}` : "0"} of 56 results
            </span>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] font-semibold text-[#8fa0b5]">Sort by</span>
                <div className="relative">
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="bg-white border border-slate-200/70 rounded-full pl-4 pr-9 h-10 text-[13px] font-bold text-slate-800 focus:outline-none appearance-none cursor-pointer shadow-sm hover:border-slate-300 transition-colors"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8fa0b5] pointer-events-none w-4 h-4" />
                </div>
              </div>
              
              <div className="flex items-center gap-1 border border-slate-200/70 bg-white rounded-full p-1 shadow-sm h-10">
                <button className="p-1.5 rounded-full bg-[#064e3b] text-white cursor-pointer flex items-center justify-center transition-colors">
                  {/* Grid Icon */}
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                </button>
                <button className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer flex items-center justify-center transition-colors">
                  {/* List Icon */}
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                </button>
              </div>
            </div>
          </div>

          {/* Product Grid (Exactly 5 columns at default zoom) */}
          {products.length > 0 ? (
            <div className="grid gap-[14px] w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 pb-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} variant="category" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-100 rounded-3xl p-10 text-center shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <svg className="w-12 h-12 text-slate-200 mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              <h3 className="text-sm font-extrabold text-slate-800 mb-1">No products in this category</h3>
              <p className="text-[11px] text-slate-400 font-semibold max-w-sm">
                We are currently stocking up this shelf. Check back soon for fresh organic arrivals!
              </p>
            </div>
          )}

          {/* Pagination Controls */}
          {productsPage && productsPage.totalPages > 1 && (
            <div className="flex justify-between items-center w-full pt-4 border-t border-slate-100">
              <span className="text-[13px] font-semibold text-[#8fa0b5]">
                Showing {products.length > 0 ? `1-${products.length}` : "0"} of 56 results
              </span>
              
              <div className="flex justify-center items-center gap-1.5">
                <button
                  disabled={productsPage.first}
                  onClick={() => setPage((p) => p - 1)}
                  className="w-8 h-8 rounded-lg border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-600 disabled:opacity-50 cursor-pointer transition-colors bg-white font-extrabold text-xs"
                >
                  &lt;
                </button>
                {[...Array(productsPage.totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-extrabold cursor-pointer transition-colors ${
                      productsPage.page === i
                        ? "bg-[#064e3b] text-white"
                        : "border border-slate-100 text-slate-600 hover:bg-slate-50 bg-white"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  disabled={productsPage.last}
                  onClick={() => setPage((p) => p + 1)}
                  className="w-8 h-8 rounded-lg border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-600 disabled:opacity-50 cursor-pointer transition-colors bg-white font-extrabold text-xs"
                >
                  &gt;
                </button>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
