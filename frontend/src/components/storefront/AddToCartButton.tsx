"use client";

import React from "react";
import { ShoppingBag, Plus } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { QuantitySelector } from "./QuantitySelector";
import { toast } from "sonner";

interface AddToCartButtonProps {
  productId: number;
  stockQuantity: number;
  className?: string;
  size?: "sm" | "default";
  iconOnly?: boolean;
  label?: string;
}

export function AddToCartButton({
  productId,
  stockQuantity,
  className = "",
  size = "default",
  iconOnly = false,
  label
}: AddToCartButtonProps) {
  const { cart, addItem, updateQuantity, removeItem, isLoading } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const cartItem = cart?.items.find((item) => item.productId === productId);
  const isOutOfStock = stockQuantity <= 0;

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Please login to add items to your cart");
      return;
    }

    await addItem(productId, 1);
  };

  const handleQtyChange = async (newQty: number) => {
    if (!cartItem) return;
    if (newQty <= 0) {
      await removeItem(cartItem.itemId);
    } else {
      await updateQuantity(cartItem.itemId, newQty);
    }
  };

  if (isOutOfStock) {
    return (
      <Button
        disabled
        className={`w-full bg-slate-200 text-slate-400 border border-slate-200 font-semibold cursor-not-allowed ${className}`}
      >
        {iconOnly ? "X" : "Out of Stock"}
      </Button>
    );
  }

  if (cartItem) {
    if (iconOnly) {
      // If it's icon only, show a tiny circle with the quantity
      return (
        <div className={`bg-[#064e3b] text-white font-bold flex items-center justify-center w-7 h-7 rounded-full text-xs ${className}`}>
           {cartItem.quantity}
        </div>
      );
    }
    return (
      <QuantitySelector
        quantity={cartItem.quantity}
        max={Math.min(stockQuantity, 99)}
        onChange={handleQtyChange}
        size={size === "sm" ? "sm" : "default"}
        variant="green"
        className={`w-full ${className}`}
      />
    );
  }

  return (
    <Button
      type="button"
      onClick={handleAdd}
      disabled={isLoading}
      className={`flex items-center justify-center gap-2 bg-[#064e3b] hover:bg-[#064e3b]/90 text-white font-semibold shadow-sm transition-all cursor-pointer rounded-full ${
        size === "sm" ? "h-7 w-7 p-0" : "h-10"
      } ${!iconOnly && size === "sm" ? "text-xs" : ""} ${!iconOnly && size === "default" ? "text-sm" : ""} ${
        !iconOnly ? "w-full" : ""
      } ${className}`}
    >
      {iconOnly ? (
        <Plus size={14} className="stroke-[3px]" />
      ) : label ? null : (
        <ShoppingBag size={size === "sm" ? 14 : 16} />
      )}
      {!iconOnly && (label || "Add to Basket")}
    </Button>
  );
}
