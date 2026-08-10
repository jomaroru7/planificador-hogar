"use client";

import { useEffect, useState, type FormEvent } from "react";
import AppShell from "@/components/layout/AppShell";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addMeal, adjustPortions, fetchMeals } from "@/store/slices/mealsSlice";

export default function MealsPage() {
  const dispatch = useAppDispatch();
  const meals = useAppSelector((state) => state.meals.items);
  const status = useAppSelector((state) => state.meals.status);
  const [name, setName] = useState("");
  const [portions, setPortions] = useState(1);

  useEffect(() => {
    dispatch(fetchMeals());
  }, [dispatch]);

  function handleAdd(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    dispatch(
      addMeal({
        name: trimmed,
        category: null,
        portions,
        notes: null,
      }),
    );
    setName("");
    setPortions(1);
  }

  const totalPortions = meals.reduce((sum, meal) => sum + meal.portions, 0);

  return (
    <AppShell title="Comidas">
      <p className="mb-4 text-sm text-neutral-500">
        {totalPortions} ración{totalPortions === 1 ? "" : "es"} congelada
        {totalPortions === 1 ? "" : "s"} en total.
      </p>

      {status === "loading" && meals.length === 0 ? (
        <p className="py-4 text-sm text-neutral-400">Cargando…</p>
      ) : meals.length === 0 ? (
        <p className="py-4 text-sm text-neutral-400">
          Todavía no hay comidas guardadas. Añade la primera abajo.
        </p>
      ) : (
        <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {meals.map((meal) => (
            <li key={meal.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate">{meal.name}</p>
                {meal.notes && <p className="truncate text-xs text-neutral-400">{meal.notes}</p>}
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <button
                  type="button"
                  onClick={() => dispatch(adjustPortions({ id: meal.id, delta: -1 }))}
                  disabled={meal.portions === 0}
                  aria-label={`Quitar ración de ${meal.name}`}
                  className="btn-secondary h-8 w-8 p-0 text-lg leading-none disabled:opacity-30"
                >
                  −
                </button>
                <span className="w-6 text-center tabular-nums">{meal.portions}</span>
                <button
                  type="button"
                  onClick={() => dispatch(adjustPortions({ id: meal.id, delta: 1 }))}
                  aria-label={`Añadir ración de ${meal.name}`}
                  className="btn-secondary h-8 w-8 p-0 text-lg leading-none"
                >
                  +
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleAdd} className="mt-6 flex items-end gap-2 border-t border-neutral-200 pt-4 dark:border-neutral-800">
        <div className="flex-1">
          <label className="field-label" htmlFor="meal-name">
            Nueva comida
          </label>
          <input
            id="meal-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Lentejas"
            className="field-input"
          />
        </div>
        <div className="w-20">
          <label className="field-label" htmlFor="meal-portions">
            Raciones
          </label>
          <input
            id="meal-portions"
            type="number"
            min={0}
            value={portions}
            onChange={(e) => setPortions(Number(e.target.value))}
            className="field-input"
          />
        </div>
        <button type="submit" className="btn-primary shrink-0">
          Añadir
        </button>
      </form>
    </AppShell>
  );
}
