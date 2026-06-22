"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { authService } from "@/services/auth.service";
import { 
  LayoutDashboard, 
  FolderTree, 
  ShoppingBag, 
  LogOut, 
  ArrowLeft,
  User as UserIcon,
  ChevronRight,
  Settings,
  MapPin,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { warehouseService } from "@/services/warehouse.service";
import { useState } from "react";
import { toast } from "sonner";
import dynamic from "next/dynamic";

const LocationMapModal = dynamic(() => import("@/components/storefront/LocationMapModal"), {
  ssr: false,
});

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // ignore
    }
    logout();
    router.push("/login");
  };

  const navItems = [
    {
      label: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      label: "Categories",
      href: "/admin/categories",
      icon: FolderTree,
    },
    {
      label: "Products",
      href: "/admin/products",
      icon: ShoppingBag,
    },
    {
      label: "Warehouse Config",
      href: "/admin/warehouse",
      icon: Settings,
    },
  ];

  const queryClient = useQueryClient();
  const { data: warehouseRes, isLoading: isWarehouseLoading } = useQuery({
    queryKey: ["warehouse-config"],
    queryFn: () => warehouseService.getWarehouse(),
  });

  const warehouse = warehouseRes?.data;
  const isUnconfigured = warehouseRes !== undefined && !warehouse;

  if (isWarehouseLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#064e3b]" />
          <span className="text-xs font-extrabold text-slate-500 tracking-wide uppercase">Initializing Hub Connection...</span>
        </div>
      </div>
    );
  }

  if (isUnconfigured) {
    return (
      <MandatoryWarehouseSetupForm />
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50/50 dark:bg-zinc-950">
      {/* Sidebar */}
      <aside className="w-64 h-screen sticky top-0 bg-white dark:bg-zinc-900 border-r border-slate-100 dark:border-zinc-800 hidden md:flex flex-col shadow-sm">
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md shrink-0">
          <Link href="/" className="flex items-center gap-2 font-black text-xl tracking-tight text-emerald-600 dark:text-emerald-400" style={{ fontFamily: "var(--font-outfit)" }}>
            <span>GreenBasket</span>
            <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900">
              {user?.roles?.includes("STAFF") ? "Staff" : "Admin"}
            </span>
          </Link>
        </div>
        
        <div className="flex-1 py-6 px-4 flex flex-col justify-between overflow-y-auto hide-scrollbar">
          <nav className="flex flex-col gap-1.5">
            <span className="text-[11px] font-extrabold text-slate-450 dark:text-zinc-500 uppercase tracking-wider px-3 mb-2" style={{ fontFamily: "var(--font-outfit)" }}>Core Management</span>
            {navItems.map((item) => {
              const Icon = item.icon;
              // Fix: base dashboard path should match exactly, otherwise prefix-match for subpages
              const isActive = item.href === "/admin"
                ? pathname === "/admin"
                : pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-4 py-2.5 text-[14px] font-extrabold rounded-xl transition-all duration-200 group ${
                    isActive
                      ? "bg-[#064e3b] text-white shadow-xs"
                      : "text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/50 hover:text-slate-900 dark:hover:text-zinc-100"
                  }`}
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 duration-200 ${isActive ? "text-white" : "text-slate-400 dark:text-zinc-500 group-hover:text-slate-600 dark:group-hover:text-zinc-300"}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-white" />}
                </Link>
              );
            })}
          </nav>

          <div className="flex flex-col gap-2 pt-6 border-t border-slate-100 dark:border-zinc-800 shrink-0">
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/50 rounded-xl transition-colors"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              <ArrowLeft className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
              <span>Back to Storefront</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 rounded-xl transition-colors w-full text-left"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-800 flex items-center px-6 justify-between shadow-xs z-10">
          <div className="flex items-center gap-4">
            <Link href="/" className="md:hidden flex items-center gap-2 font-black text-xl tracking-tight text-emerald-600 dark:text-emerald-400">
              <span>GreenBasket</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Topbar Actions */}
            <div className="flex items-center gap-3 pl-3 border-l border-slate-100 dark:border-zinc-800">
              <div className="flex flex-col items-end">
                <span className="text-sm font-bold text-slate-800 dark:text-zinc-100">
                  {user ? `${user.firstName} ${user.lastName}` : "Administrator"}
                </span>
                <span className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
                  {user?.roles?.includes("SUPER_ADMIN") ? "Super Admin" : "Staff"}
                </span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white font-bold text-sm shadow-sm border border-emerald-300/20">
                {user ? user.firstName[0].toUpperCase() : <UserIcon className="w-4 h-4" />}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8 overflow-auto bg-slate-50/30 dark:bg-zinc-950/30">
          {children}
        </main>
      </div>
    </div>
  );
}

function MandatoryWarehouseSetupForm() {
  const queryClient = useQueryClient();
  const [showMap, setShowMap] = useState(false);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);

  const handleMapConfirm = (
    lat: number,
    lng: number,
    addressInfo: {
      road: string;
      area: string;
      city: string;
      state: string;
      postcode: string;
    }
  ) => {
    setLatitude(lat);
    setLongitude(lng);
    if (addressInfo.road) setAddress(addressInfo.road);
    if (addressInfo.city) setCity(addressInfo.city);
    if (addressInfo.state) setState(addressInfo.state);
    if (addressInfo.postcode) setPincode(addressInfo.postcode);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !name ||
      !address ||
      !city ||
      !state ||
      !pincode ||
      !contactNumber ||
      latitude === undefined ||
      longitude === undefined
    ) {
      toast.error("Please fill in all fields and select GPS coordinates on the map");
      return;
    }

    setIsSaving(true);
    try {
      await warehouseService.saveWarehouse({
        name,
        address,
        city,
        state,
        pincode,
        contactNumber,
        latitude,
        longitude,
      });
      toast.success("Initial Hub Configured! Welcome to GreenBasket Admin Panel.");
      queryClient.invalidateQueries({ queryKey: ["warehouse-config"] });
    } catch {
      toast.error("Failed to save initial hub configuration.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl text-left flex flex-col gap-5">
        <div className="text-center border-b border-slate-50 dark:border-zinc-800/80 pb-4">
          <span className="text-3xl">🏪</span>
          <h2 className="text-lg font-black text-slate-800 dark:text-zinc-150 uppercase tracking-tight mt-2">
            Mandatory Hub Configuration
          </h2>
          <p className="text-[11px] text-slate-450 dark:text-zinc-400 font-semibold leading-relaxed mt-1">
            Before accessing the admin dashboard, you must register the central warehouse coordinates. This coordinates origin is utilized to compute OSRM road routes and deliver orders.
          </p>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-550">Hub Name *</label>
              <Input
                type="text"
                placeholder="e.g. Bangalore Central Warehouse"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-9 text-xs border border-slate-200 focus-visible:ring-primary focus-visible:border-primary rounded-xl"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-550">Contact Number *</label>
              <Input
                type="text"
                placeholder="e.g. 0000000000"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className="h-9 text-xs border border-slate-200 focus-visible:ring-primary focus-visible:border-primary rounded-xl"
              />
            </div>
            <div className="sm:col-span-2 flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-550">Street Address *</label>
              <Input
                type="text"
                placeholder="e.g. Plot 15, Outer Ring Road, Mahadevapura"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="h-9 text-xs border border-slate-200 focus-visible:ring-primary focus-visible:border-primary rounded-xl"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-550">City *</label>
              <Input
                type="text"
                placeholder="e.g. Bengaluru"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="h-9 text-xs border border-slate-200 focus-visible:ring-primary focus-visible:border-primary rounded-xl"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-550">State *</label>
              <Input
                type="text"
                placeholder="e.g. Karnataka"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="h-9 text-xs border border-slate-200 focus-visible:ring-primary focus-visible:border-primary rounded-xl"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-550">Pincode *</label>
              <Input
                type="text"
                placeholder="e.g. 560048"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="h-9 text-xs border border-slate-200 focus-visible:ring-primary focus-visible:border-primary rounded-xl"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-550">Coordinates (Lat, Lng) *</label>
              <div className="flex gap-1.5">
                <Input
                  type="text"
                  placeholder="Lat"
                  value={latitude !== undefined ? latitude.toFixed(6) : ""}
                  readOnly
                  className="h-9 text-xs border border-slate-200 bg-slate-50 rounded-xl flex-1 font-mono"
                />
                <Input
                  type="text"
                  placeholder="Lng"
                  value={longitude !== undefined ? longitude.toFixed(6) : ""}
                  readOnly
                  className="h-9 text-xs border border-slate-200 bg-slate-50 rounded-xl flex-1 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-zinc-900/40 p-3 rounded-xl border border-slate-100 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-1.5">
            <div className="flex items-center gap-2">
              <MapPin className="text-primary w-4.5 h-4.5 shrink-0" />
              <div>
                <p className="text-[11px] font-bold text-slate-800 dark:text-zinc-200">
                  Select Hub Point
                </p>
                <p className="text-[9px] text-slate-400 font-semibold leading-none">
                  Open Leaflet locator to drag/place the exact warehouse coordinates.
                </p>
              </div>
            </div>
            <Button
              type="button"
              onClick={() => setShowMap(true)}
              className="bg-primary hover:bg-[#064e3b] text-white font-bold text-[10px] h-8 px-3 rounded-lg cursor-pointer flex items-center gap-1 shrink-0"
            >
              <MapPin size={12} />
              <span>Map Locator</span>
            </Button>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-50 dark:border-zinc-850">
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-[#064e3b] hover:bg-[#064e3b]/95 text-white font-bold h-9 px-5 rounded-xl cursor-pointer text-xs flex items-center gap-1.5"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Configuring Hub...</span>
                </>
              ) : (
                <span>Save Config & Enter</span>
              )}
            </Button>
          </div>
        </form>
      </div>

      {showMap && (
        <LocationMapModal
          initialLat={latitude}
          initialLng={longitude}
          onClose={() => setShowMap(false)}
          onConfirm={handleMapConfirm}
        />
      )}
    </div>
  );
}
