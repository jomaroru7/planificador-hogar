"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchTasks } from "@/store/slices/tasksSlice";
import { fetchMeals } from "@/store/slices/mealsSlice";
import { fetchEventsRange } from "@/store/slices/eventsSlice";
import { todayISO } from "@/lib/dates";
import { addMonths, format } from "date-fns";

export default function AdminSummaryPage() {
  const dispatch = useAppDispatch();
  const tasks = useAppSelector((state) => state.tasks.items);
  const meals = useAppSelector((state) => state.meals.items);
  const events = useAppSelector((state) => state.events.items);

  useEffect(() => {
    const today = todayISO();
    dispatch(fetchTasks());
    dispatch(fetchMeals());
    dispatch(
      fetchEventsRange({ startISO: today, endISO: format(addMonths(new Date(), 2), "yyyy-MM-dd") }),
    );
  }, [dispatch]);

  const activeTasks = tasks.filter((t) => t.active).length;
  const totalPortions = meals.reduce((sum, m) => sum + m.portions, 0);

  return (
    <div>
      <p className="mb-6 text-sm text-neutral-500">
        Gestiona aquí el catálogo de tareas, comidas y eventos del hogar.
      </p>

      <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
        <li className="list-row justify-between">
          <Link href="/admin/tareas" className="hover:underline">
            Tareas activas
          </Link>
          <span className="tabular-nums text-neutral-500">{activeTasks}</span>
        </li>
        <li className="list-row justify-between">
          <Link href="/admin/comidas" className="hover:underline">
            Comidas en catálogo
          </Link>
          <span className="tabular-nums text-neutral-500">{meals.length}</span>
        </li>
        <li className="list-row justify-between">
          <Link href="/admin/comidas" className="hover:underline">
            Raciones congeladas
          </Link>
          <span className="tabular-nums text-neutral-500">{totalPortions}</span>
        </li>
        <li className="list-row justify-between">
          <Link href="/admin/eventos" className="hover:underline">
            Eventos próximos (2 meses)
          </Link>
          <span className="tabular-nums text-neutral-500">{events.length}</span>
        </li>
      </ul>
    </div>
  );
}
