"use client";

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapTrackingOSRMProps {
  warehouseLat: number;
  warehouseLng: number;
  customerLat: number;
  customerLng: number;
  createdAt: string;
  orderStatus: string;
}

export default function MapTrackingOSRM({
  warehouseLat,
  warehouseLng,
  customerLat,
  customerLng,
  createdAt,
  orderStatus,
}: MapTrackingOSRMProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const bikeMarkerRef = useRef<L.Marker | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);

  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [progress, setProgress] = useState(0);

  // 1. Fetch OSRM Road Route
  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${warehouseLng},${warehouseLat};${customerLng},${customerLat}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch OSRM route");
        const data = await res.json();
        const coords = data.routes[0]?.geometry?.coordinates;
        if (coords && coords.length > 0) {
          // OSRM returns coordinates in [lng, lat] format. Leaflet needs [lat, lng].
          const formattedCoords = coords.map((c: [number, number]) => [
            c[1],
            c[0],
          ]) as [number, number][];
          setRouteCoords(formattedCoords);
        } else {
          // Fallback to straight line
          setRouteCoords([
            [warehouseLat, warehouseLng],
            [customerLat, customerLng],
          ]);
        }
      } catch (err) {
        console.error("OSRM Routing failed, falling back to straight line", err);
        setRouteCoords([
          [warehouseLat, warehouseLng],
          [customerLat, customerLng],
        ]);
      }
    };

    fetchRoute();
  }, [warehouseLat, warehouseLng, customerLat, customerLng]);

  // 2. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [warehouseLat, warehouseLng],
      zoom: 13,
      zoomControl: true,
    });
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Custom Icons
    const warehouseIcon = L.divIcon({
      html: `<div class="w-8 h-8 rounded-full bg-emerald-600 border-2 border-white flex items-center justify-center text-white shadow-md font-bold text-sm">🏪</div>`,
      className: "",
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const customerIcon = L.divIcon({
      html: `<div class="w-8 h-8 rounded-full bg-red-500 border-2 border-white flex items-center justify-center text-white shadow-md font-bold text-sm">📍</div>`,
      className: "",
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    L.marker([warehouseLat, warehouseLng], { icon: warehouseIcon })
      .addTo(map)
      .bindPopup("Warehouse Hub");

    L.marker([customerLat, customerLng], { icon: customerIcon })
      .addTo(map)
      .bindPopup("Delivery Destination");

    // DivIcon for bike marker
    const bikeIcon = L.divIcon({
      html: `<div class="w-9 h-9 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center text-white shadow-md text-lg animate-bounce">🛵</div>`,
      className: "",
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    const bikeMarker = L.marker([warehouseLat, warehouseLng], { icon: bikeIcon })
      .addTo(map)
      .bindPopup("GreenBasket Courier");
    bikeMarkerRef.current = bikeMarker;

    // Set bounds
    const bounds = L.latLngBounds([[warehouseLat, warehouseLng], [customerLat, customerLng]]);
    map.fitBounds(bounds, { padding: [55, 55] });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // 3. Draw and update Road Polyline when route coordinates load
  useEffect(() => {
    if (!mapRef.current || routeCoords.length === 0) return;

    if (routePolylineRef.current) {
      routePolylineRef.current.setLatLngs(routeCoords);
    } else {
      const polyline = L.polyline(routeCoords, {
        color: "#059669",
        weight: 5,
        opacity: 0.8,
      }).addTo(mapRef.current);
      routePolylineRef.current = polyline;
    }

    // Zoom map to show the entire road route path
    const bounds = L.polyline(routeCoords).getBounds();
    mapRef.current.fitBounds(bounds, { padding: [40, 40] });
  }, [routeCoords]);

  // 4. Progress ticker & Bike animation
  useEffect(() => {
    const updateProgress = () => {
      if (orderStatus === "DELIVERED") {
        setProgress(1);
        return;
      }
      if (
        orderStatus === "CANCELLED" ||
        orderStatus === "PENDING" ||
        orderStatus === "CONFIRMED" ||
        orderStatus === "PACKED"
      ) {
        setProgress(0);
        return;
      }

      // OUT_FOR_DELIVERY
      const startTime = new Date(createdAt).getTime() + 30000; // starts 30s after creation
      const duration = 20000; // 20 seconds journey
      const now = new Date().getTime();
      const elapsed = now - startTime;
      const computedProgress = Math.max(0, Math.min(1, elapsed / duration));
      setProgress(computedProgress);
    };

    updateProgress();
    const interval = setInterval(updateProgress, 250); // Tick progress frequently for smooth animation

    return () => clearInterval(interval);
  }, [orderStatus, createdAt]);

  // 5. Move bike marker along the actual road segments based on progress
  useEffect(() => {
    if (!bikeMarkerRef.current || routeCoords.length === 0 || !mapRef.current) return;

    const totalPoints = routeCoords.length;
    const targetIndexFloat = progress * (totalPoints - 1);
    const index = Math.floor(targetIndexFloat);
    const fraction = targetIndexFloat - index;

    let lat = routeCoords[index][0];
    let lng = routeCoords[index][1];

    if (index < totalPoints - 1) {
      const nextPoint = routeCoords[index + 1];
      lat = lat + (nextPoint[0] - lat) * fraction;
      lng = lng + (nextPoint[1] - lng) * fraction;
    }

    const currentPos: [number, number] = [lat, lng];
    bikeMarkerRef.current.setLatLng(currentPos);

    if (orderStatus === "OUT_FOR_DELIVERY" && progress > 0 && progress < 1) {
      mapRef.current.panTo(currentPos);
    }
  }, [progress, routeCoords, orderStatus]);

  return (
    <div className="w-full h-full rounded-xl overflow-hidden border border-slate-100 z-10 relative">
      <div ref={mapContainerRef} className="w-full h-full min-h-[350px]" />
    </div>
  );
}
