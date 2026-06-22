import React from "react";
import { ProductSummary } from "@/types";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  products: ProductSummary[];
  className?: string;
}

export function ProductGrid({ products, className = "" }: ProductGridProps) {
  return (
    <div className={`grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 lg:gap-6 ${className}`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
