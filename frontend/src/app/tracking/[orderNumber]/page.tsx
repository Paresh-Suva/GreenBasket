"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ordersService } from "@/services/orders.service";
import { CheckCircle2, Circle, AlertCircle, ShoppingBasket } from "lucide-react";
import dynamic from "next/dynamic";

const MapTrackingOSRM = dynamic(() => import("@/components/storefront/MapTrackingOSRM"), {
  ssr: false,
  loading: () => (
    <div className="bg-slate-50/50 border border-dashed border-slate-200 rounded-xl p-10 flex flex-col items-center gap-2 justify-center h-[350px]">
      <div className="w-6 h-6 border-2 border-[#064e3b] border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-bold text-slate-500">Connecting OSRM Road Router...</span>
    </div>
  )
});

export default function DedicatedTrackingPage() {
  const params = useParams();
  const orderNumber = params.orderNumber as string;

  // 1. Fetch Order Tracking Details every 3 seconds
  const { data: trackingRes, error, isLoading } = useQuery({
    queryKey: ["order-tracking", orderNumber],
    queryFn: () => ordersService.getTrackingDetails(orderNumber),
    refetchInterval: 3000, // Poll backend status
    enabled: !!orderNumber
  });

  const trackingData = trackingRes?.data;

  // Local ticker state for smooth seconds countdown
  const [localEta, setLocalEta] = useState<number>(50);

  useEffect(() => {
    if (!trackingData?.createdAt) return;

    const tick = () => {
      const elapsed = Math.floor((new Date().getTime() - new Date(trackingData.createdAt).getTime()) / 1000);
      const remaining = Math.max(0, 50 - elapsed);
      setLocalEta(remaining);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [trackingData?.createdAt]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#064e3b] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-extrabold text-slate-500 tracking-wide uppercase">Connecting tracking feed...</span>
        </div>
      </div>
    );
  }

  if (error || !trackingData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-md max-w-sm text-center flex flex-col items-center">
          <AlertCircle size={40} className="text-red-500 mb-3" />
          <h2 className="text-base font-black text-slate-800 uppercase tracking-tight mb-1">Tracking Session Expired</h2>
          <p className="text-xs text-slate-500 leading-relaxed mb-4">
            We could not fetch tracking logs for order code <strong>{orderNumber}</strong>. Please verify the URL or request details in your profile history.
          </p>
        </div>
      </div>
    );
  }

  const steps = [
    { label: "Order Placed", status: "PENDING", desc: "Received at warehouse" },
    { label: "Confirmed", status: "CONFIRMED", desc: "Order packed & ready" },
    { label: "Packed & Processed", status: "PACKED", desc: "Assigned delivery vehicle" },
    { label: "Out For Delivery", status: "OUT_FOR_DELIVERY", desc: "Partner is on the way" },
    { label: "Delivered", status: "DELIVERED", desc: "Delivered to your doorstep" }
  ];

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

  const currentStepIndex = getStepIndex(trackingData.status);
  const isCancelled = trackingData.status === "CANCELLED";

  // Timeline countdown texts
  const getEtaLabel = () => {
    if (isCancelled) return "Cancelled";
    if (trackingData.status === "DELIVERED" || localEta === 0) return "Delivered";
    if (trackingData.status === "OUT_FOR_DELIVERY") {
      return localEta <= 5 ? "Arriving Now" : `Arriving in ${localEta}s`;
    }
    return `Arriving in ${localEta}s`;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Brand Header Minimal */}
      <header className="h-14 bg-white border-b border-slate-100 flex items-center justify-between px-6 shrink-0 shadow-3xs">
        <div className="flex items-center gap-2">
          <div className="bg-[#064e3b] p-1.5 rounded-lg text-white">
            <ShoppingBasket size={18} />
          </div>
          <span className="font-black text-slate-800 tracking-tight text-lg" style={{ fontFamily: "var(--font-outfit)" }}>
            GreenBasket <span className="text-primary font-bold text-xs uppercase ml-1">Live Tracking</span>
          </span>
        </div>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">
          Order ID: #{trackingData.orderNumber}
        </div>
      </header>

      {/* Main Track Grid */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left column: Map view */}
        <div className="lg:col-span-8 bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[400px]">
          <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm">Delivery Path</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                Powered by OSRM Road Geometry
              </p>
            </div>
            {/* Status indicator pill */}
            <div className="bg-[#064e3b]/10 border border-[#064e3b]/20 text-[#064e3b] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
              {trackingData.status.replace(/_/g, " ")}
            </div>
          </div>

          <div className="flex-1 relative">
            <MapTrackingOSRM
              warehouseLat={trackingData.warehouseLatitude}
              warehouseLng={trackingData.warehouseLongitude}
              customerLat={trackingData.customerLatitude}
              customerLng={trackingData.customerLongitude}
              createdAt={trackingData.createdAt}
              orderStatus={trackingData.status}
            />
          </div>
        </div>

        {/* Right column: Timelines & ETA */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* ETA card */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm text-center flex flex-col items-center">
            <span className="text-3xl mb-1.5 animate-bounce duration-1000">🛵</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">Estimated Delivery</span>
            <h2 className="text-2xl font-black text-[#064e3b] mt-1.5 leading-none transition-all duration-300">
              {getEtaLabel()}
            </h2>
            <p className="text-[10px] text-slate-450 font-bold leading-normal mt-2.5 max-w-[200px] text-center border-t border-slate-50 pt-2.5">
              Hub: {trackingData.warehouseName}
            </p>
          </div>

          {/* Delivery timeline milestones */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex-1 flex flex-col justify-between">
            <div className="space-y-5">
              <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-50 pb-2 mb-4">
                Timeline Progress
              </h4>

              {isCancelled ? (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200/50 rounded-xl p-4 text-xs font-semibold text-red-800">
                  <span className="text-lg">🚫</span>
                  <div className="flex flex-col text-left">
                    <span className="font-extrabold">Delivery Cancelled</span>
                    <span className="font-medium text-red-600/90 leading-normal mt-0.5">This delivery run was terminated. Please contact customer support.</span>
                  </div>
                </div>
              ) : (
                <div className="relative flex flex-col gap-5 pl-5 border-l-2 border-slate-100 ml-2.5 py-0.5">
                  {steps.map((step, idx) => {
                    const isCompleted = idx <= currentStepIndex;
                    const isActive = idx === currentStepIndex;

                    return (
                      <div key={idx} className="relative flex flex-col gap-0.5 text-left">
                        {/* Bullet */}
                        <div className={`absolute -left-[27px] top-0.5 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-all duration-300 bg-white ${
                          isCompleted
                            ? "border-[#064e3b] text-[#064e3b]"
                            : "border-slate-200 text-slate-350"
                        }`}>
                          {isCompleted ? (
                            <CheckCircle2 size={10} className="fill-emerald-50 text-[#064e3b]" />
                          ) : (
                            <Circle size={6} className="fill-slate-100 stroke-none" />
                          )}
                        </div>

                        <span className={`text-[10px] uppercase tracking-wider leading-none ${isActive ? "font-black text-[#064e3b]" : isCompleted ? "font-extrabold text-slate-700" : "font-semibold text-slate-400"}`}>
                          {step.label}
                        </span>
                        <span className="text-[9px] font-semibold text-slate-400 leading-normal">
                          {step.desc}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Courier Masked Info */}
            <div className="border-t border-slate-100 pt-4 mt-5">
              <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5 text-left">
                Delivery Courier
              </h5>
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="w-9 h-9 rounded-full bg-[#edf7ef] border border-[#064e3b]/10 flex items-center justify-center text-primary text-base font-bold">
                  👨‍✈️
                </div>
                <div className="flex flex-col text-left gap-0.5">
                  <span className="text-xs font-bold text-slate-800">Ramesh Kumar</span>
                  <span className="text-[9px] text-slate-400 font-semibold">GB Eco Courier</span>
                  <span className="text-[10px] text-primary font-bold">{trackingData.customerPhone}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="py-4 bg-white border-t border-slate-100 text-center text-[10px] font-semibold text-slate-450 shrink-0">
        ♻️ Delivery completed via electric vehicle fleet. Support: {trackingData.warehouseContact}
      </footer>
    </div>
  );
}
