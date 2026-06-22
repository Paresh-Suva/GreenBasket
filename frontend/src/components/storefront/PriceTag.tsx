import React from "react";

interface PriceTagProps {
  price: number;
  discountPrice?: number | null;
  className?: string;
  priceClassName?: string;
  originalPriceClassName?: string;
}

export function PriceTag({
  price,
  discountPrice,
  className = "",
  priceClassName = "",
  originalPriceClassName = ""
}: PriceTagProps) {
  const hasDiscount = discountPrice !== undefined && discountPrice !== null && discountPrice > 0;
  const activePrice = hasDiscount ? discountPrice : price;

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR"
    }).format(val);
  };

  return (
    <div className={`flex items-baseline gap-2 ${className}`}>
      <span className={`text-lg font-bold text-primary ${priceClassName}`}>
        {formatPrice(activePrice!)}
      </span>
      {hasDiscount && (
        <span className={`text-sm text-muted-foreground line-through ${originalPriceClassName}`}>
          {formatPrice(price)}
        </span>
      )}
    </div>
  );
}
