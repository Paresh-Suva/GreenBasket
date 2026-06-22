"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { authService } from "@/services/auth.service";
import { LoadingState } from "@/components/ui/loading-state";

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { refreshSession, clearSession, isLoading } = useAuthStore();
  const initAttempted = useRef(false);

  useEffect(() => {
    const initAuth = async () => {
      if (initAttempted.current) return;
      initAttempted.current = true;

      const refreshToken = typeof window !== "undefined" ? localStorage.getItem("greenbasket_refresh_token") : null;
      if (!refreshToken) {
        clearSession();
        return;
      }

      try {
        // Attempt silent refresh using the stored refresh token
        const res = await authService.refresh(refreshToken);
        if (res.status === "success" && res.data) {
          refreshSession(res.data.accessToken, res.data.refreshToken || refreshToken, res.data.user);
        } else {
          clearSession();
        }
      } catch {
        // Failed to refresh (expired, revoked, etc)
        clearSession();
      }
    };

    initAuth();
  }, [refreshSession, clearSession]);

  if (isLoading) {
    return <LoadingState fullScreen text="Initializing application..." />;
  }

  return <>{children}</>;
}
