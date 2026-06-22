"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { LoadingState } from "@/components/ui/loading-state";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!isLoading && isAuthenticated && allowedRoles && user) {
      const hasRequiredRole = user.roles.some((role) => allowedRoles.includes(role));
      if (!hasRequiredRole) {
        // Redirect to a generalized forbidden page or home
        router.replace("/");
      }
    }
  }, [isAuthenticated, isLoading, router, pathname, allowedRoles, user]);

  if (isLoading || !isAuthenticated) {
    return <LoadingState fullScreen />;
  }

  if (allowedRoles && user) {
    const hasRequiredRole = user.roles.some((role) => allowedRoles.includes(role));
    if (!hasRequiredRole) {
      return <LoadingState fullScreen text="Checking permissions..." />;
    }
  }

  return <>{children}</>;
}
