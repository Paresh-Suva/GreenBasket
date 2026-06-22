"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { walletService } from "@/services/wallet.service";
import { useAuthStore } from "@/store/useAuthStore";
import { Wallet, Info, ArrowUpRight, ArrowDownLeft, Gift, AlertCircle, ShoppingBag } from "lucide-react";
import { LoadingState } from "@/components/ui/loading-state";

export default function WalletPage() {
  const { isAuthenticated } = useAuthStore();

  const { data: summaryRes, isLoading } = useQuery({
    queryKey: ["wallet-summary"],
    queryFn: () => walletService.getWalletSummary(),
    enabled: isAuthenticated
  });

  const summary = summaryRes?.data;
  const balance = summary?.balance ?? 0;
  const transactions = summary?.transactions || [];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR"
    }).format(val);
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[50vh] font-outfit">
        <AlertCircle className="w-12 h-12 text-slate-350 mb-3" />
        <h2 className="text-xl font-bold text-slate-700">Access Denied</h2>
        <p className="text-sm text-slate-500 mt-1">Please log in to view your wallet balance and earnings.</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 max-w-[1250px] min-w-0 h-full overflow-y-auto flex flex-col gap-6 hide-scrollbar pb-12 font-outfit text-left px-2 sm:px-6">
        
        {/* Page Header */}
        <div className="border-b border-slate-100 pb-4">
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Wallet className="w-6 h-6 text-[#064e3b]" />
            <span>My Wallet</span>
          </h1>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            Manage your GreenBasket cashback balance, check earnings, and review transaction history.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingState text="Loading wallet transactions..." />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left Card: Balance & Info */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              
              {/* Balance Card */}
              <div className="bg-[#064e3b] text-white rounded-3xl p-6 shadow-md relative overflow-hidden flex flex-col gap-4">
                <div className="flex justify-between items-center z-10">
                  <span className="text-xs font-bold text-emerald-200/90 uppercase tracking-widest">Available Balance</span>
                  <Wallet className="w-5 h-5 text-emerald-300" />
                </div>
                <div className="z-10 mt-1">
                  <span className="text-3xl sm:text-4xl font-black tracking-tight">{formatCurrency(balance)}</span>
                </div>
                <div className="text-[10px] text-emerald-250 font-semibold leading-relaxed z-10 border-t border-white/10 pt-3 mt-2">
                  Apply balance during checkout to get instant discount on your orders.
                </div>
                
                {/* Decorative background shapes */}
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/5 rounded-full"></div>
                <div className="absolute top-4 -left-4 w-20 h-20 bg-white/5 rounded-full"></div>
              </div>

              {/* How Wallet Works card */}
              <div className="bg-card border border-slate-100 rounded-3xl p-6 shadow-2xs text-left">
                <h3 className="font-extrabold text-slate-800 text-sm mb-4 border-b border-slate-50 pb-2 flex items-center gap-1.5">
                  <Gift className="w-4 h-4 text-amber-500" />
                  <span>Cashback Rewards Program</span>
                </h3>
                <div className="flex flex-col gap-4 text-xs font-semibold text-slate-600">
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-50 text-primary font-bold flex items-center justify-center shrink-0">1</div>
                    <div>
                      <p className="text-slate-800 font-extrabold">Shop & Transact</p>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">Order groceries on GreenBasket via Card, UPI, or Cash.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-50 text-primary font-bold flex items-center justify-center shrink-0">2</div>
                    <div>
                      <p className="text-slate-800 font-extrabold">Earn Cashback</p>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">Get <span className="text-primary font-extrabold">₹2 back for every ₹50 transacted</span> (net spent amount).</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-50 text-primary font-bold flex items-center justify-center shrink-0">3</div>
                    <div>
                      <p className="text-slate-800 font-extrabold">Save on Next Order</p>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">{"Toggle \"Use Wallet\" at checkout to apply your balance instantly."}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card: Transaction History */}
            <div className="lg:col-span-2 bg-card border border-slate-100 rounded-3xl p-6 shadow-2xs flex flex-col min-h-[400px]">
              <h3 className="font-extrabold text-slate-800 text-base mb-4 border-b border-slate-50 pb-2">
                Transaction History
              </h3>

              {transactions.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                  <ShoppingBag className="w-10 h-10 text-slate-200 mb-2" />
                  <p className="text-slate-400 text-xs font-semibold">No transactions recorded yet.</p>
                  <p className="text-slate-400 text-[10px] font-medium mt-0.5">Earn cashback on your first completed order!</p>
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-slate-50">
                  {transactions.map((txn) => {
                    const isEarned = txn.transactionType === "EARNED";
                    return (
                      <div key={txn.id} className="flex justify-between items-center py-4 text-left">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isEarned ? "bg-emerald-55 bg-emerald-50 text-[#064e3b]" : "bg-red-50 text-red-600"}`}>
                            {isEarned ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-slate-800 font-extrabold text-xs sm:text-sm">{txn.description}</span>
                            <span className="text-slate-400 text-[10px] font-semibold">{formatDate(txn.createdAt)}</span>
                          </div>
                        </div>
                        <span className={`font-extrabold text-sm sm:text-base whitespace-nowrap ${isEarned ? "text-[#064e3b]" : "text-red-500"}`}>
                          {isEarned ? "+" : "-"}{formatCurrency(txn.amount)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </>
  );
}
