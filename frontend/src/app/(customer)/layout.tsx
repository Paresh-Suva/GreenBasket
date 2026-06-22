import { MainLayout } from "@/components/layouts/MainLayout";
import { AuthGuard } from "@/components/guards/AuthGuard";

export default function CustomerRouteLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={["CUSTOMER"]}>
      <MainLayout>{children}</MainLayout>
    </AuthGuard>
  );
}
