import { AuthLayout as BaseAuthLayout } from "@/components/layouts/AuthLayout";
import { GuestGuard } from "@/components/guards/GuestGuard";

export default function AuthRouteLayout({ children }: { children: React.ReactNode }) {
  return (
    <GuestGuard>
      <BaseAuthLayout>{children}</BaseAuthLayout>
    </GuestGuard>
  );
}
