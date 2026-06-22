"use client";

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, X, MapPin } from "lucide-react";

interface LocationMapModalProps {
  initialLat?: number;
  initialLng?: number;
  onClose: () => void;
  onConfirm: (
    lat: number,
    lng: number,
    addressInfo: {
      road: string;
      area: string;
      city: string;
      state: string;
      postcode: string;
    }
  ) => void;
}

export default function LocationMapModal({
  initialLat,
  initialLng,
  onClose,
  onConfirm,
}: LocationMapModalProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // default to Bangalore
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: initialLat || 12.9716,
    lng: initialLng || 77.5946,
  });

  const [isLoading, setIsLoading] = useState(false);

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Create map
    const map = L.map(mapContainerRef.current, {
      center: [coords.lat, coords.lng],
      zoom: 15,
      zoomControl: true,
    });
    mapRef.current = map;

    // Add TileLayer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // DivIcon for draggable marker
    const pinIcon = L.divIcon({
      html: `<div class="w-10 h-10 rounded-full bg-[#064e3b] border-2 border-white flex items-center justify-center text-white shadow-lg text-lg animate-bounce">📍</div>`,
      className: "",
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    // Create marker
    const marker = L.marker([coords.lat, coords.lng], {
      icon: pinIcon,
      draggable: true,
    }).addTo(map);
    markerRef.current = marker;

    // Listen to dragend
    marker.on("dragend", () => {
      const position = marker.getLatLng();
      setCoords({ lat: position.lat, lng: position.lng });
    });

    // Listen to map click
    map.on("click", (e) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      setCoords({ lat, lng });
    });

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update marker position if coordinates state changes externally
  useEffect(() => {
    if (markerRef.current && mapRef.current) {
      const curr = markerRef.current.getLatLng();
      if (curr.lat !== coords.lat || curr.lng !== coords.lng) {
        markerRef.current.setLatLng([coords.lat, coords.lng]);
        mapRef.current.panTo([coords.lat, coords.lng]);
      }
    }
  }, [coords]);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}&addressdetails=1`,
        {
          headers: {
            "Accept-Language": "en",
          },
        }
      );
      if (!response.ok) throw new Error("Reverse geocoding failed");
      const data = await response.json();
      const address = data.address || {};

      const road = address.road || address.suburb || address.neighbourhood || address.pedestrian || "";
      const areaName = address.suburb || address.village || address.county || address.residential || "";
      const cityName = address.city || address.town || address.state_district || "";
      const stateName = address.state || "";
      const postcode = address.postcode || "";

      onConfirm(coords.lat, coords.lng, {
        road,
        area: areaName,
        city: cityName,
        state: stateName,
        postcode,
      });
      toast.success("Exact coordinates verified and address resolved!");
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to reverse-geocode coordinates. Using manual coordinates.");
      onConfirm(coords.lat, coords.lng, {
        road: "",
        area: "",
        city: "",
        state: "",
        postcode: "",
      });
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[9999] p-4">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl border border-slate-100 dark:border-zinc-800 flex flex-col text-left">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-slate-50/50 dark:bg-zinc-900/50 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <MapPin className="text-primary w-5 h-5" />
            <h3 className="font-extrabold text-slate-800 dark:text-zinc-150 text-sm sm:text-base">
              Pin Exact Delivery Location
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 rounded-lg p-1 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Instructions */}
        <div className="px-6 py-3 bg-emerald-50/40 dark:bg-emerald-950/20 border-b border-slate-100 dark:border-zinc-800">
          <p className="text-[11px] font-bold text-[#064e3b] dark:text-emerald-400 leading-normal">
            📍 Drag the pin or click on the map to specify your exact doorstep point.
          </p>
        </div>

        {/* Map Container */}
        <div className="relative w-full h-[400px] bg-slate-100">
          <div ref={mapContainerRef} className="w-full h-full z-10" />
        </div>

        {/* Coordinates status & confirm */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 dark:bg-zinc-900/50">
          <div className="text-left font-mono text-[10px] text-slate-500 dark:text-zinc-400">
            Coordinates: {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
          </div>
          <div className="flex justify-end gap-3 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-9 px-4 text-xs font-bold border-slate-200 text-slate-500 rounded-xl cursor-pointer hover:bg-slate-100"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={isLoading}
              className="bg-primary hover:bg-[#064e3b]/95 text-white font-bold h-9 px-4 rounded-xl cursor-pointer text-xs flex items-center gap-1.5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Verifying Address...</span>
                </>
              ) : (
                <span>Confirm Delivery Point</span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
