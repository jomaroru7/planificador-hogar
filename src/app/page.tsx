"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchTasks,
  fetchCompletionsInRange,
  setTaskCompletion,
} from "@/store/slices/tasksSlice";
import { fetchMealPlanRange } from "@/store/slices/mealPlanSlice";
import { fetchMeals } from "@/store/slices/mealsSlice";
import { fetchEventsRange } from "@/store/slices/eventsSlice";
import { taskOccursOnDate, todayISO } from "@/lib/dates";
import type { MealType } from "@/types/database";

const MEAL_TYPE_LABEL: Record<MealType, string> = {
  comida: "Comida",
  cena: "Cena",
};

export default function TodayPage() {
  const dispatch = useAppDispatch();
  const today = todayISO();

  const tasks = useAppSelector((state) => state.tasks.items);
  const completions = useAppSelector((state) => state.tasks.completions);
  const mealPlan = useAppSelector((state) => state.mealPlan.items);
  const meals = useAppSelector((state) => state.meals.items);
  const events = useAppSelector((state) => state.events.items);

  useEffect(() => {
    dispatch(fetchTasks());
    dispatch(fetchCompletionsInRange({ startISO: today, endISO: today }));
    dispatch(fetchMealPlanRange({ startISO: today, endISO: today }));
    dispatch(fetchMeals());
    dispatch(fetchEventsRange({ startISO: today, endISO: today }));
  }, [dispatch, today]);

  const todaysTasks = useMemo(
    () => tasks.filter((task) => taskOccursOnDate(task, today)),
    [tasks, today],
  );
  const todaysMealPlan = useMemo(
    () => mealPlan.filter((entry) => entry.date === today),
    [mealPlan, today],
  );
  const todaysEvents = useMemo(
    () => events.filter((event) => event.date === today),
    [events, today],
  );

  function isDone(taskId: string) {
    return completions.some((c) => c.task_id === taskId && c.date === today);
  }

  function mealName(mealId: string | null) {
    return meals.find((m) => m.id === mealId)?.name ?? null;
  }

  return (
    <AppShell title="Hoy">
      <section className="mb-8">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="section-heading">Tareas de hoy</h2>
          <Link href="/admin/tareas" className="text-xs text-neutral-500 hover:underline">
            Gestionar
          </Link>
        </div>
        {todaysTasks.length === 0 ? (
          <p className="py-3 text-sm text-neutral-400">No hay tareas para hoy.</p>
        ) : (
          <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {todaysTasks.map((task) => {
              const done = isDone(task.id);
              return (
                <li key={task.id} className="flex items-center gap-3 py-3">
                  <input
                    type="checkbox"
                    checked={done}
                    onChange={(e) =>
                      dispatch(
                        setTaskCompletion({
                          taskId: task.id,
                          date: today,
                          completed: e.target.checked,
                        }),
                      )
                    }
                    className="h-5 w-5 shrink-0 accent-neutral-900 dark:accent-white"
                  />
                  <div className="min-w-0">
                    <p className={done ? "truncate text-neutral-400 line-through" : "truncate"}>
                      {task.title}
                    </p>
                    {task.assigned_to && (
                      <p className="text-xs text-neutral-400">{task.assigned_to}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mb-8">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="section-heading">Menú de hoy</h2>
          <Link href="/calendario" className="text-xs text-neutral-500 hover:underline">
            Ver calendario
          </Link>
        </div>
        {todaysMealPlan.length === 0 ? (
          <p className="py-3 text-sm text-neutral-400">Todavía no hay menú planificado.</p>
        ) : (
          <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {todaysMealPlan.map((entry) => (
              <li key={entry.id} className="py-3">
                <p className="text-xs text-neutral-400">{MEAL_TYPE_LABEL[entry.meal_type]}</p>
                <p>{entry.custom_text || mealName(entry.meal_id) || "Sin especificar"}</p>
                {entry.notes && <p className="text-xs text-neutral-400">{entry.notes}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="section-heading mb-2">Otras cosas de hoy</h2>
        {todaysEvents.length === 0 ? (
          <p className="py-3 text-sm text-neutral-400">Sin eventos para hoy.</p>
        ) : (
          <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {todaysEvents.map((event) => (
              <li key={event.id} className="py-3">
                <p>{event.title}</p>
                {event.description && (
                  <p className="text-xs text-neutral-400">{event.description}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}
