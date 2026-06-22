"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { 
  IndianRupee, 
  ShoppingBag, 
  Users, 
  FolderTree, 
  Layers, 
  AlertCircle, 
  Sparkles, 
  LifeBuoy, 
  ArrowRight,
  ClipboardList
} from "lucide-react";
import { dashboardService } from "@/services/dashboard.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState } from "@/components/ui/loading-state";
 
export default function AdminDashboardPage() {
  const { data: summaryRes, isLoading } = useQuery({
    queryKey: ["admin", "dashboard-summary"],
    queryFn: () => dashboardService.getSummary(),
  });
 
  const stats = summaryRes?.data;
 
  if (isLoading) {
    return <LoadingState text="Loading dashboard statistics..." />;
  }
 
  const cards = [
    {
      title: "Total Revenue",
      value: new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR"
      }).format(stats?.totalRevenue ?? 0),
      description: "Delivered orders revenue",
      icon: IndianRupee,
      color: "from-emerald-500 to-teal-500",
      textColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Delivered Orders",
      value: stats?.totalOrders ?? 0,
      description: `Today's orders: ${stats?.newOrdersToday ?? 0}`,
      icon: ShoppingBag,
      color: "from-blue-500 to-indigo-500",
      textColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Total Customers",
      value: stats?.totalCustomers ?? 0,
      description: `Registered system users: ${stats?.totalUsers ?? 0}`,
      icon: Users,
      color: "from-violet-500 to-purple-500",
      textColor: "text-violet-600 dark:text-violet-400",
    },
    {
      title: "Total Categories",
      value: stats?.totalCategories ?? 0,
      description: "Hierarchical categories count",
      icon: FolderTree,
      color: "from-amber-500 to-orange-500",
      textColor: "text-amber-600 dark:text-amber-400",
    },
    {
      title: "Active Products",
      value: `${stats?.activeProducts ?? 0} / ${stats?.totalProducts ?? 0}`,
      description: `${stats?.featuredProducts ?? 0} featured on shelves`,
      icon: Layers,
      color: "from-sky-500 to-blue-500",
      textColor: "text-sky-600 dark:text-sky-400",
    },
    {
      title: "Out of Stock",
      value: stats?.outOfStockProducts ?? 0,
      description: "Needs immediate restocking",
      icon: AlertCircle,
      color: stats?.outOfStockProducts && stats.outOfStockProducts > 0 
        ? "from-rose-500 to-red-500" 
        : "from-slate-400 to-slate-500",
      textColor: stats?.outOfStockProducts && stats.outOfStockProducts > 0 
        ? "text-rose-600 dark:text-rose-400" 
        : "text-slate-500",
    },
    {
      title: "Support Tickets",
      value: stats?.activeSupportTickets ?? 0,
      description: "Active open support chats",
      icon: LifeBuoy,
      color: "from-teal-500 to-emerald-500",
      textColor: "text-teal-600 dark:text-teal-400",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-800 dark:text-zinc-100">
          Admin Dashboard
        </h1>
        <p className="text-sm font-semibold text-slate-400 dark:text-zinc-500">
          Real-time metrics, product counts, and system management status.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <Card key={i} className="relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300 shadow-sm border border-slate-100 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/50">
              {/* Top gradient highlight strip */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.color}`} />
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-bold text-slate-500 dark:text-zinc-400">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/60 ${card.textColor}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-slate-800 dark:text-zinc-50 tracking-tight">
                  {card.value}
                </div>
                <p className="text-xs font-semibold text-slate-400 dark:text-zinc-500 mt-1">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Navigation Cards */}
      <div className="pt-4 space-y-4">
        <h2 className="text-lg font-bold text-slate-800 dark:text-zinc-100 flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-emerald-500" />
          <span>Management Shortcuts</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/admin/products" className="group p-6 rounded-2xl bg-white dark:bg-zinc-900/40 border border-slate-100 dark:border-zinc-800/50 hover:border-emerald-200 dark:hover:border-emerald-900/35 transition-all duration-300 hover:shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-bold text-slate-800 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Product Inventory
              </h3>
              <p className="text-sm font-semibold text-slate-400 dark:text-zinc-500">
                View catalog, create items, adjust stock count, update pricing.
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 text-slate-500 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/20 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-all">
              <ArrowRight className="w-5 h-5" />
            </div>
          </Link>

          <Link href="/admin/categories" className="group p-6 rounded-2xl bg-white dark:bg-zinc-900/40 border border-slate-100 dark:border-zinc-800/50 hover:border-emerald-200 dark:hover:border-emerald-900/35 transition-all duration-300 hover:shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-bold text-slate-800 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Category Tree
              </h3>
              <p className="text-sm font-semibold text-slate-400 dark:text-zinc-500">
                Manage grocery category groupings, slugs, and sort orders.
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 text-slate-500 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/20 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-all">
              <ArrowRight className="w-5 h-5" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
