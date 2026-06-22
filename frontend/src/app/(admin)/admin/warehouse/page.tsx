"use client";

import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { warehouseService, WarehouseConfig } from "@/services/warehouse.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { MapPin, Settings, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";

const LocationMapModal = dynamic(() => import("@/components/storefront/LocationMapModal"), {
  ssr: false,
});

export default function WarehouseConfigPage() {
  const queryClient = useQueryClient();
  const [showMap, setShowMap] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);

  // Fetch current warehouse config
  const { data: warehouseRes, isLoading } = useQuery({
    queryKey: ["warehouse-config"],
    queryFn: () => warehouseService.getWarehouse(),
  });

  const warehouse = warehouseRes?.data;

  // Initialize fields on load
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (warehouse) {
      setName(warehouse.name || "");
      setAddress(warehouse.address || "");
      setCity(warehouse.city || "");
      setState(warehouse.state || "");
      setPincode(warehouse.pincode || "");
      setContactNumber(warehouse.contactNumber || "");
      setLatitude(warehouse.latitude);
      setLongitude(warehouse.longitude);
    }
  }, [warehouse]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const saveMutation = useMutation({
    mutationFn: (data: WarehouseConfig) => warehouseService.saveWarehouse(data),
    onSuccess: () => {
      toast.success("Warehouse configuration saved permanently in database!");
      queryClient.invalidateQueries({ queryKey: ["warehouse-config"] });
    },
    onError: (err) => {
      console.error(err);
      toast.error("Failed to save warehouse configuration");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
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
      toast.error("Please fill in all fields and pin coordinates on map");
      return;
    }

    saveMutation.mutate({
      name,
      address,
      city,
      state,
      pincode,
      contactNumber,
      latitude,
      longitude,
    });
  };

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-[#064e3b]" />
          <span className="text-xs font-bold text-slate-500">Loading warehouse setup...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-6 shadow-sm max-w-3xl mx-auto text-left">
      <div className="flex items-center gap-2 border-b border-slate-50 dark:border-zinc-800/80 pb-4 mb-6">
        <Settings className="text-[#064e3b] w-5 h-5" />
        <h3 className="font-extrabold text-slate-800 dark:text-zinc-100 text-base">
          Warehouse Configuration Settings
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-500">Warehouse Name *</label>
            <Input
              type="text"
              placeholder="e.g. Bangalore Main Hub"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 text-xs border border-slate-200 focus-visible:ring-primary focus-visible:border-primary rounded-xl"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-500">Warehouse Contact Phone *</label>
            <Input
              type="text"
              placeholder="e.g. 0000000000"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              className="h-10 text-xs border border-slate-200 focus-visible:ring-primary focus-visible:border-primary rounded-xl"
            />
          </div>

          <div className="sm:col-span-2 flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-500">Street Address *</label>
            <Input
              type="text"
              placeholder="e.g. Plot 15, Outer Ring Road, Mahadevapura"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="h-10 text-xs border border-slate-200 focus-visible:ring-primary focus-visible:border-primary rounded-xl"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-500">City *</label>
            <Input
              type="text"
              placeholder="e.g. Bengaluru"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="h-10 text-xs border border-slate-200 focus-visible:ring-primary focus-visible:border-primary rounded-xl"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-500">State *</label>
            <Input
              type="text"
              placeholder="e.g. Karnataka"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="h-10 text-xs border border-slate-200 focus-visible:ring-primary focus-visible:border-primary rounded-xl"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-500">Pincode *</label>
            <Input
              type="text"
              placeholder="e.g. 560048"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              className="h-10 text-xs border border-slate-200 focus-visible:ring-primary focus-visible:border-primary rounded-xl"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-500">Coordinates (Latitude, Longitude) *</label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Latitude"
                value={latitude !== undefined ? latitude : ""}
                readOnly
                className="h-10 text-xs border border-slate-200 bg-slate-50 rounded-xl flex-1 font-mono"
              />
              <Input
                type="text"
                placeholder="Longitude"
                value={longitude !== undefined ? longitude : ""}
                readOnly
                className="h-10 text-xs border border-slate-200 bg-slate-50 rounded-xl flex-1 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Map Trigger panel */}
        <div className="bg-slate-50 dark:bg-zinc-900/40 p-4 rounded-xl border border-slate-100 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <MapPin className="text-primary w-5 h-5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                Pin Location on Map
              </p>
              <p className="text-[10px] text-slate-400 font-semibold leading-normal">
                Drag marker to get precise GPS coordinates of the warehouse hub.
              </p>
            </div>
          </div>
          <Button
            type="button"
            onClick={() => setShowMap(true)}
            className="bg-primary hover:bg-[#064e3b] text-white font-bold text-xs h-9 px-4 rounded-lg cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <MapPin size={14} />
            <span>Open Map Locator</span>
          </Button>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={saveMutation.isPending}
            className="bg-[#064e3b] hover:bg-[#064e3b]/95 text-white font-bold h-10 px-6 rounded-xl cursor-pointer text-xs"
          >
            {saveMutation.isPending ? "Saving configuration..." : "Save Warehouse Config"}
          </Button>
        </div>
      </form>

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
