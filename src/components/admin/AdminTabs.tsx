"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const TABS = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/tareas", label: "Tareas" },
  { href: "/admin/comidas", label: "Comidas" },
  { href: "/admin/eventos", label: "Eventos" },
] as const;

export default function AdminTabs() {
  const pathname = usePathname();

  return (
    <div className="mb-4 flex gap-4 overflow-x-auto border-b border-neutral-200 text-sm dark:border-neutral-800">
      {TABS.map(({ href, label }) => {
        const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={clsx(
              "shrink-0 border-b-2 py-2 whitespace-nowrap",
              active
                ? "border-neutral-900 font-medium text-neutral-900 dark:border-white dark:text-white"
                : "border-transparent text-neutral-400 hover:text-neutral-600",
            )}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
