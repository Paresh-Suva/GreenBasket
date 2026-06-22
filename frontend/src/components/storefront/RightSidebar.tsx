"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Minus, Trash2, Clock, MapPin } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

export function RightSidebar() {
  const { cart, updateQuantity, removeItem } = useCartStore();

  const cartItems = cart?.items || [];
  const subtotal = cart?.subtotal || 0;
  const deliveryFee = subtotal > 0 ? 2.50 : 0;
  const discount = subtotal > 0 ? 3.20 : 0; // Static for demo matching spec image
  const total = Math.max(0, subtotal + deliveryFee - discount);

  // Default values for empty demo state to match speculative design
  const displayCount = cart?.totalQuantity || 4;
  const displaySubtotal = subtotal > 0 ? subtotal : 18.45;
  const displayTotal = total > 0 ? total : 17.75;
  const displayDiscount = subtotal > 0 ? discount : 3.20;
  const displayDeliveryFee = subtotal > 0 ? deliveryFee : 2.50;

  return (
    <aside className="w-[350px] shrink-0 flex flex-col gap-[20px] bg-transparent border-0 p-0 z-40 select-none h-auto">

      {/* 1. Cart Sidebar Card (350px x 560px) */}
      <div className="w-[350px] h-[560px] bg-white rounded-[16px] border border-slate-100 p-[20px] flex flex-col justify-between shrink-0 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="font-extrabold text-sm text-slate-800">
            My Cart <span className="text-slate-400 font-bold">({displayCount})</span>
          </h2>
          <Link href="/cart" className="text-xs font-bold text-[#064e3b] hover:underline cursor-pointer">
            View Cart
          </Link>
        </div>

        {/* Cart Items Area */}
        <div className="flex-1 overflow-y-auto py-2.5 flex flex-col gap-[14px] hide-scrollbar pr-0.5">
          {cartItems.length === 0 ? (
            // Static/placeholder demo items matching the spec image when cart is empty
            <div className="flex flex-col gap-[14px]">
              {/* Item 1 */}
              <div className="flex items-center justify-between gap-2.5 py-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-[12px] relative flex items-center justify-center shrink-0">
                    <span className="text-2xl">🍓</span>
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-xs text-slate-800 leading-tight">Fresh Strawberry</span>
                    <span className="text-[10px] text-slate-400 font-semibold mt-0.5">1 lb</span>
                    <span className="font-extrabold text-xs text-slate-800 mt-1">₹2.55 <span className="text-[10px] font-semibold text-slate-400 line-through ml-1">₹3.00</span></span>
                  </div>
                </div>
                <div className="flex items-center bg-slate-50 border border-slate-100 rounded-full p-0.5">
                  <button className="w-[22px] h-[22px] flex items-center justify-center text-slate-400 text-xs font-bold">-</button>
                  <span className="text-[11px] font-extrabold w-4 text-center text-slate-800">1</span>
                  <button className="w-[22px] h-[22px] flex items-center justify-center text-[#064e3b] text-xs font-bold">+</button>
                </div>
              </div>

              {/* Item 2 */}
              <div className="flex items-center justify-between gap-2.5 py-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-[12px] relative flex items-center justify-center shrink-0">
                    <span className="text-2xl">🍌</span>
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-xs text-slate-800 leading-tight">Banana</span>
                    <span className="text-[10px] text-slate-400 font-semibold mt-0.5">1 lb</span>
                    <span className="font-extrabold text-xs text-slate-800 mt-1">₹3.15 <span className="text-[10px] font-semibold text-slate-400 line-through ml-1">₹4.00</span></span>
                  </div>
                </div>
                <div className="flex items-center bg-slate-50 border border-slate-100 rounded-full p-0.5">
                  <button className="w-[22px] h-[22px] flex items-center justify-center text-slate-400 text-xs font-bold">-</button>
                  <span className="text-[11px] font-extrabold w-4 text-center text-slate-800">1</span>
                  <button className="w-[22px] h-[22px] flex items-center justify-center text-[#064e3b] text-xs font-bold">+</button>
                </div>
              </div>

              {/* Item 3 */}
              <div className="flex items-center justify-between gap-2.5 py-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-[12px] relative flex items-center justify-center shrink-0">
                    <span className="text-2xl">🍏</span>
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-xs text-slate-800 leading-tight">Green Apple</span>
                    <span className="text-[10px] text-slate-400 font-semibold mt-0.5">1 lb</span>
                    <span className="font-extrabold text-xs text-slate-800 mt-1">₹4.80 <span className="text-[10px] font-semibold text-slate-400 line-through ml-1">₹6.20</span></span>
                  </div>
                </div>
                <div className="flex items-center bg-slate-50 border border-slate-100 rounded-full p-0.5">
                  <button className="w-[22px] h-[22px] flex items-center justify-center text-slate-400 text-xs font-bold">-</button>
                  <span className="text-[11px] font-extrabold w-4 text-center text-slate-800">1</span>
                  <button className="w-[22px] h-[22px] flex items-center justify-center text-[#064e3b] text-xs font-bold">+</button>
                </div>
              </div>

              {/* Item 4 */}
              <div className="flex items-center justify-between gap-2.5 py-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-[12px] relative flex items-center justify-center shrink-0">
                    <span className="text-2xl">🍅</span>
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-xs text-slate-800 leading-tight">Fresh Tomato</span>
                    <span className="text-[10px] text-slate-400 font-semibold mt-0.5">1 lb</span>
                    <span className="font-extrabold text-xs text-slate-800 mt-1">₹3.15 <span className="text-[10px] font-semibold text-slate-400 line-through ml-1">₹4.50</span></span>
                  </div>
                </div>
                <div className="flex items-center bg-slate-50 border border-slate-100 rounded-full p-0.5">
                  <button className="w-[22px] h-[22px] flex items-center justify-center text-slate-400 text-xs font-bold">-</button>
                  <span className="text-[11px] font-extrabold w-4 text-center text-slate-800">1</span>
                  <button className="w-[22px] h-[22px] flex items-center justify-center text-[#064e3b] text-xs font-bold">+</button>
                </div>
              </div>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.itemId} className="flex items-center justify-between gap-2.5 py-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-[12px] relative overflow-hidden shrink-0">
                    <Image
                      src={item.productName.toLowerCase().includes("strawberry") ? "/images/placeholder.jpg" : "/images/placeholder.jpg"}
                      alt={item.productName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-xs text-slate-800 leading-tight">{item.productName}</span>
                    <span className="text-[10px] text-slate-400 font-semibold mt-0.5">1 lb</span>
                    <span className="font-extrabold text-xs text-slate-800 mt-1">
                      {formatCurrency(item.unitPrice)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center bg-slate-50 border border-slate-100 rounded-full p-0.5">
                  <button
                    onClick={() => updateQuantity(item.itemId, item.quantity - 1)}
                    className="w-[22px] h-[22px] flex items-center justify-center text-slate-400 text-xs font-bold cursor-pointer hover:text-[#064e3b]"
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span className="text-[11px] font-extrabold w-4 text-center text-slate-800">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.itemId, item.quantity + 1)}
                    className="w-[22px] h-[22px] flex items-center justify-center text-[#064e3b] text-xs font-bold cursor-pointer hover:scale-105"
                  >
                    +
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary & Proceed */}
        <div className="pt-3 border-t border-slate-100 flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs font-bold text-slate-400">
              <span>Cart Subtotal</span>
              <span className="text-slate-800">{formatCurrency(displaySubtotal)}</span>
            </div>
            <div className="flex justify-between text-xs font-bold text-slate-400">
              <span className="flex items-center gap-1">Delivery Fee <span className="text-[9px] bg-slate-100 text-slate-400 w-3.5 h-3.5 rounded-full flex items-center justify-center cursor-help">i</span></span>
              <span className="text-slate-800">{formatCurrency(displayDeliveryFee)}</span>
            </div>
            <div className="flex justify-between text-xs font-bold text-slate-400">
              <span>Discount</span>
              <span className="text-red-500">-{formatCurrency(displayDiscount)}</span>
            </div>
            <div className="flex justify-between font-extrabold text-sm text-slate-800 pt-2 border-t border-slate-100 mt-1">
              <span>Total</span>
              <span>{formatCurrency(displayTotal)}</span>
            </div>
          </div>

          <Button className="w-full bg-[#064e3b] hover:bg-[#064e3b]/90 text-white rounded-[12px] font-extrabold text-xs h-[50px] flex justify-between px-5 cursor-pointer shadow-none">
            <span>Proceed to Checkout</span>
            <span className="text-sm">→</span>
          </Button>
        </div>
      </div>

      {/* 2. Promo/Discount Card (350px x 160px) */}
      <div className="w-[350px] h-[160px] bg-[#fcf8e3] rounded-[16px] border border-[#f5eed0] p-[20px] flex justify-between items-center shrink-0 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col items-start gap-1 text-left">
          <h4 className="font-extrabold text-slate-800 text-base leading-tight">Get 20% OFF</h4>
          <p className="text-xs text-slate-500 font-semibold">On your first order</p>
          <div className="mt-3 px-4 py-1.5 bg-white border border-dashed border-[#d4cfb1] rounded-[8px] text-[#8b8565] font-extrabold text-xs tracking-wider">
            GET20
          </div>
        </div>
        <div className="w-[100px] h-[100px] relative shrink-0">
          <Image
            src="/images/Bag.png"
            alt="Discount Promo Bag"
            width={100}
            height={100}
            className="object-contain"
          />
        </div>
      </div>

      {/* 3. Delivery Info Card (350px x 145px) */}
      <div className="w-[350px] h-[145px] bg-[#f6faf5] rounded-[16px] border border-[#e8f3e6] p-[20px] flex justify-between items-center shrink-0 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col items-start gap-1 text-left">
          <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Delivery in</p>
          <h4 className="font-extrabold text-slate-800 text-2xl leading-none my-1">30–45 mins</h4>
          <p className="text-[10px] text-slate-400 font-semibold">Fast and reliable delivery</p>
        </div>

        {/* Delivery Track Route Graphic */}
        <div className="w-[100px] h-[70px] relative shrink-0 opacity-80 flex items-center justify-center">
          <div className="absolute right-[50px] bottom-[15px] w-6 h-6 rounded-full bg-[#16a34a]/10 flex items-center justify-center">
            <MapPin size={14} className="text-[#16a34a]" />
          </div>
          <svg className="w-full h-full text-[#16a34a]/30 stroke-current stroke-2 fill-none" viewBox="0 0 100 70">
            <path d="M 10 50 C 30 50, 40 20, 60 20 C 80 20, 70 50, 90 50" strokeDasharray="3,3" />
            <circle cx="90" cy="50" r="12" className="fill-[#16a34a]/10 stroke-[#16a34a] stroke-1" />
          </svg>
          <div className="absolute right-[2px] top-[14px]">
            <Clock size={16} className="text-[#16a34a]" />
          </div>
        </div>
      </div>

    </aside>
  );
}
