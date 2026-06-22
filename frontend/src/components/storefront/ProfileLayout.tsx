"use client";
 
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, MapPin, ClipboardList } from "lucide-react";
 
interface ProfileLayoutProps {
  children: React.ReactNode;
}
 
export function ProfileLayout({ children }: ProfileLayoutProps) {
  const pathname = usePathname();
 
  const menuItems = [
    {
      label: "My Profile",
      href: "/profile",
      icon: User,
      active: pathname === "/profile"
    },
    {
      label: "My Addresses",
      href: "/profile/addresses",
      icon: MapPin,
      active: pathname === "/profile/addresses"
    },
    {
      label: "My Orders",
      href: "/profile/orders",
      icon: ClipboardList,
      active: pathname.startsWith("/profile/orders")
    }
  ];
 
  return (
    <div className="max-w-7xl mx-auto py-4 text-left px-2 select-none">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-secondary tracking-tight mb-6">
        My Account
      </h1>
 
      {/* Top Navigation Tabs */}
      <div className="flex border-b border-slate-100 dark:border-zinc-800/80 gap-6 overflow-x-auto hide-scrollbar flex-nowrap mb-8 pt-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`pb-3.5 px-1 font-extrabold text-sm tracking-tight border-b-2 cursor-pointer transition-all flex items-center gap-2 ${
                item.active
                  ? "border-[#064e3b] text-[#064e3b]"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              <Icon size={16} className={item.active ? "text-[#064e3b]" : "text-slate-400"} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
 
      {/* Main Content Panel - Full Width */}
      <div className="w-full">
        {children}
      </div>
    </div>
  );
}
