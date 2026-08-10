"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addMeal, deleteMeal, fetchMeals, updateMeal } from "@/store/slices/mealsSlice";
import type { MealRow, MealType } from "@/types/database";

const CATEGORY_LABEL: Record<string, string> = {
  comida: "Comida",
  cena: "Cena",
  ambas: "Comida o cena",
};

const emptyForm = {
  name: "",
  category: "" as MealType | "ambas" | "",
  portions: 0,
  notes: "",
};

export default function MealsAdminPage() {
  const dispatch = useAppDispatch();
  const meals = useAppSelector((state) => state.meals.items);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    dispatch(fetchMeals());
  }, [dispatch]);

  function startEdit(meal: MealRow) {
    setEditingId(meal.id);
    setForm({
      name: meal.name,
      category: meal.category ?? "",
      portions: meal.portions,
      notes: meal.notes ?? "",
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) return;

    const payload = {
      name,
      category: form.category || null,
      portions: form.portions,
      notes: form.notes.trim() || null,
    };

    if (editingId) {
      dispatch(updateMeal({ id: editingId, changes: payload }));
    } else {
      dispatch(addMeal(payload));
    }
    resetForm();
  }

  return (
    <div>
      <ul className="mb-6 divide-y divide-neutral-200 dark:divide-neutral-800">
        {meals.length === 0 && (
          <li className="py-3 text-sm text-neutral-400">Todavía no hay comidas.</li>
        )}
        {meals.map((meal) => (
          <li key={meal.id} className="flex items-center justify-between gap-3 py-3">
            <div className="min-w-0">
              <p className="truncate">{meal.name}</p>
              <p className="text-xs text-neutral-400">
                {meal.category ? CATEGORY_LABEL[meal.category] : "Sin categoría"} ·{" "}
                {meal.portions} raciones
              </p>
            </div>
            <div className="flex shrink-0 gap-3 text-xs">
              <button type="button" onClick={() => startEdit(meal)} className="hover:underline">
                Editar
              </button>
              <button
                type="button"
                onClick={() => dispatch(deleteMeal(meal.id))}
                className="text-red-600 hover:underline"
              >
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 border-t border-neutral-200 pt-4 dark:border-neutral-800"
      >
        <h3 className="section-heading">{editingId ? "Editar comida" : "Nueva comida"}</h3>

        <div>
          <label className="field-label" htmlFor="meal-name">
            Nombre
          </label>
          <input
            id="meal-name"
            className="field-input"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="field-label" htmlFor="meal-category">
              Categoría
            </label>
            <select
              id="meal-category"
              className="field-input"
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({ ...f, category: e.target.value as MealType | "ambas" | "" }))
              }
            >
              <option value="">Sin categoría</option>
              <option value="comida">Comida</option>
              <option value="cena">Cena</option>
              <option value="ambas">Comida o cena</option>
            </select>
          </div>
          <div className="w-28">
            <label className="field-label" htmlFor="meal-portions">
              Raciones
            </label>
            <input
              id="meal-portions"
              type="number"
              min={0}
              className="field-input"
              value={form.portions}
              onChange={(e) => setForm((f) => ({ ...f, portions: Number(e.target.value) }))}
            />
          </div>
        </div>

        <div>
          <label className="field-label" htmlFor="meal-notes">
            Notas (opcional)
          </label>
          <input
            id="meal-notes"
            className="field-input"
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          />
        </div>

        <div className="flex gap-2">
          <button type="submit" className="btn-primary">
            {editingId ? "Guardar cambios" : "Añadir comida"}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="btn-secondary">
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
