"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addressesService } from "@/services/addresses.service";
import { ProfileLayout } from "@/components/storefront/ProfileLayout";
import { LoadingState } from "@/components/ui/loading-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { MapPin, Plus, Edit2, Trash2, Check, ArrowLeft, Loader2 } from "lucide-react";
import { Address } from "@/types";
import dynamic from "next/dynamic";

const LocationMapModal = dynamic(() => import("@/components/storefront/LocationMapModal"), {
  ssr: false,
});
 
export default function UserAddressesPage() {
  const queryClient = useQueryClient();
 
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
 
  // Form Fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [area, setArea] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [landmark, setLandmark] = useState("");
  
  // Geolocation States
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [isLocating, setIsLocating] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapCenterCoords, setMapCenterCoords] = useState<{ lat?: number; lng?: number }>({});
 
  // Fetch Addresses
  const { data: addressesRes, isLoading } = useQuery({
    queryKey: ["addresses"],
    queryFn: () => addressesService.getAddresses()
  });
 
  const addresses = addressesRes?.data || [];
 
  // Address Mutations
  const createAddressMutation = useMutation({
    mutationFn: (data: Omit<Address, "id" | "isDefault"> & { isDefault?: boolean }) =>
      addressesService.createAddress(data),
    onSuccess: () => {
      toast.success("Address added successfully");
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      resetForm();
    },
    onError: () => toast.error("Failed to add address")
  });
 
  const updateAddressMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Omit<Address, "id"> }) =>
      addressesService.updateAddress(id, data),
    onSuccess: () => {
      toast.success("Address updated successfully");
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      resetForm();
    },
    onError: () => toast.error("Failed to update address")
  });
 
  const deleteAddressMutation = useMutation({
    mutationFn: (id: number) => addressesService.deleteAddress(id),
    onSuccess: () => {
      toast.success("Address deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
    onError: () => toast.error("Failed to delete address")
  });
 
  const setDefaultAddressMutation = useMutation({
    mutationFn: (id: number) => addressesService.setDefaultAddress(id),
    onSuccess: () => {
      toast.success("Default address updated");
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
    onError: () => toast.error("Failed to update default address")
  });
 
  const resetForm = () => {
    setShowForm(false);
    setEditingAddress(null);
    setFullName("");
    setPhone("");
    setAddressLine("");
    setArea("");
    setCity("");
    setState("");
    setPincode("");
    setLandmark("");
    setLatitude(undefined);
    setLongitude(undefined);
  };
 
  const handleEdit = (addr: Address) => {
    setEditingAddress(addr);
    const labelParts = addr.label.split(" - ");
    setFullName(labelParts[0] || "");
    setPhone(labelParts[1] || "");
    setAddressLine(addr.addressLine1);
    const line2Parts = (addr.addressLine2 || "").split(" | ");
    setArea(line2Parts[0] || "");
    setLandmark(line2Parts[1]?.replace("Landmark: ", "") || "");
    setCity(addr.city);
    setState(addr.state);
    setPincode(addr.postalCode);
    setLatitude(addr.latitude);
    setLongitude(addr.longitude);
    setShowForm(true);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lon } = position.coords;
        setMapCenterCoords({ lat, lng: lon });
        setShowMapModal(true);
        setIsLocating(false);
        toast.info("Opening map at your current location. Please verify/adjust the pin.");
      },
      (error) => {
        console.error(error);
        toast.error("Failed to access your location. Please check browser permissions.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleConfirmMapLocation = (
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
    if (addressInfo.road) setAddressLine(addressInfo.road);
    if (addressInfo.area) setArea(addressInfo.area);
    if (addressInfo.city) setCity(addressInfo.city);
    if (addressInfo.state) setState(addressInfo.state);
    if (addressInfo.postcode) setPincode(addressInfo.postcode);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !addressLine || !city || !state || !pincode) {
      toast.error("Please fill in all required fields");
      return;
    }

    const payload = {
      addressType: "HOME" as const,
      label: `${fullName.trim()} - ${phone.trim()}`,
      addressLine1: addressLine.trim(),
      addressLine2: `${area.trim()} | Landmark: ${landmark.trim()}`,
      city: city.trim(),
      state: state.trim(),
      postalCode: pincode.trim(),
      country: "India",
      latitude,
      longitude,
      isDefault: editingAddress ? editingAddress.isDefault : addresses.length === 0
    };

    if (editingAddress) {
      updateAddressMutation.mutate({ id: editingAddress.id, data: payload });
    } else {
      createAddressMutation.mutate(payload);
    }
  };

  if (isLoading) {
    return (
      <ProfileLayout>
        <div className="flex items-center justify-center min-h-[40vh]">
          <LoadingState text="Loading saved addresses..." />
        </div>
      </ProfileLayout>
    );
  }

  return (
    <ProfileLayout>
      <div className="bg-card border border-slate-100 rounded-2xl p-6 shadow-2xs text-left">
        <div className="flex items-center justify-between border-b border-slate-50 pb-4 mb-6">
          <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
            <MapPin size={18} className="text-primary" />
            <span>Manage Delivery Addresses</span>
          </h3>
          {!showForm && (
            <Button
              onClick={() => { resetForm(); setShowForm(true); }}
              variant="outline"
              size="sm"
              className="border-slate-200 text-slate-600 font-bold rounded-xl cursor-pointer hover:bg-slate-50 flex items-center gap-1 h-9"
            >
              <Plus size={14} />
              <span>Add Address</span>
            </Button>
          )}
        </div>

        {showForm ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex items-center gap-1.5 text-slate-600 hover:text-primary text-xs font-bold mb-2 cursor-pointer w-max" onClick={resetForm}>
              <ArrowLeft size={14} />
              <span>Back to addresses</span>
            </div>

            <h4 className="font-bold text-slate-800 text-sm">
              {editingAddress ? "Modify Saved Address" : "Register New Address"}
            </h4>

            {/* Geolocation & Map Selection Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 dark:bg-zinc-900/40 p-4 rounded-xl border border-slate-100 dark:border-zinc-800/80 mb-2">
              <div className="flex items-center gap-2">
                <MapPin className="text-primary w-5 h-5 shrink-0" />
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                    Set Delivery Location
                    {latitude && longitude && (
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 ml-2">
                        ({latitude.toFixed(4)}, {longitude.toFixed(4)})
                      </span>
                    )}
                  </p>
                  <p className="text-[10px] text-slate-400 font-semibold">Pin your exact address coordinates on map for delivery</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  onClick={() => {
                    setMapCenterCoords({ lat: latitude, lng: longitude });
                    setShowMapModal(true);
                  }}
                  className="bg-primary hover:bg-[#064e3b] text-white font-bold text-xs h-9 px-3.5 rounded-lg cursor-pointer flex items-center gap-1.5 animate-pulse"
                >
                  <MapPin size={14} />
                  <span>Choose Location On Map</span>
                </Button>
                <Button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={isLocating}
                  className="bg-slate-150 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold text-xs h-9 px-3.5 rounded-lg cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  {isLocating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Locating...</span>
                    </>
                  ) : (
                    <>
                      <MapPin size={14} className="text-slate-450" />
                      <span>Use Current Location</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500">Recipient Full Name *</label>
                <Input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-10 text-xs border border-slate-200 focus-visible:ring-primary focus-visible:border-primary rounded-xl"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500">Contact Number *</label>
                <Input
                  type="text"
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-10 text-xs border border-slate-200 focus-visible:ring-primary focus-visible:border-primary rounded-xl"
                />
              </div>
              <div className="sm:col-span-2 flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500">Address Details (Apartment, House No, Street) *</label>
                <Input
                  type="text"
                  placeholder="e.g. House No. 250, Sector 15-A"
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  className="h-10 text-xs border border-slate-200 focus-visible:ring-primary focus-visible:border-primary rounded-xl"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500">Colony / Area</label>
                <Input
                  type="text"
                  placeholder="e.g. Green Meadows"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="h-10 text-xs border border-slate-200 focus-visible:ring-primary focus-visible:border-primary rounded-xl"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500">Notable Landmark</label>
                <Input
                  type="text"
                  placeholder="e.g. Opposite Central Park"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  className="h-10 text-xs border border-slate-200 focus-visible:ring-primary focus-visible:border-primary rounded-xl"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500">City *</label>
                <Input
                  type="text"
                  placeholder="e.g. New Delhi"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="h-10 text-xs border border-slate-200 focus-visible:ring-primary focus-visible:border-primary rounded-xl"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500">State *</label>
                <Input
                  type="text"
                  placeholder="e.g. Delhi"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="h-10 text-xs border border-slate-200 focus-visible:ring-primary focus-visible:border-primary rounded-xl"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500">Postal / ZIP Code *</label>
                <Input
                  type="text"
                  placeholder="e.g. 110001"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="h-10 text-xs border border-slate-200 focus-visible:ring-primary focus-visible:border-primary rounded-xl"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <Button
                type="button"
                onClick={resetForm}
                variant="ghost"
                className="h-9 px-4 rounded-xl cursor-pointer text-slate-500 font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createAddressMutation.isPending || updateAddressMutation.isPending}
                className="bg-primary hover:bg-primary/95 text-white font-bold h-9 px-4 rounded-xl cursor-pointer"
              >
                Save Address
              </Button>
            </div>
          </form>
        ) : addresses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {addresses.map((addr) => {
              const labelParts = addr.label.split(" - ");
              const nameStr = labelParts[0] || "";
              const phoneStr = labelParts[1] || "";
              const line2Formatted = addr.addressLine2 ? addr.addressLine2.replace(" | ", ", ") : "";

              return (
                <div
                  key={addr.id}
                  className={`border rounded-xl p-4 relative transition-all flex flex-col gap-1 text-left ${addr.isDefault ? "border-[#064e3b] bg-[#064e3b]/2 shadow-sm" : "border-slate-100 hover:border-slate-200"}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-800 text-sm">{nameStr}</span>
                    {addr.isDefault && (
                      <span className="bg-emerald-50 text-primary border border-primary/20 px-2 py-0.5 rounded font-black text-[9px] uppercase tracking-wide">Default</span>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-slate-600 leading-normal">{addr.addressLine1}, {line2Formatted}</span>
                  <span className="text-xs font-semibold text-slate-600 leading-normal">{addr.city}, {addr.state} - {addr.postalCode}</span>
                  <span className="text-xs font-bold text-slate-400 mt-1">Phone: {phoneStr}</span>

                  <div className="flex items-center gap-4 mt-3 border-t border-slate-50 pt-3">
                    {!addr.isDefault && (
                      <button
                        onClick={() => setDefaultAddressMutation.mutate(addr.id)}
                        className="text-[10px] text-primary hover:underline font-extrabold uppercase tracking-wide cursor-pointer"
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(addr)}
                      className="text-[10px] text-slate-400 hover:text-slate-600 hover:underline font-extrabold uppercase tracking-wide cursor-pointer flex items-center gap-1"
                    >
                      <Edit2 size={11} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => deleteAddressMutation.mutate(addr.id)}
                      className="text-[10px] text-slate-400 hover:text-red-500 hover:underline font-extrabold uppercase tracking-wide cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 size={11} />
                      <span>Delete</span>
                    </button>
                  </div>

                  {addr.isDefault && (
                    <div className="absolute top-3 right-3 bg-[#064e3b] text-white rounded-full p-0.5">
                      <Check size={12} className="stroke-[3px]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 bg-slate-50/50 rounded-xl border border-slate-100/50 flex flex-col items-center gap-2">
            <MapPin size={32} className="text-slate-300" />
            <p className="text-slate-400 text-xs font-semibold">
              No registered addresses found. Add one to complete orders smoothly!
            </p>
          </div>
        )}
      </div>

      {showMapModal && (
        <LocationMapModal
          initialLat={mapCenterCoords.lat}
          initialLng={mapCenterCoords.lng}
          onClose={() => setShowMapModal(false)}
          onConfirm={handleConfirmMapLocation}
        />
      )}
    </ProfileLayout>
  );
}
