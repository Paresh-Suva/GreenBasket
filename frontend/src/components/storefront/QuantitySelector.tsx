"use client";

import React from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuantitySelectorProps {
  quantity: number;
  max?: number;
  onChange: (value: number) => void;
  className?: string;
  size?: "sm" | "default";
  variant?: "default" | "green";
}

export function QuantitySelector({
  quantity,
  max = 99,
  onChange,
  className = "",
  size = "default",
  variant = "default"
}: QuantitySelectorProps) {
  const handleDecrement = () => {
    if (quantity > 0) {
      onChange(quantity - 1);
    }
  };

  const handleIncrement = () => {
    if (quantity < max) {
      onChange(quantity + 1);
    }
  };

  const isSm = size === "sm";
  const isGreen = variant === "green";

  const containerClasses = isGreen
    ? `flex items-center bg-[#064e3b] text-white rounded-lg overflow-hidden border border-[#064e3b] ${className}`
    : `flex items-center border border-input bg-card rounded-lg overflow-hidden ${className}`;

  const btnClasses = isGreen
    ? `${isSm ? "w-8 h-8" : "w-10 h-10"} rounded-none hover:bg-white/10 text-white disabled:opacity-40 flex items-center justify-center cursor-pointer`
    : `${isSm ? "w-8 h-8" : "w-10 h-10"} rounded-none hover:bg-muted text-foreground flex items-center justify-center cursor-pointer`;

  const spanClasses = isGreen
    ? `flex-1 text-center font-extrabold text-sm select-none text-white ${isSm ? "w-8" : "w-10"}`
    : `flex-1 text-center font-semibold text-sm select-none ${isSm ? "w-8" : "w-10"}`;

  return (
    <div className={containerClasses}>
      <Button
        variant="ghost"
        type="button"
        size="icon"
        onClick={handleDecrement}
        className={btnClasses}
      >
        <Minus size={isSm ? 14 : 16} />
      </Button>
      <span className={spanClasses}>
        {quantity}
      </span>
      <Button
        variant="ghost"
        type="button"
        size="icon"
        onClick={handleIncrement}
        disabled={quantity >= max}
        className={btnClasses}
      >
        <Plus size={isSm ? 14 : 16} />
      </Button>
    </div>
  );
}
