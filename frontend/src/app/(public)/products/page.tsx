"use client";
 
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import { productsService } from "@/services/products.service";
import { categoriesService } from "@/services/categories.service";
import { ProductGrid } from "@/components/storefront/ProductGrid";
import { LoadingState } from "@/components/ui/loading-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SlidersHorizontal, ArrowUpDown, Loader2 } from "lucide-react";
import { getFullImageUrl } from "@/services/api";
import { Category } from "@/types";
 
export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
 
  // Extract query parameters from URL
  const urlSearch = searchParams.get("search") || "";
  const urlCategory = searchParams.get("category") ? Number(searchParams.get("category")) : null;
  const urlFeatured = searchParams.get("featured") === "true";
 
  // Component States (default sorting is always Price: Low to High)
  const [sort, setSort] = useState("price,asc");
  const [page, setPage] = useState(0); // 0-indexed page for backend
  const [size] = useState(12);
 
  // Price Range State
  const [minPriceInput, setMinPriceInput] = useState("");
  const [maxPriceInput, setMaxPriceInput] = useState("");
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
 
  // Availability State
  const [inStockOnly, setInStockOnly] = useState(false);
 
  // Keep track of search/category to reset page when they change
  const [prevUrlSearch, setPrevUrlSearch] = useState(urlSearch);
  const [prevUrlCategory, setPrevUrlCategory] = useState(urlCategory);
 
  if (urlSearch !== prevUrlSearch || urlCategory !== prevUrlCategory) {
    setPrevUrlSearch(urlSearch);
    setPrevUrlCategory(urlCategory);
    setPage(0);
  }
 
  // 1. Fetch Categories
  const { data: categoriesRes } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesService.getAllActiveCategories()
  });
 
  // 2. Fetch Products (filtered by category/search/featured/price and sorted by price)
  const { data: productsRes, isLoading } = useQuery({
    queryKey: [
      "products",
      urlCategory,
      urlSearch,
      page,
      sort,
      urlFeatured,
      minPrice,
      maxPrice
    ],
    queryFn: () =>
      productsService.getProducts({
        categoryId: urlCategory || undefined,
        search: urlSearch || undefined,
        featured: urlFeatured || undefined,
        page,
        size,
        sort: sort || undefined,
        minPrice,
        maxPrice
      })
  });
 
  const categories = categoriesRes?.data || [];
  const productsPage = productsRes?.data;
  const products = productsPage?.content || [];
 
  const handleSelectCategory = (catId: number | null) => {
    // Update URL query parameters
    const params = new URLSearchParams(window.location.search);
    if (catId) {
      params.set("category", String(catId));
    } else {
      params.delete("category");
    }
    router.push(`/products?${params.toString()}`);
  };
 
  const handleApplyPrice = (e: React.FormEvent) => {
    e.preventDefault();
    const minVal = minPriceInput ? Number(minPriceInput) : undefined;
    const maxVal = maxPriceInput ? Number(maxPriceInput) : undefined;
    setMinPrice(minVal);
    setMaxPrice(maxVal);
    setPage(0);
  };
 
  const handleClearFilters = () => {
    setMinPriceInput("");
    setMaxPriceInput("");
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setInStockOnly(false);
    setPage(0);
    // Clear URL category
    const params = new URLSearchParams(window.location.search);
    params.delete("category");
    router.push(`/products?${params.toString()}`);
  };
 
  const getCategoryImg = (cat: Category) => {
    if (cat.imageUrl) return getFullImageUrl(cat.imageUrl);
    const n = cat.name.toLowerCase();
    if (n.includes("vegetable") || n.includes("greens")) return "/images/cat-vegetables.png";
    if (n.includes("fruit")) return "/images/cat-fruits.png";
    if (n.includes("dairy") || n.includes("milk") || n.includes("cheese") || n.includes("butter") || n.includes("yogurt") || n.includes("curd") || n.includes("paneer") || n.includes("egg")) return "/images/cat-dairy.png";
    if (n.includes("beverage") || n.includes("drink") || n.includes("juice") || n.includes("tea") || n.includes("coffee")) return "/images/cat-beverages.png";
    if (n.includes("snack") || n.includes("chip") || n.includes("biscuit") || n.includes("namkeen") || n.includes("chocolate") || n.includes("sweets")) return "/images/cat-snacks.png";
    if (n.includes("bakery") || n.includes("bread") || n.includes("bun") || n.includes("cake")) return "/images/cat-bakery.png";
    if (n.includes("care") || n.includes("shampoo") || n.includes("soap") || n.includes("face")) return "/images/cat-personal-care.png";
    return "/images/Logo.png";
  };
 
  const selectedCategory = categories.find((c) => c.id === urlCategory);
  const pageTitle = urlFeatured
    ? "Featured Items"
    : selectedCategory
    ? selectedCategory.name
    : "All Products";
 
  // Client-side availability filter
  const displayedProducts = inStockOnly
    ? products.filter((item) => item.inStock)
    : products;
 
  return (
    <div className="max-w-7xl mx-auto py-4 px-2 h-full overflow-y-auto hide-scrollbar pr-0.5 pb-12 flex flex-col gap-5 select-none text-left">
      {/* Page Title / Header Info */}
      <div className="flex items-center justify-between gap-4 mt-2">
        <div className="text-left">
          <h1 className="text-xl sm:text-2xl font-black text-secondary tracking-tight">
            {pageTitle}
          </h1>
          <p className="text-xs text-muted-foreground font-semibold mt-0.5">
            {isLoading
              ? "Searching products..."
              : `Found ${productsPage?.totalElements || 0} organic items`}
          </p>
        </div>
 
        {/* Price Sorting Toggle Button */}
        <button
          onClick={() => setSort(sort === "price,asc" ? "price,desc" : "price,asc")}
          className={`flex items-center gap-2 border px-4 py-2 h-10 rounded-full text-xs font-extrabold focus:outline-none cursor-pointer shadow-2xs select-none transition-all duration-300 active:scale-95 shrink-0 ${
            sort === "price,asc"
              ? "bg-white border-slate-200 hover:bg-slate-50 text-[#064e3b] dark:bg-zinc-900 dark:border-zinc-800"
              : "bg-[#064e3b]/5 border-[#064e3b]/20 hover:bg-[#064e3b]/10 text-[#064e3b] dark:bg-zinc-800/40"
          }`}
          style={{ fontFamily: "var(--font-outfit)" }}
          title={sort === "price,asc" ? "Sort High to Low" : "Sort Low to High"}
        >
          <ArrowUpDown
            size={13}
            className={`text-[#064e3b] transition-transform duration-300 ${
              sort === "price,desc" ? "rotate-185" : ""
            }`}
          />
          <span>{sort === "price,asc" ? "Price: Low to High" : "Price: High to Low"}</span>
        </button>
      </div>
 
      {/* Category Horizontal Scroll Bar (for mobile compatibility & quick browsing) */}
      <div className="w-full shrink-0">
        <div className="flex gap-2.5 overflow-x-auto pb-2 pt-1 hide-scrollbar flex-nowrap scroll-smooth">
          {/* "All Products" Pill */}
          <button
            onClick={() => handleSelectCategory(null)}
            className={`flex items-center gap-3 border pl-1.5 pr-5 rounded-full text-[14px] font-extrabold tracking-tight transition-all shrink-0 cursor-pointer shadow-2xs h-12 ${
              urlCategory === null
                ? "bg-[#064e3b] border-[#064e3b] text-white"
                : "bg-white border-slate-100 text-slate-600 hover:bg-slate-50 hover:border-slate-200 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400"
            }`}
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            <div className="w-9 h-9 bg-slate-50 dark:bg-zinc-800 rounded-full border border-slate-100 dark:border-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
              <SlidersHorizontal size={15} className={urlCategory === null ? "text-[#064e3b]" : "text-slate-400"} />
            </div>
            <span>All Products</span>
          </button>
 
          {/* Category List Pills */}
          {categories.map((cat) => {
            const isSelected = urlCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleSelectCategory(cat.id)}
                className={`flex items-center gap-3 border pl-1.5 pr-5 rounded-full text-[14px] font-extrabold tracking-tight transition-all shrink-0 cursor-pointer shadow-2xs h-12 ${
                  isSelected
                    ? "bg-[#064e3b] border-[#064e3b] text-white"
                    : "bg-white border-slate-100 text-slate-600 hover:bg-slate-50 hover:border-slate-200 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400"
                }`}
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                <div className="w-9 h-9 bg-slate-50 dark:bg-zinc-800 rounded-full border border-slate-100 dark:border-zinc-800 flex items-center justify-center overflow-hidden relative shrink-0">
                  <img
                    src={getCategoryImg(cat)}
                    alt={cat.name}
                    className="w-full h-full object-contain p-1"
                  />
                </div>
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>
 
      {/* Main Catalog Grid Layout */}
      <div className="w-full flex flex-col gap-6">
        {/* Full-width Products Grid Area */}
        <div className="w-full flex flex-col gap-6">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[40vh]">
              <LoadingState text="Loading items..." />
            </div>
          ) : displayedProducts.length > 0 ? (
            <>
              <ProductGrid products={displayedProducts} />
              
              {/* Pagination Controls */}
              {productsPage && productsPage.totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-4 pb-4">
                  <Button
                    variant="outline"
                    disabled={productsPage.first}
                    onClick={() => setPage((p) => p - 1)}
                    className="border-slate-200 text-slate-600 font-bold rounded-xl cursor-pointer hover:bg-slate-50 text-xs py-1.5 h-8 px-3"
                  >
                    Previous
                  </Button>
                  <span className="text-[11px] text-muted-foreground font-bold px-3">
                    Page {productsPage.page + 1} of {productsPage.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={productsPage.last}
                    onClick={() => setPage((p) => p + 1)}
                    className="border-slate-200 text-slate-600 font-bold rounded-xl cursor-pointer hover:bg-slate-50 text-xs py-1.5 h-8 px-3"
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[45vh] bg-card border border-slate-100 dark:border-zinc-800/80 rounded-2xl p-10">
              <SlidersHorizontal size={48} className="text-slate-300 mb-4" />
              <h3 className="text-md font-bold text-slate-700 dark:text-zinc-300 mb-1">No products found</h3>
              <p className="text-xs text-slate-400 max-w-xs text-center font-medium">
                We couldn&apos;t find any products matching your filters. Try clearing some selections or search queries.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
