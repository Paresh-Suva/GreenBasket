"use client";

import { AdminLayout } from "@/components/layouts/AdminLayout";
import { AuthGuard } from "@/components/guards/AuthGuard";

export default function AdminRouteLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={["ADMIN", "SUPER_ADMIN", "STAFF"]}>
      <AdminLayout>{children}</AdminLayout>
    </AuthGuard>
  );
}
