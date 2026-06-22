"use client";
 
import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersService } from "@/services/orders.service";
import { ProfileLayout } from "@/components/storefront/ProfileLayout";
import { LoadingState } from "@/components/ui/loading-state";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Calendar, MapPin, CreditCard, ClipboardList, CheckCircle2, Circle, AlertCircle, ArrowLeft, Ban } from "lucide-react";
import dynamic from "next/dynamic";
 
// MapTracking removed in favor of dedicated tab tracking page

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const orderId = params.id as string;

  // 1. Fetch Order Details
  const { data: orderRes, isLoading, error } = useQuery({
    queryKey: ["order-details", orderId],
    queryFn: () => ordersService.getOrderDetails(orderId),
    enabled: !!orderId
  });

  const order = orderRes?.data;

  // 2. Cancel Order Mutation
  const cancelOrderMutation = useMutation({
    mutationFn: () => ordersService.cancelOrder(orderId),
    onSuccess: () => {
      toast.success("Order cancelled successfully");
      queryClient.invalidateQueries({ queryKey: ["order-details", orderId] });
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });
    },
    onError: (err) => {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message || "Failed to cancel order";
      toast.error(msg);
    }
  });

  if (isLoading) {
    return (
      <ProfileLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <LoadingState text="Loading order details..." />
        </div>
      </ProfileLayout>
    );
  }

  if (error || !order) {
    return (
      <ProfileLayout>
        <div className="text-center py-20 bg-card rounded-2xl border border-slate-100 p-8 shadow-sm flex flex-col items-center">
          <AlertCircle size={40} className="text-red-500 mb-2" />
          <h2 className="text-lg font-bold text-slate-800 mb-1">Order Not Found</h2>
          <p className="text-xs text-slate-500 mb-6">{"We couldn't retrieve details for this order."}</p>
          <Button onClick={() => router.push("/profile/orders")} className="bg-primary text-white rounded-full text-xs px-6 h-9">
            Back to Orders
          </Button>
        </div>
      </ProfileLayout>
    );
  }

  // Tracking Timeline steps configuration
  const steps = [
    { label: "Order Placed", status: "PENDING", desc: "Your order has been registered" },
    { label: "Confirmed", status: "CONFIRMED", desc: "Sellers have confirmed the items" },
    { label: "Packed & Processed", status: "PACKED", desc: "Items packed and ready for partner pickup" },
    { label: "Out For Delivery", status: "OUT_FOR_DELIVERY", desc: "Delivery partner is on the way to you" },
    { label: "Delivered", status: "DELIVERED", desc: "Order delivered safely to your doorstep" }
  ];

  // Helper to determine step states
  const getStepIndex = (status: string) => {
    switch (status) {
      case "PENDING": return 0;
      case "CONFIRMED": return 1;
      case "PACKED": return 2;
      case "OUT_FOR_DELIVERY": return 3;
      case "DELIVERED": return 4;
      case "CANCELLED": return -1;
      default: return 0;
    }
  };

  const currentStepIndex = getStepIndex(order.status);
  const isCancelled = order.status === "CANCELLED";

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR"
    }).format(val);
  };

  return (
    <ProfileLayout>
      {/* Back to list */}
      <div
        onClick={() => router.push("/profile/orders")}
        className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-primary cursor-pointer w-max mb-2"
      >
        <ArrowLeft size={14} />
        <span>Back to Orders</span>
      </div>

      <div className="flex flex-col gap-6">
        {/* Header summary panel */}
        <div className="bg-card border border-slate-100 rounded-2xl p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Order #{order.orderNumber}</h2>
              {isCancelled && (
                <span className="bg-red-50 text-red-600 border border-red-200/50 px-2.5 py-0.5 rounded font-black text-[9px] uppercase tracking-wide">Cancelled</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 flex-wrap">
              <span className="flex items-center gap-1">
                <Calendar size={13} className="text-slate-400" />
                <span>Placed on {new Date(order.createdAt).toLocaleDateString()}</span>
              </span>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            {!isCancelled && (
              <a href={`/tracking/${order.orderNumber}`} target="_blank" rel="noopener noreferrer">
                <Button
                  className="bg-primary hover:bg-[#064e3b] text-white font-bold h-9 px-4 rounded-xl cursor-pointer text-xs flex items-center gap-1.5"
                >
                  <span>Track Delivery</span>
                </Button>
              </a>
            )}
            {order.status === "PENDING" && (
              <Button
                onClick={() => {
                  if (window.confirm("Are you sure you want to cancel this order?")) {
                    cancelOrderMutation.mutate();
                  }
                }}
                disabled={cancelOrderMutation.isPending}
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50 font-bold h-9 px-4 rounded-xl cursor-pointer text-xs flex items-center gap-1.5"
              >
                <Ban size={14} />
                <span>{cancelOrderMutation.isPending ? "Cancelling..." : "Cancel Order"}</span>
              </Button>
            )}
          </div>
        </div>

        {/* Tracking screen & timeline container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Timeline Tracking Details (Left) */}
          <div className="lg:col-span-2 bg-card border border-slate-100 rounded-2xl p-6 shadow-2xs text-left">
            <h3 className="font-extrabold text-slate-800 text-sm mb-6 flex items-center gap-1.5 border-b border-slate-50 pb-3">
              <ClipboardList size={16} className="text-primary" />
              <span>Order Tracking Timeline</span>
            </h3>

            {isCancelled ? (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200/50 rounded-xl p-4 text-xs font-semibold text-red-800 mb-2">
                <Ban size={18} className="shrink-0 text-red-600" />
                <div className="flex flex-col gap-0.5">
                  <span className="font-extrabold">This order has been cancelled</span>
                  <span className="font-medium text-red-600/95 leading-normal">The order is cancelled and will not be processed. If payment was made, refunds will be initiated automatically.</span>
                </div>
              </div>
            ) : (
              <div className="relative flex flex-col gap-6 pl-6 border-l-2 border-slate-100 ml-3 py-1">
                {steps.map((step, idx) => {
                  const isCompleted = idx <= currentStepIndex;
                  const isActive = idx === currentStepIndex;

                  return (
                    <div key={idx} className="relative flex flex-col gap-1 text-left">
                      {/* Node Bullet */}
                      <div className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-300 bg-white ${
                        isCompleted
                          ? "border-primary text-primary"
                          : "border-slate-200 text-slate-300"
                      }`}>
                        {isCompleted ? (
                          <CheckCircle2 size={12} className="fill-emerald-50" />
                        ) : (
                          <Circle size={8} className="fill-slate-100 stroke-none" />
                        )}
                      </div>

                      <span className={`text-xs uppercase tracking-wider ${isActive ? "font-black text-primary" : isCompleted ? "font-extrabold text-slate-800" : "font-semibold text-slate-400"}`}>
                        {step.label}
                      </span>
                      <span className={`text-[11px] font-semibold ${isCompleted ? "text-slate-500" : "text-slate-400"}`}>
                        {step.desc}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Live Leaflet Tracking Map removed */}
          </div>

          {/* Delivery & Payment details (Right) */}
          <div className="lg:col-span-1 flex flex-col gap-6 text-left">
            
            {/* Delivery Address Details */}
            <div className="bg-card border border-slate-100 rounded-2xl p-5 shadow-2xs">
              <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wide border-b border-slate-50 pb-2 mb-3 flex items-center gap-1">
                <MapPin size={14} className="text-primary" />
                <span>Delivery Address</span>
              </h4>
              <div className="flex flex-col gap-0.5 text-xs font-semibold text-slate-600 leading-normal">
                <span className="font-bold text-slate-700">{order.deliveryAddress.label}</span>
                <span>{order.deliveryAddress.addressLine1}</span>
                <span>{order.deliveryAddress.addressLine2 ? order.deliveryAddress.addressLine2.replace(" | ", ", ") : ""}</span>
                <span>{order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.postalCode}</span>
                <span>{order.deliveryAddress.country}</span>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-card border border-slate-100 rounded-2xl p-5 shadow-2xs">
              <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wide border-b border-slate-50 pb-2 mb-3 flex items-center gap-1">
                <CreditCard size={14} className="text-primary" />
                <span>Payment Summary</span>
              </h4>
              <div className="flex flex-col gap-2.5 text-xs font-semibold text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-primary font-bold">
                    <span>Discount</span>
                    <span>-{formatCurrency(order.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>{order.deliveryFee === 0 ? "FREE" : formatCurrency(order.deliveryFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax</span>
                  <span>{formatCurrency(order.taxAmount)}</span>
                </div>
                <div className="flex justify-between font-black text-slate-800 border-t border-slate-50 pt-2.5 mt-1 text-sm">
                  <span>Grand Total</span>
                  <span className="text-secondary">{formatCurrency(order.totalAmount)}</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Ordered Products Table */}
        <div className="bg-card border border-slate-100 rounded-2xl p-6 shadow-2xs text-left">
          <h3 className="font-extrabold text-slate-800 text-sm mb-6 flex items-center gap-1.5 border-b border-slate-50 pb-3">
            <ClipboardList size={16} className="text-primary" />
            <span>Items Ordered ({order.items.length})</span>
          </h3>

          <div className="flex flex-col divide-y divide-slate-50">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center py-4 text-xs sm:text-sm font-semibold">
                <div className="flex flex-col text-left gap-0.5">
                  <span className="font-bold text-slate-800">{item.productName}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">SKU: {item.productSku}</span>
                </div>

                <div className="flex items-center gap-8 text-right">
                  <div className="flex flex-col text-right shrink-0">
                    <span className="text-[10px] text-slate-400 font-bold uppercase leading-none">Price x Qty</span>
                    <span className="font-medium text-slate-700 mt-1">
                      {formatCurrency(item.unitPrice)} x {item.quantity}
                    </span>
                  </div>
                  <div className="flex flex-col text-right shrink-0">
                    <span className="text-[10px] text-slate-400 font-bold uppercase leading-none">Total</span>
                    <span className="font-bold text-slate-800 mt-1">{formatCurrency(item.lineTotal)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </ProfileLayout>
  );
}
