"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  Home, 
  LayoutGrid, 
  Tag, 
  ShoppingBag, 
  Heart, 
  Truck, 
  Wallet, 
  Phone,
  Mail,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { name: "Home", href: "/", icon: Home },
  { name: "Categories", href: "/category", icon: LayoutGrid },
  { name: "Offers", href: "/offers", icon: Tag },
  { name: "My Orders", href: "/profile/orders", icon: ShoppingBag },
  { name: "Track Order", href: "/track", icon: Truck },
  { name: "Wallet", href: "/wallet", icon: Wallet },
];

export function LeftSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[240px] shrink-0 select-none h-full bg-white border-r border-slate-100 flex flex-col z-40 font-outfit">
      <div className="flex-1 flex flex-col justify-between py-[24px] pl-[24px] pr-[16px] overflow-y-auto hide-scrollbar">
        <nav className="flex flex-col gap-[6px]">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-[12px] px-[14px] py-[10px] rounded-[10px] font-bold text-xs transition-colors cursor-pointer group ${
                  isActive 
                    ? "bg-[#064e3b] text-white" 
                    : "text-slate-600 hover:bg-[#064e3b] hover:text-white"
                }`}
              >
                <link.icon size={16} className={`transition-colors ${isActive ? "text-white" : "text-slate-400 group-hover:text-white"}`} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
