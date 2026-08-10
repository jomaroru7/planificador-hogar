"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAppSelector } from "@/store/hooks";

/** Wrap authenticated pages with this so anonymous visitors land on /login. */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { status } = useAppSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-sm text-neutral-500">
        Cargando…
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return <>{children}</>;
}
