import { MainLayout } from "@/components/layouts/MainLayout";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <MainLayout>{children}</MainLayout>;
}
