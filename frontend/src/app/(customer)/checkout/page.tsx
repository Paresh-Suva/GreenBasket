"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addressesService } from "@/services/addresses.service";
import { ordersService } from "@/services/orders.service";
import { useCartStore } from "@/store/useCartStore";
import { walletService } from "@/services/wallet.service";
import { useAuthStore } from "@/store/useAuthStore";
import { Address, PaymentMethod } from "@/types";
import { LoadingState } from "@/components/ui/loading-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { MapPin, CreditCard, ShoppingCart, Check, Plus, Edit2, Trash2, Wallet } from "lucide-react";
import Image from "next/image";

export default function CheckoutPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { cart, fetchCart, clearCart, appliedCoupon, useWallet, setUseWallet, couponDiscountAmount, couponDiscountPercent, walletDiscountAmount } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();

  const [step, setStep] = useState(1); // 1: Address, 2: Payment, 3: Review
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
  const [notes, setNotes] = useState("");

  // Address Form States
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [area, setArea] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [landmark, setLandmark] = useState("");

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Fetch Addresses
  const { data: addressesRes, isLoading: isAddressesLoading } = useQuery({
    queryKey: ["addresses"],
    queryFn: () => addressesService.getAddresses()
  });

  // Fetch Wallet Balance
  const { data: walletSummaryRes } = useQuery({
    queryKey: ["wallet-summary"],
    queryFn: () => walletService.getWalletSummary(),
    enabled: isAuthenticated
  });

  const walletBalance = walletSummaryRes?.data?.balance ?? user?.walletBalance ?? 0;

  useEffect(() => {
    useCartStore.getState().recalculateTotals();
  }, [walletBalance]);

  const addresses = React.useMemo(() => addressesRes?.data || [], [addressesRes?.data]);

  const defaultAddressId = React.useMemo(() => {
    if (addresses.length === 0) return null;
    return addresses.find(a => a.isDefault)?.id || addresses[0].id;
  }, [addresses]);

  const activeAddressId = selectedAddressId ?? defaultAddressId;

  // Address Mutations
  const createAddressMutation = useMutation({
    mutationFn: (data: Omit<Address, "id" | "isDefault"> & { isDefault?: boolean }) =>
      addressesService.createAddress(data),
    onSuccess: (res) => {
      toast.success("Address added successfully");
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      setSelectedAddressId(res.data.id);
      resetAddressForm();
    },
    onError: () => toast.error("Failed to add address")
  });

  const updateAddressMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Omit<Address, "id"> }) =>
      addressesService.updateAddress(id, data),
    onSuccess: (res) => {
      toast.success("Address updated successfully");
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      setSelectedAddressId(res.data.id);
      resetAddressForm();
    },
    onError: () => toast.error("Failed to update address")
  });

  const deleteAddressMutation = useMutation({
    mutationFn: (id: number) => addressesService.deleteAddress(id),
    onSuccess: () => {
      toast.success("Address deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      if (selectedAddressId) setSelectedAddressId(null);
    },
    onError: () => toast.error("Failed to delete address")
  });

  // Place Order Mutation
  const placeOrderMutation = useMutation({
    mutationFn: () =>
      ordersService.placeOrder({
        deliveryAddressId: activeAddressId!,
        paymentMethod,
        notes: notes || undefined,
        couponCode: appliedCoupon || undefined,
        useWallet: useWallet || false
      }),
    onSuccess: (res) => {
      toast.success("Order placed successfully!");
      clearCart();
      const order = res.data;
      router.push(
        `/checkout/success?orderNumber=${order.orderNumber}&totalAmount=${order.totalAmount}&createdAt=${order.createdAt}`
      );
    },
    onError: (err) => {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message || "Failed to place order";
      toast.error(msg);
    }
  });

  const resetAddressForm = () => {
    setShowAddressForm(false);
    setEditingAddress(null);
    setFullName("");
    setPhone("");
    setAddressLine("");
    setArea("");
    setCity("");
    setState("");
    setPincode("");
    setLandmark("");
  };

  const handleEditAddress = (addr: Address) => {
    setEditingAddress(addr);
    // Parse label "FullName - Phone"
    const labelParts = addr.label.split(" - ");
    setFullName(labelParts[0] || "");
    setPhone(labelParts[1] || "");
    setAddressLine(addr.addressLine1);
    // Parse line2 "Area | Landmark: landmark"
    const line2Parts = (addr.addressLine2 || "").split(" | ");
    setArea(line2Parts[0] || "");
    setLandmark(line2Parts[1]?.replace("Landmark: ", "") || "");
    setCity(addr.city);
    setState(addr.state);
    setPincode(addr.postalCode);
    setShowAddressForm(true);
  };

  const handleSaveAddress = (e: React.FormEvent) => {
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
      isDefault: editingAddress ? editingAddress.isDefault : addresses.length === 0
    };

    if (editingAddress) {
      updateAddressMutation.mutate({ id: editingAddress.id, data: payload });
    } else {
      createAddressMutation.mutate(payload);
    }
  };

  if (!cart || isAddressesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingState text="Loading checkout details..." />
      </div>
    );
  }

  const items = cart.items || [];
  if (items.length === 0) {
    router.push("/cart");
    return null;
  }

  // Calculate pricing
  const subtotal = cart.subtotal;
  const deliveryThreshold = 35;
  const isFreeDelivery = subtotal >= deliveryThreshold;
  const deliveryFee = isFreeDelivery ? 0 : 4.99;
  const tax = subtotal * 0.08;
  const grandTotal = Math.max(0, subtotal - couponDiscountAmount + deliveryFee + tax - walletDiscountAmount);

  const selectedAddress = addresses.find(a => a.id === activeAddressId);

  return (
    <div className="max-w-7xl mx-auto py-4 text-left px-2">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-secondary tracking-tight mb-8">
        Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Checkout Steps (Left Column) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Step 1: Delivery Address */}
          <div className="bg-card border border-slate-100 rounded-2xl p-6 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-50 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs ${step >= 1 ? "bg-primary text-white" : "bg-slate-100 text-slate-400"}`}>
                  1
                </div>
                <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-1.5">
                  <MapPin size={18} className="text-primary" />
                  <span>Delivery Address</span>
                </h3>
              </div>
              {!showAddressForm && (
                <Button
                  onClick={() => { resetAddressForm(); setShowAddressForm(true); }}
                  variant="outline"
                  size="sm"
                  className="border-slate-200 text-slate-600 font-bold rounded-xl cursor-pointer hover:bg-slate-50 flex items-center gap-1 h-9"
                >
                  <Plus size={14} />
                  <span>Add New</span>
                </Button>
              )}
            </div>

            {showAddressForm ? (
              <form onSubmit={handleSaveAddress} className="flex flex-col gap-4">
                <h4 className="font-bold text-slate-800 text-sm">
                  {editingAddress ? "Edit Delivery Address" : "Add Delivery Address"}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-500">Full Name *</label>
                    <Input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="h-10 text-xs border border-slate-200 focus-visible:ring-primary focus-visible:border-primary rounded-xl"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-500">Phone Number *</label>
                    <Input
                      type="text"
                      placeholder="e.g. 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="h-10 text-xs border border-slate-200 focus-visible:ring-primary focus-visible:border-primary rounded-xl"
                    />
                  </div>
                  <div className="sm:col-span-2 flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-500">Address Line (House/Flat, Street) *</label>
                    <Input
                      type="text"
                      placeholder="e.g. Apartment 4B, Green Valley"
                      value={addressLine}
                      onChange={(e) => setAddressLine(e.target.value)}
                      className="h-10 text-xs border border-slate-200 focus-visible:ring-primary focus-visible:border-primary rounded-xl"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-500">Area / Colony</label>
                    <Input
                      type="text"
                      placeholder="e.g. Sector 15"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className="h-10 text-xs border border-slate-200 focus-visible:ring-primary focus-visible:border-primary rounded-xl"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-500">Landmark</label>
                    <Input
                      type="text"
                      placeholder="e.g. Near Rose Garden"
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
                    <label className="text-xs font-bold text-slate-500">Pincode *</label>
                    <Input
                      type="text"
                      placeholder="e.g. 110001"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="h-10 text-xs border border-slate-200 focus-visible:ring-primary focus-visible:border-primary rounded-xl"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-2">
                  <Button
                    type="button"
                    onClick={resetAddressForm}
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
              <div className="flex flex-col gap-3">
                {addresses.map((addr) => {
                  const isSelected = activeAddressId === addr.id;
                  const labelParts = addr.label.split(" - ");
                  const nameStr = labelParts[0] || "";
                  const phoneStr = labelParts[1] || "";
                  const line2Formatted = addr.addressLine2 ? addr.addressLine2.replace(" | ", ", ") : "";

                  return (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`border rounded-xl p-4 cursor-pointer relative transition-all flex flex-col gap-1 text-left ${isSelected ? "border-[#064e3b] bg-[#064e3b]/2 shadow-sm" : "border-slate-100 hover:border-slate-200"}`}
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

                      {/* Actions */}
                      <div className="absolute top-3 right-3 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleEditAddress(addr)}
                          className="p-1 rounded text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => deleteAddressMutation.mutate(addr.id)}
                          className="p-1 rounded text-slate-400 hover:text-red-500 cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      {isSelected && (
                        <div className="absolute bottom-3 right-3 bg-[#064e3b] text-white rounded-full p-0.5">
                          <Check size={12} className="stroke-[3px]" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-slate-400 text-sm font-semibold py-4 text-center">
                No delivery addresses found. Please add a new address to continue.
              </p>
            )}

            {step === 1 && !showAddressForm && (
              <Button
                disabled={!activeAddressId}
                onClick={() => setStep(2)}
                className="bg-[#064e3b] hover:bg-[#064e3b]/90 text-white font-bold h-10 px-6 rounded-xl mt-6 cursor-pointer"
              >
                Proceed to Payment
              </Button>
            )}
          </div>

          {/* Step 2: Payment Method */}
          <div className={`bg-card border border-slate-100 rounded-2xl p-6 shadow-2xs ${step < 2 ? "opacity-50 pointer-events-none" : ""}`}>
            <div className="flex items-center gap-2 border-b border-slate-50 pb-4 mb-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs ${step >= 2 ? "bg-primary text-white" : "bg-slate-100 text-slate-400"}`}>
                2
              </div>
              <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-1.5">
                <CreditCard size={18} className="text-primary" />
                <span>Payment Method</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Cash On Delivery */}
              <div
                onClick={() => setPaymentMethod("COD")}
                className={`border rounded-xl p-4 cursor-pointer relative transition-all flex items-center gap-3 text-left ${paymentMethod === "COD" ? "border-[#064e3b] bg-[#064e3b]/2 shadow-sm" : "border-slate-100 hover:border-slate-200"}`}
              >
                <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                  <Image src="/images/Logo.png" alt="COD" width={28} height={28} className="object-contain" />
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-slate-800 text-sm">Cash On Delivery</span>
                  <span className="text-[10px] font-bold text-slate-400">Pay when order arrives</span>
                </div>
                {paymentMethod === "COD" && (
                  <div className="absolute top-2 right-2 bg-[#064e3b] text-white rounded-full p-0.5">
                    <Check size={10} className="stroke-[3px]" />
                  </div>
                )}
              </div>

              {/* CARD Payment */}
              <div
                onClick={() => setPaymentMethod("CARD")}
                className={`border rounded-xl p-4 cursor-pointer relative transition-all flex items-center gap-3 text-left ${paymentMethod === "CARD" ? "border-[#064e3b] bg-[#064e3b]/2 shadow-sm" : "border-slate-100 hover:border-slate-200"}`}
              >
                <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                  <CreditCard className="text-slate-500 w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-slate-800 text-sm">Credit / Debit Card</span>
                  <span className="text-[10px] font-bold text-slate-400">Pay with Visa/Mastercard</span>
                </div>
                {paymentMethod === "CARD" && (
                  <div className="absolute top-2 right-2 bg-[#064e3b] text-white rounded-full p-0.5">
                    <Check size={10} className="stroke-[3px]" />
                  </div>
                )}
              </div>

              {/* UPI Payment */}
              <div
                onClick={() => setPaymentMethod("UPI")}
                className={`border rounded-xl p-4 cursor-pointer relative transition-all flex items-center gap-3 text-left ${paymentMethod === "UPI" ? "border-[#064e3b] bg-[#064e3b]/2 shadow-sm" : "border-slate-100 hover:border-slate-200"}`}
              >
                <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                  <span className="font-black text-xs text-slate-500">UPI</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-slate-800 text-sm">UPI Payment</span>
                  <span className="text-[10px] font-bold text-slate-400">Google Pay / PhonePe</span>
                </div>
                {paymentMethod === "UPI" && (
                  <div className="absolute top-2 right-2 bg-[#064e3b] text-white rounded-full p-0.5">
                    <Check size={10} className="stroke-[3px]" />
                  </div>
                )}
              </div>
            </div>

            {step === 2 && (
              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="border-slate-200 hover:bg-slate-50 text-slate-600 font-bold h-10 px-6 rounded-xl cursor-pointer"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  className="bg-[#064e3b] hover:bg-[#064e3b]/90 text-white font-bold h-10 px-6 rounded-xl cursor-pointer"
                >
                  Proceed to Review
                </Button>
              </div>
            )}
          </div>

          {/* Step 3: Order Review */}
          <div className={`bg-card border border-slate-100 rounded-2xl p-6 shadow-2xs ${step < 3 ? "opacity-50 pointer-events-none" : ""}`}>
            <div className="flex items-center gap-2 border-b border-slate-50 pb-4 mb-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs ${step >= 3 ? "bg-primary text-white" : "bg-slate-100 text-slate-400"}`}>
                3
              </div>
              <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-1.5">
                <ShoppingCart size={18} className="text-primary" />
                <span>Order Review</span>
              </h3>
            </div>

            {/* List Review Products */}
            <div className="flex flex-col divide-y divide-slate-50 mb-6">
              {items.map((item) => (
                <div key={item.itemId} className="flex justify-between items-center py-3 text-sm font-semibold">
                  <div className="flex flex-col text-left">
                    <span className="text-slate-800 font-bold">{item.productName}</span>
                    <span className="text-xs text-slate-400 font-medium">Qty: {item.quantity} x {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(item.unitPrice)}</span>
                  </div>
                  <span className="text-slate-800 font-bold">
                    {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(item.lineTotal)}
                  </span>
                </div>
              ))}
            </div>

            {/* Review Address and Payment summaries */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50/50 border border-slate-100 rounded-xl p-4 text-xs font-semibold leading-relaxed text-slate-600 mb-6">
              <div className="flex flex-col text-left gap-1">
                <span className="text-slate-800 font-bold border-b border-slate-100 pb-1.5 mb-1 flex items-center gap-1">
                  <MapPin size={14} className="text-primary" />
                  <span>Delivery Address</span>
                </span>
                {selectedAddress ? (
                  <>
                    <span className="font-bold text-slate-700">{selectedAddress.label.split(" - ")[0]}</span>
                    <span>{selectedAddress.addressLine1}</span>
                    <span>{selectedAddress.addressLine2 ? selectedAddress.addressLine2.replace(" | ", ", ") : ""}</span>
                    <span>{selectedAddress.city}, {selectedAddress.state} - {selectedAddress.postalCode}</span>
                    <span className="font-bold text-slate-400">Phone: {selectedAddress.label.split(" - ")[1]}</span>
                  </>
                ) : (
                  <span className="text-red-500">No address selected</span>
                )}
              </div>
              <div className="flex flex-col text-left gap-1">
                <span className="text-slate-800 font-bold border-b border-slate-100 pb-1.5 mb-1 flex items-center gap-1">
                  <CreditCard size={14} className="text-primary" />
                  <span>Payment Method</span>
                </span>
                <span className="font-bold text-slate-700 uppercase">{paymentMethod}</span>
                <span className="text-slate-400 leading-normal mt-0.5">
                  {paymentMethod === "COD" ? "Pay Cash on delivery" : paymentMethod === "CARD" ? "Online credit/debit card" : "Mobile UPI transfer"}
                </span>
              </div>
            </div>

            {/* Notes / Instructions Input */}
            <div className="flex flex-col gap-1 text-left mb-6">
              <label className="text-xs font-bold text-slate-500">Delivery Instructions / Notes (Optional)</label>
              <textarea
                placeholder="e.g. Leave package at the door, call before delivery"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary rounded-xl min-h-[70px] p-3 text-xs"
              />
            </div>

            {step === 3 && (
              <div className="flex gap-3">
                <Button
                  onClick={() => setStep(2)}
                  variant="outline"
                  className="border-slate-200 hover:bg-slate-50 text-slate-600 font-bold h-10 px-6 rounded-xl cursor-pointer"
                >
                  Back
                </Button>
              </div>
            )}
          </div>

        </div>

        {/* Pricing Summary Sidebar (Right Column) */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-slate-100 rounded-2xl p-6 shadow-2xs flex flex-col gap-6 text-left">
            <h3 className="font-bold text-slate-800 text-lg">Checkout Summary</h3>

            {/* Wallet Apply Option */}
            {walletBalance > 0 && (
              <div className="border-b border-slate-100 pb-2">
                <label className="flex items-center gap-2 cursor-pointer select-none bg-slate-50 border border-slate-100 rounded-xl p-3 hover:bg-[#064e3b]/5 hover:border-[#064e3b]/10 transition-colors">
                  <input
                    type="checkbox"
                    checked={useWallet}
                    onChange={(e) => setUseWallet(e.target.checked)}
                    className="rounded border-slate-300 text-[#064e3b] focus:ring-[#064e3b] w-4 h-4 cursor-pointer"
                  />
                  <div className="flex flex-col text-left text-xs font-semibold text-slate-700">
                    <span className="flex items-center gap-1 font-bold text-slate-855">
                      <Wallet size={14} className="text-[#064e3b]" />
                      <span>Use Wallet Balance</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold mt-0.5">
                      Available: {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(walletBalance)}
                    </span>
                  </div>
                </label>
              </div>
            )}

            {/* Pricing Rows */}
            <div className="flex flex-col gap-3 text-sm font-semibold border-b border-slate-100 pb-5">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(subtotal)}</span>
              </div>

              {couponDiscountAmount > 0 && (
                <div className="flex justify-between text-primary font-bold">
                  <span>Coupon Discount ({couponDiscountPercent}%)</span>
                  <span>-{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(couponDiscountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Delivery Fee</span>
                {isFreeDelivery ? (
                  <span className="text-primary font-bold">FREE</span>
                ) : (
                  <span>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(deliveryFee)}</span>
                )}
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Estimated Tax (8%)</span>
                <span>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(tax)}</span>
              </div>

              {useWallet && walletDiscountAmount > 0 && (
                <div className="flex justify-between text-[#064e3b] font-bold">
                  <span>Wallet Applied</span>
                  <span>-{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(walletDiscountAmount)}</span>
                </div>
              )}
            </div>

            {/* Grand Total */}
            <div className="flex justify-between items-baseline font-black">
              <span className="text-slate-800 text-base">Grand Total</span>
              <span className="text-2xl text-secondary">
                {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(grandTotal)}
              </span>
            </div>

            <Button
              onClick={() => placeOrderMutation.mutate()}
              disabled={step < 3 || !activeAddressId || placeOrderMutation.isPending}
              className="w-full bg-primary hover:bg-primary/95 text-white font-bold h-12 rounded-full flex items-center justify-center gap-2 shadow-md shadow-emerald-700/10 cursor-pointer mt-2"
            >
              <span>{placeOrderMutation.isPending ? "Placing Order..." : "Place Order"}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
