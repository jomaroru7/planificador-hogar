"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { signOut } from "@/store/slices/authSlice";

export default function AppHeader({ title }: { title: string }) {
  const dispatch = useAppDispatch();
  const email = useAppSelector((state) => state.auth.user?.email);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/95">
      <h1 className="text-lg font-semibold">{title}</h1>
      {email && (
        <button
          type="button"
          onClick={() => dispatch(signOut())}
          className="text-xs text-neutral-500 underline-offset-4 hover:underline"
        >
          Salir ({email})
        </button>
      )}
    </header>
  );
}
