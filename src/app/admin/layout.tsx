import AppShell from "@/components/layout/AppShell";
import AdminTabs from "@/components/admin/AdminTabs";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell title="Administración">
      <AdminTabs />
      {children}
    </AppShell>
  );
}
