"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ordersService } from "@/services/orders.service";
import { ProfileLayout } from "@/components/storefront/ProfileLayout";
import { LoadingState } from "@/components/ui/loading-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClipboardList, Calendar, IndianRupee, ArrowRight, PackageOpen, Search } from "lucide-react";
import Link from "next/link";
 
type FilterStatus = "ALL" | "PENDING" | "CONFIRMED" | "DELIVERED" | "CANCELLED";
 
export default function UserOrdersPage() {
  const [filter, setFilter] = useState<FilterStatus>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
 
  // Fetch Orders
  const { data: ordersRes, isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: () => ordersService.getMyOrders()
  });
 
  const orders = ordersRes?.data || [];
 
  // Filter orders based on status tab and search text
  const filteredOrders = orders.filter((order) => {
    // 1. Status Filter
    let matchesStatus = false;
    if (filter === "ALL") matchesStatus = true;
    else if (filter === "PENDING") matchesStatus = order.status === "PENDING";
    else if (filter === "DELIVERED") matchesStatus = order.status === "DELIVERED";
    else if (filter === "CANCELLED") matchesStatus = order.status === "CANCELLED";
    else if (filter === "CONFIRMED") {
      matchesStatus = order.status === "CONFIRMED" || order.status === "PACKED" || order.status === "OUT_FOR_DELIVERY";
    }
 
    if (!matchesStatus) return false;
 
    // 2. Search Text Filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const numMatch = order.orderNumber.toLowerCase().includes(term);
      const nameMatch = order.productNamesSummary
        ? order.productNamesSummary.toLowerCase().includes(term)
        : false;
      return numMatch || nameMatch;
    }
 
    return true;
  });

  // Sort orders by date descending
  const sortedOrders = [...filteredOrders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-50 text-amber-600 border border-amber-200/50";
      case "CONFIRMED":
      case "PACKED":
        return "bg-blue-50 text-blue-600 border border-blue-200/50";
      case "OUT_FOR_DELIVERY":
        return "bg-purple-50 text-purple-600 border border-purple-200/50";
      case "DELIVERED":
        return "bg-emerald-50 text-primary border border-primary/20";
      case "CANCELLED":
        return "bg-red-50 text-red-600 border border-red-200/50";
      default:
        return "bg-slate-50 text-slate-600 border border-slate-200/50";
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR"
    }).format(val);
  };

  const tabs: { label: string; value: FilterStatus }[] = [
    { label: "All Orders", value: "ALL" },
    { label: "Pending", value: "PENDING" },
    { label: "Confirmed", value: "CONFIRMED" },
    { label: "Delivered", value: "DELIVERED" },
    { label: "Cancelled", value: "CANCELLED" }
  ];

  if (isLoading) {
    return (
      <ProfileLayout>
        <div className="flex items-center justify-center min-h-[40vh]">
          <LoadingState text="Loading order history..." />
        </div>
      </ProfileLayout>
    );
  }

  return (
    <ProfileLayout>
      <div className="bg-card border border-slate-100 rounded-2xl p-6 shadow-2xs text-left">
        
        {/* Title */}
        <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2 border-b border-slate-50 pb-4 mb-6">
          <ClipboardList size={18} className="text-primary" />
          <span>My Order History</span>
        </h3>

        {/* Filter Tabs */}
        <div className="flex border-b border-slate-100 gap-6 overflow-x-auto hide-scrollbar flex-nowrap mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`pb-3 font-extrabold text-xs tracking-wide uppercase border-b-2 cursor-pointer transition-all ${
                filter === tab.value
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="mb-6 relative flex items-center bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-xl px-3 py-1.5 shadow-xs max-w-md">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <Input
            placeholder="Search orders by number or item name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-xs h-7"
          />
        </div>

        {/* Orders List */}
        {sortedOrders.length > 0 ? (
          <div className="flex flex-col gap-4">
            {sortedOrders.map((order) => (
              <div
                key={order.id}
                className="border border-slate-100 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-2xs transition-shadow duration-300 bg-white"
              >
                {/* Info block */}
                <div className="flex flex-col gap-1.5 text-left">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-slate-800 text-sm uppercase">Order #{order.orderNumber}</span>
                    <span className={`px-2 py-0.5 rounded font-black text-[9px] uppercase tracking-wide ${getStatusStyle(order.status)}`}>
                      {order.status.replace(/_/g, " ")}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar size={13} className="text-slate-400" />
                      <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                    </span>
                    <span className="flex items-center gap-0.5">
                      <IndianRupee size={13} className="text-slate-400" />
                      <span>{order.totalItems} {order.totalItems === 1 ? "item" : "items"}</span>
                    </span>
                  </div>
                </div>

                {/* Price and Action block */}
                <div className="flex items-center justify-between sm:justify-end gap-6 border-t border-slate-50 sm:border-0 pt-3 sm:pt-0">
                  <div className="flex flex-col text-left sm:text-right shrink-0">
                    <span className="text-[10px] text-slate-400 font-bold uppercase leading-none">Total Amount</span>
                    <span className="text-base font-black text-secondary mt-1">{formatCurrency(order.totalAmount)}</span>
                  </div>

                  <a href={`/tracking/${order.orderNumber}`} target="_blank" rel="noopener noreferrer">
                    <Button
                      variant="outline"
                      className="border-slate-200 text-[#064e3b] font-bold rounded-xl cursor-pointer hover:bg-[#064e3b]/5 h-10 px-4 flex items-center gap-1 text-xs"
                    >
                      <span>Track Order</span>
                      <ArrowRight size={14} />
                    </Button>
                  </a>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-50/50 rounded-xl border border-slate-100/50 flex flex-col items-center gap-2">
            <PackageOpen size={36} className="text-slate-300" />
            <p className="text-slate-400 text-xs font-semibold">
              No orders found matching this status filter.
            </p>
          </div>
        )}

      </div>
    </ProfileLayout>
  );
}
