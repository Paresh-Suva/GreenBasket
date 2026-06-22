import React from "react";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full h-full min-h-screen">
      {children}
    </div>
  );
}
