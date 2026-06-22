import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ProductSummary } from "@/types";
import { AddToCartButton } from "./AddToCartButton";
import { getFullImageUrl } from "@/services/api";

const getProductAmount = (name: string, categoryName: string) => {
  const lowercaseName = name.toLowerCase();
  const cat = categoryName ? categoryName.toLowerCase() : "";

  // 1. Specific exceptions / items
  if (lowercaseName.includes("broccoli")) return "500 GRAM";
  if (lowercaseName.includes("spinach")) return "250 GRAM";
  if (lowercaseName.includes("cauliflower") || lowercaseName.includes("lettuce") || lowercaseName.includes("watermelon") || lowercaseName.includes("pineapple")) return "1 PIECE";
  if (lowercaseName.includes("ginger") || lowercaseName.includes("garlic")) return "250 GRAM";
  if (lowercaseName.includes("chili") || lowercaseName.includes("chilli")) return "100 GRAM";
  if (lowercaseName.includes("coriander") || lowercaseName.includes("mint")) return "1 PACK";
  if (lowercaseName.includes("basil") || lowercaseName.includes("lemongrass") || lowercaseName.includes("rosemary")) return "50 GRAM";
  
  // Eggs
  if (lowercaseName.includes("12pc") || lowercaseName.includes("12 pc")) return "12 PIECE";
  if (lowercaseName.includes("6pc") || lowercaseName.includes("6 pc") || lowercaseName.includes("eggs")) return "6 PIECE";

  // Fruits
  if (lowercaseName.includes("banana")) return "1 DOZEN";
  if (lowercaseName.includes("blueberry")) return "125 GRAM";
  if (lowercaseName.includes("strawberry")) return "200 GRAM";

  // Dairy/Milk/Beverages
  if (lowercaseName.includes("coconut milk")) return "400 MILLILITER";
  if (lowercaseName.includes("sour cream") || lowercaseName.includes("whipping cream")) return "250 MILLILITER";
  if (lowercaseName.includes("cooking cream") || lowercaseName.includes("low fat fresh cream")) return "200 MILLILITER";
  if (lowercaseName.includes("lassi") || lowercaseName.includes("buttermilk")) return "250 MILLILITER";
  if (lowercaseName.includes("milk") || lowercaseName.includes("ghee")) return "1 LITER";

  // Cheese
  if (lowercaseName.includes("paneer") || lowercaseName.includes("mozzarella") || lowercaseName.includes("cheddar") || lowercaseName.includes("feta")) return "200 GRAM";
  if (lowercaseName.includes("parmesan")) return "100 GRAM";
  if (lowercaseName.includes("spread") || lowercaseName.includes("gouda")) return "150 GRAM";
  if (lowercaseName.includes("blue cheese")) return "100 GRAM";
  if (lowercaseName.includes("pizza cheese")) return "250 GRAM";

  // Butter
  if (lowercaseName.includes("salted butter") || lowercaseName.includes("unsalted butter") || lowercaseName.includes("table butter") || lowercaseName.includes("olive oil")) return "200 GRAM";
  if (lowercaseName.includes("garlic butter")) return "100 GRAM";

  // Yogurt/Curd
  if (lowercaseName.includes("curd cup") || lowercaseName.includes("greek yogurt")) return "400 GRAM";
  if (lowercaseName.includes("flavored yogurt") || lowercaseName.includes("yogurt")) return "150 GRAM";
  if (lowercaseName.includes("curd pouch")) return "500 GRAM";

  // 2. Default by Category
  if (cat.includes("veg") || cat.includes("fruit") || cat.includes("herb")) return "1 KG";

  return "1 KG";
};

export const getProductImage = (name: string, categoryName: string, primaryImageUrl?: string | null) => {
  if (primaryImageUrl && (primaryImageUrl.startsWith("/uploads") || primaryImageUrl.startsWith("http"))) {
    return getFullImageUrl(primaryImageUrl);
  }

  const lowercaseName = name.toLowerCase();
  
  // Custom prefix ones first
  if (lowercaseName.includes("strawberry")) return "/images/prod-strawberry.png";
  if (lowercaseName.includes("banana")) return "/images/prod-banana.png";
  if (lowercaseName.includes("apple")) return "/images/prod-apple.png";
  if (lowercaseName.includes("tomato")) return "/images/prod-tomato.png";
  if (lowercaseName.includes("onion")) return "/images/prod-onion.png";
  if (lowercaseName.includes("pineapple")) return "/images/prod-pineapple.png";
  
  // Standard illustrations
  if (lowercaseName.includes("avocado")) return "/images/Avocado.png";
  if (lowercaseName.includes("blueberry")) return "/images/Blueberry.png";
  if (lowercaseName.includes("broccoli")) return "/images/Broccoli.png";
  if (lowercaseName.includes("butter")) return "/images/Butter.png";
  if (lowercaseName.includes("cabbage")) return "/images/Cabbage.png";
  if (lowercaseName.includes("carrot")) return "/images/Carrot.png";
  if (lowercaseName.includes("cauliflower")) return "/images/Cauliflower.png";
  if (lowercaseName.includes("cheese")) return "/images/Cheese.png";
  if (lowercaseName.includes("cherry")) return "/images/Cherry.png";
  if (lowercaseName.includes("chili")) return "/images/Chili Pepper.png";
  if (lowercaseName.includes("cottage")) return "/images/Cottage Cheese.png";
  if (lowercaseName.includes("cucumber")) return "/images/Cucumber.png";
  if (lowercaseName.includes("egg")) return "/images/Eggs.png";
  if (lowercaseName.includes("garlic")) return "/images/Garlic.png";
  if (lowercaseName.includes("ginger")) return "/images/Ginger.png";
  if (lowercaseName.includes("grape")) return "/images/Grapes.png";
  if (lowercaseName.includes("kiwi")) return "/images/Kiwi.png";
  if (lowercaseName.includes("lemon")) return "/images/Lemon.png";
  if (lowercaseName.includes("lettuce")) return "/images/Lettuce.png";
  if (lowercaseName.includes("mango")) return "/images/Mango.png";
  if (lowercaseName.includes("milk")) return "/images/Milk.png";
  if (lowercaseName.includes("mushroom")) return "/images/Mushroom.png";
  if (lowercaseName.includes("orange")) return "/images/Orange.png";
  if (lowercaseName.includes("paneer")) return "/images/Paneer.png";
  if (lowercaseName.includes("peach")) return "/images/Peach.png";
  if (lowercaseName.includes("pomegranate")) return "/images/Pomegranate.png";
  if (lowercaseName.includes("potato")) return "/images/Potato.png";
  if (lowercaseName.includes("sour cream")) return "/images/Sour Cream.png";
  if (lowercaseName.includes("spinach")) return "/images/Spinach.png";
  if (lowercaseName.includes("watermelon")) return "/images/Watermelon.png";
  if (lowercaseName.includes("yogurt")) return "/images/Yogurt.png";
  
  return getFullImageUrl(primaryImageUrl || "/images/placeholder.jpg");
};

interface ProductCardProps {
  product: ProductSummary;
  className?: string;
  variant?: "shelf" | "category";
}

export function ProductCard({ product, className = "", variant = "shelf" }: ProductCardProps) {
  const {
    id,
    name,
    slug,
    price,
    discountPrice,
    inStock,
    primaryImageUrl,
    categoryName
  } = product;

  const hasDiscount = discountPrice !== undefined && discountPrice !== null && discountPrice > 0;
  const discountAmount = hasDiscount ? price - discountPrice : 0;
  const discountPercent = hasDiscount ? Math.round((discountAmount / price) * 100) : 0;

  const imageUrl = getProductImage(name, categoryName, primaryImageUrl);

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2
    }).format(val);
  };

  const activePrice = hasDiscount && discountPrice ? discountPrice : price;
  const isCategory = variant === "category";

  if (isCategory) {
    return (
      <div
        className={`group relative flex flex-col justify-between overflow-hidden rounded-[16px] bg-white border-2 border-slate-800 p-[12px] h-[295px] transition-all duration-500 ease-out hover:border-[#064e3b] hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1.5 hover:z-10 ${className || "w-full"}`}
      >
        {/* Product Image */}
        <Link href={`/products/${slug}`} className="block relative w-full h-[140px] mt-2 mb-1 overflow-hidden cursor-pointer select-none">
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(max-w-xs) 100vw, 150px"
            className="object-contain transition-all duration-700 ease-out group-hover:scale-110 group-hover:rotate-1"
          />
        </Link>

        {/* Product Info */}
        <div className="flex-1 flex flex-col justify-end text-left gap-1 mt-1">
          <div className="flex items-center justify-between text-[9px] font-extrabold uppercase tracking-wider mb-0.5">
            <span className="text-slate-400">{categoryName}</span>
            <span className={inStock ? "text-[#064e3b]" : "text-red-500"}>
              {inStock ? "In Stock" : "Out of Stock"}
            </span>
          </div>

          <Link href={`/products/${slug}`} className="block cursor-pointer">
            <h3 className="text-sm font-extrabold text-slate-800 line-clamp-1 group-hover:text-[#064e3b] transition-colors leading-snug">
              {name} ({getProductAmount(name, categoryName)})
            </h3>
          </Link>
          
          <div className="flex items-baseline mt-1 mb-1">
            <span className="text-[13px] font-extrabold text-slate-800 leading-none">
              {formatPrice(activePrice)}
            </span>
          </div>
          
          {/* Full-width Add Button */}
          <div className="w-full mt-1.5">
             <AddToCartButton
               productId={id}
               stockQuantity={inStock ? 50 : 0}
               className="w-full h-8.5 rounded-[8px] bg-[#064e3b] hover:bg-[#064e3b]/90 text-white font-extrabold text-[11px] transition-all duration-300"
               size="sm"
               iconOnly={false}
               label="Add to Cart"
             />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group relative flex flex-col justify-between overflow-hidden rounded-[16px] bg-white border-2 border-slate-800 p-[12px] h-[295px] transition-all duration-500 ease-out hover:border-[#064e3b] hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1.5 hover:z-10 ${className || "w-full"}`}
    >
      {/* Product Image */}
      <Link href={`/products/${slug}`} className="block relative w-full h-[140px] mt-2 mb-1 overflow-hidden cursor-pointer select-none">
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes="(max-w-xs) 100vw, 150px"
          className="object-contain transition-all duration-700 ease-out group-hover:scale-110 group-hover:rotate-1"
        />
      </Link>

      {/* Product Info */}
      <div className="flex-1 flex flex-col justify-end text-left gap-1 mt-1">
        <div className="flex items-center justify-between text-[9px] font-extrabold uppercase tracking-wider mb-0.5">
          <span className="text-slate-400">{categoryName}</span>
          <span className={inStock ? "text-[#064e3b]" : "text-red-500"}>
            {inStock ? "In Stock" : "Out of Stock"}
          </span>
        </div>

        <Link href={`/products/${slug}`} className="block cursor-pointer">
          <h3 className="text-[13px] font-extrabold text-slate-800 line-clamp-1 group-hover:text-[#064e3b] transition-colors leading-snug">
            {name} ({getProductAmount(name, categoryName)})
          </h3>
        </Link>
        
        {/* Price Row */}
        <div className="flex items-baseline mt-1 mb-1">
          <span className="text-sm font-extrabold text-slate-800 leading-none">
            {formatPrice(activePrice)}
          </span>
        </div>
        
        {/* Full-width Add Button */}
        <div className="w-full mt-1.5">
           <AddToCartButton
             productId={id}
             stockQuantity={inStock ? 50 : 0}
             className="w-full h-8.5 rounded-[8px] bg-[#064e3b] hover:bg-[#064e3b]/90 text-white font-extrabold text-[11px] transition-all duration-300"
             size="sm"
             iconOnly={false}
             label="Add to Cart"
           />
        </div>
      </div>
    </div>
  );
}

