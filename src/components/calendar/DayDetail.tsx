"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setTaskCompletion } from "@/store/slices/tasksSlice";
import { upsertMealPlanEntry, deleteMealPlanEntry } from "@/store/slices/mealPlanSlice";
import { addEvent, deleteEvent } from "@/store/slices/eventsSlice";
import { taskOccursOnDate } from "@/lib/dates";
import type { MealType } from "@/types/database";

const MEAL_TYPES: MealType[] = ["comida", "cena"];
const MEAL_TYPE_LABEL: Record<MealType, string> = {
  comida: "Comida",
  cena: "Cena",
};

export default function DayDetail({ isoDate }: { isoDate: string }) {
  const dispatch = useAppDispatch();
  const tasks = useAppSelector((state) => state.tasks.items);
  const completions = useAppSelector((state) => state.tasks.completions);
  const meals = useAppSelector((state) => state.meals.items);
  const mealPlan = useAppSelector((state) => state.mealPlan.items);
  const events = useAppSelector((state) => state.events.items);

  const [newEventTitle, setNewEventTitle] = useState("");

  const dayTasks = tasks.filter((task) => taskOccursOnDate(task, isoDate));
  const dayMealPlan = mealPlan.filter((entry) => entry.date === isoDate);
  const dayEvents = events.filter((event) => event.date === isoDate);

  function isDone(taskId: string) {
    return completions.some((c) => c.task_id === taskId && c.date === isoDate);
  }

  function entryForMealType(mealType: MealType) {
    return dayMealPlan.find((entry) => entry.meal_type === mealType);
  }

  function handleMealSelect(mealType: MealType, mealId: string) {
    const existing = entryForMealType(mealType);
    if (!mealId) {
      if (existing) dispatch(deleteMealPlanEntry(existing.id));
      return;
    }
    dispatch(
      upsertMealPlanEntry({
        id: existing?.id,
        date: isoDate,
        meal_type: mealType,
        meal_id: mealId,
        custom_text: null,
        notes: existing?.notes ?? null,
      }),
    );
  }

  function handleAddEvent() {
    const title = newEventTitle.trim();
    if (!title) return;
    dispatch(addEvent({ date: isoDate, title, description: null }));
    setNewEventTitle("");
  }

  return (
    <div className="mt-4 border-t border-neutral-200 pt-4 dark:border-neutral-800">
      <h3 className="mb-3 text-sm font-semibold">
        {format(parseISO(isoDate), "EEEE d 'de' MMMM", { locale: es })}
      </h3>

      <div className="mb-6">
        <h4 className="section-heading">Tareas</h4>
        {dayTasks.length === 0 ? (
          <p className="py-2 text-sm text-neutral-400">Sin tareas.</p>
        ) : (
          <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {dayTasks.map((task) => (
              <li key={task.id} className="flex items-center gap-3 py-2">
                <input
                  type="checkbox"
                  checked={isDone(task.id)}
                  onChange={(e) =>
                    dispatch(
                      setTaskCompletion({
                        taskId: task.id,
                        date: isoDate,
                        completed: e.target.checked,
                      }),
                    )
                  }
                  className="h-5 w-5 accent-neutral-900 dark:accent-white"
                />
                <span className={isDone(task.id) ? "text-neutral-400 line-through" : ""}>
                  {task.title}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mb-6">
        <h4 className="section-heading">Menú</h4>
        <div className="flex flex-col gap-3">
          {MEAL_TYPES.map((mealType) => (
            <div key={mealType}>
              <label className="field-label" htmlFor={`meal-${mealType}`}>
                {MEAL_TYPE_LABEL[mealType]}
              </label>
              <select
                id={`meal-${mealType}`}
                className="field-input"
                value={entryForMealType(mealType)?.meal_id ?? ""}
                onChange={(e) => handleMealSelect(mealType, e.target.value)}
              >
                <option value="">Sin especificar</option>
                {meals.map((meal) => (
                  <option key={meal.id} value={meal.id}>
                    {meal.name} ({meal.portions} raciones)
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="section-heading">Eventos</h4>
        {dayEvents.length > 0 && (
          <ul className="mb-2 divide-y divide-neutral-200 dark:divide-neutral-800">
            {dayEvents.map((event) => (
              <li key={event.id} className="flex items-center justify-between py-2">
                <span>{event.title}</span>
                <button
                  type="button"
                  onClick={() => dispatch(deleteEvent(event.id))}
                  className="text-xs text-neutral-400 hover:text-red-600"
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Nuevo evento…"
            value={newEventTitle}
            onChange={(e) => setNewEventTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddEvent()}
            className="field-input"
          />
          <button type="button" onClick={handleAddEvent} className="btn-secondary shrink-0">
            Añadir
          </button>
        </div>
      </div>
    </div>
  );
}
