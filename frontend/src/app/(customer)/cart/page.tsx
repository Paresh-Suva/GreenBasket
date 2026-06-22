"use client";
 
import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { CartSummary } from "@/components/storefront/CartSummary";
import { QuantitySelector } from "@/components/storefront/QuantitySelector";
import { LoadingState } from "@/components/ui/loading-state";
import { Button } from "@/components/ui/button";
import { PriceTag } from "@/components/storefront/PriceTag";
import { useRouter } from "next/navigation";
import { getFullImageUrl } from "@/services/api";
import { toast } from "sonner";
 
export default function CartPage() {
  const { cart, fetchCart, updateQuantity, removeItem, isLoading } = useCartStore();
  const router = useRouter();
 
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);
 
  const handleQtyChange = async (itemId: number, newQty: number) => {
    if (newQty <= 0) {
      await removeItem(itemId);
    } else {
      await updateQuantity(itemId, newQty);
    }
  };
 
  const handleCheckout = () => {
    const items = cart?.items || [];
    const hasOutOfStock = items.some((item) => !item.inStock || item.quantity > item.availableStock);
 
    if (hasOutOfStock) {
      toast.error("Cannot proceed to checkout: Some items in your cart are out of stock.");
      return;
    }
 
    router.push("/checkout");
  };

  if (isLoading && !cart) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingState text="Opening your cart..." />
      </div>
    );
  }

  const items = cart?.items || [];
  const subtotal = cart?.subtotal || 0;

  return (
    <div className="max-w-7xl mx-auto py-4 text-left">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-secondary tracking-tight mb-8">
        Shopping Cart ({items.length})
      </h1>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Cart Items List */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {items.map((item) => (
              <div
                key={item.itemId}
                className="flex items-center gap-4 bg-card border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow duration-300 relative"
              >
                {/* Product Image */}
                <div className="relative w-20 h-20 bg-slate-50 border border-slate-100 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                  <Image
                    src={getFullImageUrl(item.productImageUrl)}
                    alt={item.productName}
                    fill
                    className="object-contain p-1"
                    sizes="80px"
                  />
                </div>
 
                {/* Details */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-800 text-sm sm:text-base line-clamp-1">
                        {item.productName}
                      </h3>
                      {(!item.inStock || item.quantity > item.availableStock) && (
                        <span className="bg-rose-50 text-rose-500 border border-rose-100 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wide shrink-0">
                          Out of Stock
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      SKU: {item.productSku}
                    </span>
                    <PriceTag
                      price={item.unitPrice}
                      discountPrice={item.discountPrice}
                      priceClassName="text-sm sm:text-base"
                    />
                  </div>

                  {/* Quantity and Line Total */}
                  <div className="flex items-center justify-between sm:justify-end gap-6">
                    <QuantitySelector
                      quantity={item.quantity}
                      max={Math.min(item.availableStock, 99)}
                      onChange={(val) => handleQtyChange(item.itemId, val)}
                      size="sm"
                      className="w-24 border-slate-200"
                    />
                    
                    <div className="flex flex-col text-right shrink-0">
                      <span className="text-xs text-slate-400 font-semibold uppercase leading-none">
                        Total
                      </span>
                      <span className="text-sm sm:text-base font-bold text-slate-800 mt-1">
                        {new Intl.NumberFormat("en-IN", {
                          style: "currency",
                          currency: "INR"
                        }).format(item.lineTotal)}
                      </span>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.itemId)}
                      className="w-9 h-9 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full cursor-pointer hidden sm:flex"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>

                {/* Mobile Trash Action */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(item.itemId)}
                  className="w-8 h-8 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full cursor-pointer absolute top-2 right-2 sm:hidden"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            ))}
          </div>

          {/* Cart Summary Panel */}
          <div className="lg:col-span-1">
            <CartSummary subtotal={subtotal} onCheckout={handleCheckout} />
          </div>

        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-card border border-slate-100 rounded-3xl p-10 text-center shadow-sm">
          <div className="relative w-36 h-36 mb-6">
            <Image
              src="/images/Bag.png"
              alt="Empty Shopping Bag"
              fill
              className="object-contain"
            />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">Your cart is empty</h3>
          <p className="text-sm text-slate-500 max-w-sm mb-6">
            {"Looks like you haven't added anything to your cart yet. Head back to the store and find some fresh organic groceries!"}
          </p>
          <Link href="/products">
            <Button className="bg-primary hover:bg-primary/95 text-white font-bold px-6 rounded-full cursor-pointer h-10 flex items-center gap-1.5 shadow-sm">
              <ShoppingBag size={16} />
              <span>Start Shopping</span>
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
