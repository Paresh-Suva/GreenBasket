"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Heart, ShoppingBag, LogOut, User as UserIcon, Settings, ChevronDown, MapPin } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useCartStore } from "@/store/useCartStore";
import { authService } from "@/services/auth.service";
import { SearchBar } from "./SearchBar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export function Header() {
  const router = useRouter();
  const { user, isAuthenticated, logout: clearAuth } = useAuthStore();
  const { cart } = useCartStore();

  const cartCount = cart?.totalQuantity || 0;
  const cartTotal = cart?.subtotal || 0;

  const handleLogout = async () => {
    try {
      await authService.logout();
      clearAuth();
      toast.success("Logged out successfully");
      router.push("/");
    } catch {
      clearAuth();
      router.push("/");
    }
  };

  return (
    <header className="w-full h-[90px] bg-white border-b border-slate-100 flex items-center justify-center shrink-0 sticky top-0 z-50">
      <div className="w-full px-[24px] h-full flex items-center justify-between gap-[26px]">
        
        {/* 1. Logo & Brand (240px x 70px) */}
        <div className="w-[240px] h-[70px] flex items-center gap-[8px] shrink-0">
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <div className="relative w-9 h-9">
              <Image
                src="/images/Logo.png"
                alt="GreenBasket Logo"
                width={36}
                height={36}
                className="object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-[#064e3b] leading-none">
                GreenBasket
              </span>
              <span className="text-[9px] text-slate-500 mt-1 font-medium">
                Fresh Groceries, Delivered
              </span>
            </div>
          </Link>
        </div>

        {/* 2. Search Bar (responsive flex) */}
        <div className="flex-1 max-w-[680px] h-[50px]">
          <SearchBar className="w-full h-full" />
        </div>

        {/* 3. User Profile & Cart */}
        <div className="h-[50px] flex items-center justify-end gap-[16px] shrink-0">

          {/* User Profile */}
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 focus:outline-none cursor-pointer hover:bg-slate-50 px-2 py-1 rounded-full transition-colors">
                <div className="w-8 h-8 rounded-full bg-[#edf7ef] border border-[#064e3b]/10 flex items-center justify-center text-[#064e3b] font-bold text-sm overflow-hidden">
                  {user.profileImageUrl ? (
                    <Image
                      src={user.profileImageUrl}
                      alt={user.firstName}
                      width={32}
                      height={32}
                      className="object-cover"
                    />
                  ) : (
                    <span>{user.firstName[0]}</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-semibold text-slate-800">
                    Hi, {user.firstName}
                  </span>
                  <ChevronDown size={14} className="text-slate-400" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2 rounded-[12px]">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-semibold text-slate-800">
                    My Account
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer py-2 px-3 focus:bg-[#064e3b] focus:text-white hover:bg-[#064e3b] hover:text-white group" onClick={() => router.push("/profile")}>
                    <UserIcon size={16} className="mr-2 text-slate-500 group-focus:text-white group-hover:text-white transition-colors" />
                    <span className="font-medium">My Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer py-2 px-3 focus:bg-[#064e3b] focus:text-white hover:bg-[#064e3b] hover:text-white group" onClick={() => router.push("/profile/orders")}>
                    <ShoppingBag size={16} className="mr-2 text-slate-500 group-focus:text-white group-hover:text-white transition-colors" />
                    <span className="font-medium">My Orders</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer py-2 px-3 focus:bg-[#064e3b] focus:text-white hover:bg-[#064e3b] hover:text-white group" onClick={() => router.push("/profile/addresses")}>
                    <MapPin size={16} className="mr-2 text-slate-500 group-focus:text-white group-hover:text-white transition-colors" />
                    <span className="font-medium">Addresses</span>
                  </DropdownMenuItem>
                  {user.roles?.some(r => r === "ADMIN" || r === "SUPER_ADMIN" || r === "STAFF") && (
                    <DropdownMenuItem className="cursor-pointer py-2 px-3 focus:bg-[#064e3b] focus:text-white hover:bg-[#064e3b] hover:text-white group" onClick={() => router.push("/admin")}>
                      <Settings size={16} className="mr-2 text-[#064e3b] group-focus:text-white group-hover:text-white transition-colors" />
                      <span className="font-bold text-[#064e3b] group-focus:text-white group-hover:text-white">
                        {user.roles.includes("STAFF") ? "Staff Dashboard" : "Admin Dashboard"}
                      </span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer py-2 px-3 focus:bg-red-600 focus:text-white hover:bg-red-600 hover:text-white group text-red-500">
                  <LogOut size={16} className="mr-2 text-red-500 group-focus:text-white group-hover:text-white transition-colors" />
                  <span className="font-medium">Log Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1.5 focus:outline-none cursor-pointer hover:bg-slate-50 px-3 py-1.5 rounded-full transition-colors font-outfit">
                <span className="text-sm font-semibold text-slate-800">
                  Hi, user
                </span>
                <ChevronDown size={14} className="text-slate-400" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="p-3 w-48 mt-2 rounded-[12px]">
                <DropdownMenuItem
                  onClick={() => router.push("/login")}
                  className="w-full bg-[#064e3b] hover:bg-[#064e3b]/90 text-white font-semibold font-outfit rounded-[8px] py-2 cursor-pointer shadow-none flex justify-center items-center focus:bg-[#064e3b]/95 focus:text-white"
                >
                  Log In
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Dashboard Button for Staff / Admin */}
          {isAuthenticated && user && user.roles?.some(r => r === "ADMIN" || r === "SUPER_ADMIN" || r === "STAFF") && (
            <Button
              onClick={() => router.push("/admin")}
              className="bg-white hover:bg-slate-50 text-[#064e3b] border border-slate-200 rounded-[12px] h-[50px] px-4 font-bold text-sm flex items-center gap-2 cursor-pointer shadow-none shrink-0"
            >
              <Settings size={18} />
              <span>{user.roles.includes("STAFF") ? "Staff Panel" : "Admin Panel"}</span>
            </Button>
          )}

          {/* Cart Button (Always visible on desktop in User/Profile Area) */}
          <Link href="/cart">
            <Button
              className="bg-[#064e3b] hover:bg-[#064e3b]/90 text-white rounded-[12px] h-[50px] px-4 flex items-center gap-2 cursor-pointer shadow-none shrink-0"
            >
              <div className="relative">
                <ShoppingBag size={18} />
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-white">
                  {cartCount}
                </span>
              </div>
              <div className="flex flex-col items-start text-left">
                <span className="text-[10px] leading-none text-white/80">
                  {cartCount > 0 ? "My Cart" : "Add to Cart"}
                </span>
                <span className="text-sm font-bold leading-none mt-0.5">
                  {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(cartTotal)}
                </span>
              </div>
            </Button>
          </Link>

        </div>
      </div>
    </header>
  );
}

