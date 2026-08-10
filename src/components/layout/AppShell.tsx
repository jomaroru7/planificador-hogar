import AuthGuard from "@/components/auth/AuthGuard";
import AppHeader from "@/components/layout/AppHeader";
import BottomNav from "@/components/layout/BottomNav";

export default function AppShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <AppHeader title={title} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-24 pt-4">
        {children}
      </main>
      <BottomNav />
    </AuthGuard>
  );
}
