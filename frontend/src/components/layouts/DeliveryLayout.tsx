import React from "react";

export function DeliveryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-muted/10 max-w-md mx-auto shadow-2xl relative border-x border-border">
      <header className="h-16 bg-primary text-primary-foreground flex items-center px-4 sticky top-0 z-50">
        <span className="font-bold text-lg">GB Delivery</span>
      </header>
      <main className="flex-1 p-4 overflow-auto pb-20">
        {children}
      </main>
      {/* Mobile Bottom Navigation */}
      <footer className="h-16 bg-card border-t border-border flex items-center justify-around px-2 fixed bottom-0 w-full max-w-md">
        <div className="flex flex-col items-center text-primary">
          <div className="w-6 h-6 bg-primary/20 rounded mb-1" />
          <span className="text-[10px] font-medium">Tasks</span>
        </div>
        <div className="flex flex-col items-center text-muted-foreground">
          <div className="w-6 h-6 bg-muted rounded mb-1" />
          <span className="text-[10px] font-medium">History</span>
        </div>
        <div className="flex flex-col items-center text-muted-foreground">
          <div className="w-6 h-6 bg-muted rounded mb-1" />
          <span className="text-[10px] font-medium">Profile</span>
        </div>
      </footer>
    </div>
  );
}
