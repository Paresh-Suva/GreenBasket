"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layouts/MainLayout";
import { OfferBanner } from "@/components/storefront/OfferBanner";
import { ProductCard } from "@/components/storefront/ProductCard";
import { categoriesService } from "@/services/categories.service";
import { productsService } from "@/services/products.service";
import { LoadingState } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { getFullImageUrl } from "@/services/api";
import { Category } from "@/types";
import { Store, ShoppingCart, Info, Sparkles, FolderTree } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

export default function Home() {
  const router = useRouter();
  const { user } = useAuthStore();

  // 1. Fetch Active Categories
  const { data: categoriesRes, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ["active-categories"],
    queryFn: () => categoriesService.getAllActiveCategories()
  });

  const categories = categoriesRes?.data || [];

  // Find dynamic category IDs matching keywords to avoid hardcoding database ids
  const vegCategory = categories.find(c => c.name.toLowerCase().includes('veg'));
  const fruitCategory = categories.find(c => c.name.toLowerCase().includes('fruit'));
  
  // Try to find a third category (e.g. groceries, dairy, bakery) that is not veg or fruit
  const thirdCategory = categories.find(c => 
    c.id !== vegCategory?.id && 
    c.id !== fruitCategory?.id
  );

  // 2. Fetch Featured / Best Sellers Products
  const { data: featuredRes, isLoading: isFeaturedLoading } = useQuery({
    queryKey: ["products", "featured"],
    queryFn: () => productsService.getFeaturedProducts()
  });

  // 3. Fetch Vegetables shelf
  const { data: veggiesRes, isLoading: isVeggiesLoading } = useQuery({
    queryKey: ["products", "vegetables", vegCategory?.id],
    queryFn: () => productsService.getProducts({ categoryId: vegCategory?.id, size: 15 }),
    enabled: !!vegCategory?.id
  });

  // 4. Fetch Fruits shelf
  const { data: fruitsRes, isLoading: isFruitsLoading } = useQuery({
    queryKey: ["products", "fruits", fruitCategory?.id],
    queryFn: () => productsService.getProducts({ categoryId: fruitCategory?.id, size: 15 }),
    enabled: !!fruitCategory?.id
  });

  // 5. Fetch Third category shelf
  const { data: thirdCatRes, isLoading: isThirdCatLoading } = useQuery({
    queryKey: ["products", "third-shelf", thirdCategory?.id],
    queryFn: () => productsService.getProducts({ categoryId: thirdCategory?.id, size: 15 }),
    enabled: !!thirdCategory?.id
  });

  const featuredProducts = featuredRes?.data || [];
  const veggies = veggiesRes?.data?.content || [];
  const fruits = fruitsRes?.data?.content || [];
  const thirdShelfProducts = thirdCatRes?.data?.content || [];

  const isLoading =
    isCategoriesLoading ||
    isFeaturedLoading ||
    (!!vegCategory?.id && isVeggiesLoading) ||
    (!!fruitCategory?.id && isFruitsLoading) ||
    (!!thirdCategory?.id && isThirdCatLoading);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <LoadingState text="Loading GreenBasket storefront..." />
        </div>
      </MainLayout>
    );
  }

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

  const hasAccessToAdmin = user?.roles?.some(r => r === "ADMIN" || r === "SUPER_ADMIN");

  return (
    <MainLayout>
      <div className="flex gap-[29px] h-full overflow-hidden select-none pb-[24px]">
        {/* Center Main Content Area */}
        <div className="flex-1 max-w-[1250px] min-w-0 h-full overflow-y-auto flex flex-col gap-[20px] hide-scrollbar pr-0.5 pb-8">
          

          {/* 1. Categories Shortcuts */}
          {categories.length > 0 ? (
            <section className="w-full h-[160px] bg-white rounded-[16px] border border-dashed border-slate-200 p-[16px] flex items-center justify-between shrink-0 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-x-auto gap-4 hide-scrollbar">
              {categories.slice(0, 7).map((cat) => (
                <Link 
                  href={`/category/${cat.slug}`} 
                  key={cat.id} 
                  className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group w-[110px]"
                >
                  <div className="w-[96px] h-[96px] bg-slate-50 rounded-full border border-slate-100 flex items-center justify-center overflow-hidden group-hover:border-[#064e3b] group-hover:shadow-sm transition-all duration-300 relative p-1">
                    <img 
                      src={getCategoryImg(cat)} 
                      alt={cat.name} 
                      className="w-full h-full object-contain" 
                    />
                  </div>
                  <span className="text-[12px] font-extrabold text-slate-700 group-hover:text-[#064e3b] transition-colors text-center w-full truncate leading-none mt-1">
                    {cat.name}
                  </span>
                </Link>
              ))}
              
              <Link 
                href="/products" 
                className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group w-[110px]"
              >
                <div className="w-[96px] h-[96px] bg-slate-50 rounded-full border border-slate-100 flex items-center justify-center group-hover:border-[#064e3b] group-hover:shadow-sm transition-all duration-300">
                  <span className="text-[#064e3b] font-black text-[12px]">All Products</span>
                </div>
                <span className="text-[11px] font-extrabold text-transparent select-none mt-1">.</span>
              </Link>
            </section>
          ) : (
            <div className="w-full">
              <EmptyState
                icon={FolderTree}
                title="No Active Categories"
                description="Explore active categories once catalog is initialized."
                actionLabel={hasAccessToAdmin ? "Create Categories" : undefined}
                onAction={hasAccessToAdmin ? () => router.push("/admin/categories") : undefined}
              />
            </div>
          )}

          {/* Exclusive Offers Banner */}
          <OfferBanner />

          {/* 2. Best Selling Products Shelf */}
          {featuredProducts.length > 0 ? (
            <section className="w-full flex flex-col gap-4 mt-6">
              <div className="flex items-end justify-between border-b border-slate-100 pb-3">
                <div className="flex flex-col text-left">
                  <h2 className="text-lg font-black text-slate-800 leading-tight flex items-center gap-1.5">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <span>Best Selling Products</span>
                  </h2>
                  <p className="text-xs text-slate-400 font-semibold mt-1">Top picks highly recommended by our customers</p>
                </div>
                <Link href="/products?featured=true" className="text-xs font-extrabold text-[#064e3b] hover:underline">
                  View All
                </Link>
              </div>
              <div className="flex gap-[14px] w-full overflow-x-auto pt-3 pb-4 px-1 -mx-1 hide-scrollbar scroll-smooth">
                {featuredProducts.slice(0, 15).map((product) => (
                  <ProductCard key={product.id} product={product} className="shrink-0 w-[200px]" />
                ))}
              </div>
            </section>
          ) : (
            categories.length > 0 && (
              <div className="w-full">
                <EmptyState
                  icon={Store}
                  title="No Best Selling Products"
                  description="We haven't marked any best sellers yet. Check back soon!"
                  actionLabel={hasAccessToAdmin ? "Manage Inventory" : undefined}
                  onAction={hasAccessToAdmin ? () => router.push("/admin/products") : undefined}
                />
              </div>
            )
          )}

          {/* 3. Fresh Vegetables Shelf */}
          {vegCategory && veggies.length > 0 && (
            <section className="w-full flex flex-col gap-4 mt-6">
              <div className="flex items-end justify-between border-b border-slate-100 pb-3">
                <div className="flex flex-col text-left">
                  <h2 className="text-lg font-black text-slate-800 leading-tight">{vegCategory.name}</h2>
                  <p className="text-xs text-slate-400 font-semibold mt-1">Pre-washed and crisp greens</p>
                </div>
                <Link href={`/category/${vegCategory.slug}`} className="text-xs font-extrabold text-[#064e3b] hover:underline">
                  View All
                </Link>
              </div>
              <div className="flex gap-[14px] w-full overflow-x-auto pt-3 pb-4 px-1 -mx-1 hide-scrollbar scroll-smooth">
                {veggies.slice(0, 15).map((product) => (
                  <ProductCard key={product.id} product={product} className="shrink-0 w-[200px]" />
                ))}
              </div>
            </section>
          )}

          {/* 4. Fresh Fruits Shelf */}
          {fruitCategory && fruits.length > 0 && (
            <section className="w-full flex flex-col gap-4 mt-6">
              <div className="flex items-end justify-between border-b border-slate-100 pb-3">
                <div className="flex flex-col text-left">
                  <h2 className="text-lg font-black text-slate-800 leading-tight">{fruitCategory.name}</h2>
                  <p className="text-xs text-slate-400 font-semibold mt-1">Sweet, nutritious and hand-picked fruits</p>
                </div>
                <Link href={`/category/${fruitCategory.slug}`} className="text-xs font-extrabold text-[#064e3b] hover:underline">
                  View All
                </Link>
              </div>
              <div className="flex gap-[14px] w-full overflow-x-auto pt-3 pb-4 px-1 -mx-1 hide-scrollbar scroll-smooth">
                {fruits.slice(0, 15).map((product) => (
                  <ProductCard key={product.id} product={product} className="shrink-0 w-[200px]" />
                ))}
              </div>
            </section>
          )}

          {/* 5. Dynamic Third Shelf */}
          {thirdCategory && thirdShelfProducts.length > 0 && (
            <section className="w-full flex flex-col gap-4 mt-6">
              <div className="flex items-end justify-between border-b border-slate-100 pb-3">
                <div className="flex flex-col text-left">
                  <h2 className="text-lg font-black text-slate-800 leading-tight">{thirdCategory.name}</h2>
                  <p className="text-xs text-slate-400 font-semibold mt-1">Fresh goods from our catalog</p>
                </div>
                <Link href={`/category/${thirdCategory.slug}`} className="text-xs font-extrabold text-[#064e3b] hover:underline">
                  View All
                </Link>
              </div>
              <div className="flex gap-[14px] w-full overflow-x-auto pt-3 pb-4 px-1 -mx-1 hide-scrollbar scroll-smooth">
                {thirdShelfProducts.slice(0, 15).map((product) => (
                  <ProductCard key={product.id} product={product} className="shrink-0 w-[200px]" />
                ))}
              </div>
            </section>
          )}

          {/* Entire Store empty state fallback */}
          {categories.length === 0 && (
            <div className="w-full pt-8">
              <EmptyState
                icon={Store}
                title="Welcome to GreenBasket"
                description="Our online catalog is currently empty. Staff is actively migrating fresh products."
                actionLabel={hasAccessToAdmin ? "Go to Admin Dashboard" : undefined}
                onAction={hasAccessToAdmin ? () => router.push("/admin") : undefined}
              />
            </div>
          )}

        </div>
      </div>
    </MainLayout>
  );
}
