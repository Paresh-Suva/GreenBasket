"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      
      {/* Top Footer Widgets */}
      <div className="container mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        
        {/* Brand Widget */}
        <div className="flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative w-8 h-8">
              <Image
                src="/images/Logo.png"
                alt="GreenBasket Logo"
                fill
                className="object-contain filter brightness-110"
              />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">
              Green<span className="text-primary">Basket</span>
            </span>
          </Link>
          <p className="text-slate-400 text-sm leading-relaxed">
            Your premium destination for fresh, organic, and locally sourced groceries. Delivered straight to your doorstep with love and care.
          </p>
          <div className="flex items-center gap-3 mt-2">
            <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-colors duration-300" aria-label="Facebook">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
              </svg>
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-colors duration-300" aria-label="Twitter">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-colors duration-300" aria-label="Instagram">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
          </div>
        </div>

        {/* Quick Links Widget */}
        <div>
          <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-6">
            Quick Links
          </h4>
          <ul className="flex flex-col gap-3.5 text-sm">
            <li>
              <Link href="/products" className="hover:text-primary transition-colors duration-300">
                Browse Products
              </Link>
            </li>
            <li>
              <Link href="/#categories" className="hover:text-primary transition-colors duration-300">
                Categories
              </Link>
            </li>

            <li>
              <Link href="/cart" className="hover:text-primary transition-colors duration-300">
                My Shopping Cart
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Info Widget */}
        <div>
          <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-6">
            Contact Us
          </h4>
          <ul className="flex flex-col gap-4 text-sm text-slate-400">
            <li className="flex items-start gap-3">
              <MapPin size={18} className="text-primary shrink-0 mt-0.5" />
              <span>123 Fresh Way, Orchard Valley, CA 90210</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone size={18} className="text-primary shrink-0" />
              <span>+1 (800) 555-0199</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail size={18} className="text-primary shrink-0" />
              <span>support@greenbasket.com</span>
            </li>
          </ul>
        </div>

        {/* Newsletter Widget */}
        <div>
          <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-6">
            Join Our Newsletter
          </h4>
          <p className="text-slate-400 text-sm leading-relaxed mb-4">
            Subscribe to get updates on special offers, fresh arrivals, and recipes.
          </p>
          <form onSubmit={(e) => e.preventDefault()} className="relative flex items-center">
            <Input
              type="email"
              placeholder="Your email address"
              className="bg-slate-800 border-slate-700 text-white rounded-full pr-12 focus:ring-primary"
            />
            <Button
              type="submit"
              size="icon"
              className="absolute right-1 w-8 h-8 rounded-full bg-primary hover:bg-primary/95 text-white"
            >
              <Send size={14} />
            </Button>
          </form>
        </div>

      </div>

      {/* Bottom Footer Credits */}
      <div className="border-t border-slate-800 py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-500 text-xs font-semibold">
          <span>
            © {new Date().getFullYear()} GreenBasket. All rights reserved.
          </span>
          <div className="flex items-center gap-2">
            <span className="bg-slate-800 text-slate-400 px-2 py-1 rounded">Visa</span>
            <span className="bg-slate-800 text-slate-400 px-2 py-1 rounded">Mastercard</span>
            <span className="bg-slate-800 text-slate-400 px-2 py-1 rounded">PayPal</span>
            <span className="bg-slate-800 text-slate-400 px-2 py-1 rounded">Apple Pay</span>
          </div>
        </div>
      </div>

    </footer>
  );
}
