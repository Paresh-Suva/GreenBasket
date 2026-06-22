"use client";
 
import React, { useState, useEffect, useRef } from "react";
import { Search, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { productsService } from "@/services/products.service";
import { ProductSummary } from "@/types";
import { getFullImageUrl } from "@/services/api";
 
interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
}
 
export function SearchBar({
  placeholder = "Search for fruits, vegetables, drinks...",
  onSearch,
  className = ""
}: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("search") || "");
  const [suggestions, setSuggestions] = useState<ProductSummary[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const containerRef = useRef<HTMLFormElement>(null);
 
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuery(searchParams.get("search") || "");
  }, [searchParams]);
 
  // Debounce query input and fetch suggestions
  useEffect(() => {
    if (query.trim().length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSuggestions([]);
      return;
    }
 
    const handler = setTimeout(async () => {
      try {
        setLoadingSuggestions(true);
        const res = await productsService.getProducts({ search: query.trim(), size: 5 });
        setSuggestions(res.data.content || []);
      } catch (err) {
        console.error("Failed to load search suggestions", err);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 300);
 
    return () => clearTimeout(handler);
  }, [query]);
 
  // Click outside to close overlay
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);
 
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    setShowSuggestions(false);
    if (onSearch) {
      onSearch(trimmed);
    } else {
      if (trimmed) {
        router.push(`/products?search=${encodeURIComponent(trimmed)}`);
      } else {
        router.push("/products");
      }
    }
  };
 
  return (
    <form
      ref={containerRef}
      onSubmit={handleSubmit}
      className={`relative flex items-center w-full h-full ${className}`}
    >
      <div className="relative flex-1 flex items-center h-full">
        <Search className="absolute left-4 text-slate-400 w-5 h-5 pointer-events-none" />
        <input
          type="text"
          value={query}
          onFocus={() => setShowSuggestions(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          placeholder={placeholder}
          className="w-full pl-12 pr-14 h-full border border-slate-200 rounded-full bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#064e3b] focus:ring-2 focus:ring-[#064e3b]/10 transition-all duration-200 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
        />
        <button 
          type="submit" 
          className="absolute right-1.5 top-[5px] w-[40px] h-[40px] bg-[#064e3b] text-white rounded-full flex items-center justify-center hover:bg-[#064e3b]/90 transition-colors cursor-pointer"
        >
          <Search size={18} />
        </button>
      </div>
 
      {/* Suggestions Dropdown Overlay */}
      {showSuggestions && query.trim().length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-md border border-slate-100 rounded-[16px] shadow-xl z-50 max-h-[300px] overflow-y-auto overflow-x-hidden p-2 flex flex-col gap-1">
          {loadingSuggestions ? (
            <div className="flex items-center justify-center py-6 gap-2 text-slate-400 text-xs font-semibold">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span>Searching products...</span>
            </div>
          ) : suggestions.length > 0 ? (
            <>
              <div className="text-[10px] text-slate-400 font-bold px-3 py-1 uppercase tracking-wider border-b border-slate-50 mb-1">
                Matching Products
              </div>
              {suggestions.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    router.push(`/products/${item.slug}`);
                    setShowSuggestions(false);
                    setQuery("");
                  }}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center p-0.5 shrink-0">
                      <img
                        src={getFullImageUrl(item.primaryImageUrl)}
                        alt={item.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold text-slate-800 line-clamp-1">{item.name}</span>
                      <span className="text-[10px] text-slate-400 font-semibold">{item.categoryName}</span>
                    </div>
                  </div>
                  <div className="text-xs font-black text-primary shrink-0">
                    {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(item.effectivePrice)}
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="text-center py-6 text-slate-400 text-xs font-semibold">
              No matching products found
            </div>
          )}
        </div>
      )}
    </form>
  );
}
