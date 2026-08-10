"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addTask, deleteTask, fetchTasks, updateTask } from "@/store/slices/tasksSlice";
import { todayISO } from "@/lib/dates";
import type { TaskRecurrence, TaskRow } from "@/types/database";

const RECURRENCE_LABEL: Record<TaskRecurrence, string> = {
  none: "Solo un día",
  daily: "Todos los días",
  weekly: "Días concretos de la semana",
  monthly: "Cada mes (mismo día)",
};

const WEEKDAYS = [
  { value: 1, label: "L" },
  { value: 2, label: "M" },
  { value: 3, label: "X" },
  { value: 4, label: "J" },
  { value: 5, label: "V" },
  { value: 6, label: "S" },
  { value: 0, label: "D" },
];

const emptyForm = {
  title: "",
  description: "",
  recurrence: "none" as TaskRecurrence,
  recurrenceDays: [] as number[],
  startDate: todayISO(),
  endDate: "",
  assignedTo: "",
};

export default function TasksAdminPage() {
  const dispatch = useAppDispatch();
  const tasks = useAppSelector((state) => state.tasks.items);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  function startEdit(task: TaskRow) {
    setEditingId(task.id);
    setForm({
      title: task.title,
      description: task.description ?? "",
      recurrence: task.recurrence,
      recurrenceDays: task.recurrence_days ?? [],
      startDate: task.start_date,
      endDate: task.end_date ?? "",
      assignedTo: task.assigned_to ?? "",
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function toggleWeekday(day: number) {
    setForm((f) => ({
      ...f,
      recurrenceDays: f.recurrenceDays.includes(day)
        ? f.recurrenceDays.filter((d) => d !== day)
        : [...f.recurrenceDays, day],
    }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const title = form.title.trim();
    if (!title) return;

    const payload = {
      title,
      description: form.description.trim() || null,
      recurrence: form.recurrence,
      recurrence_days: form.recurrence === "weekly" ? form.recurrenceDays : null,
      start_date: form.startDate,
      end_date: form.endDate || null,
      assigned_to: form.assignedTo.trim() || null,
      active: true,
    };

    if (editingId) {
      dispatch(updateTask({ id: editingId, changes: payload }));
    } else {
      dispatch(addTask(payload));
    }
    resetForm();
  }

  return (
    <div>
      <ul className="mb-6 divide-y divide-neutral-200 dark:divide-neutral-800">
        {tasks.length === 0 && (
          <li className="py-3 text-sm text-neutral-400">Todavía no hay tareas.</li>
        )}
        {tasks.map((task) => (
          <li key={task.id} className="flex items-center justify-between gap-3 py-3">
            <div className="min-w-0">
              <p className={task.active ? "truncate" : "truncate text-neutral-400"}>
                {task.title}
              </p>
              <p className="text-xs text-neutral-400">
                {RECURRENCE_LABEL[task.recurrence]}
                {task.assigned_to ? ` · ${task.assigned_to}` : ""}
              </p>
            </div>
            <div className="flex shrink-0 gap-3 text-xs">
              <button type="button" onClick={() => startEdit(task)} className="hover:underline">
                Editar
              </button>
              <button
                type="button"
                onClick={() =>
                  dispatch(updateTask({ id: task.id, changes: { active: !task.active } }))
                }
                className="hover:underline"
              >
                {task.active ? "Desactivar" : "Activar"}
              </button>
              <button
                type="button"
                onClick={() => dispatch(deleteTask(task.id))}
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
        <h3 className="section-heading">{editingId ? "Editar tarea" : "Nueva tarea"}</h3>

        <div>
          <label className="field-label" htmlFor="task-title">
            Título
          </label>
          <input
            id="task-title"
            className="field-input"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
        </div>

        <div>
          <label className="field-label" htmlFor="task-description">
            Descripción
          </label>
          <input
            id="task-description"
            className="field-input"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </div>

        <div>
          <label className="field-label" htmlFor="task-recurrence">
            Repetición
          </label>
          <select
            id="task-recurrence"
            className="field-input"
            value={form.recurrence}
            onChange={(e) =>
              setForm((f) => ({ ...f, recurrence: e.target.value as TaskRecurrence }))
            }
          >
            {Object.entries(RECURRENCE_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {form.recurrence === "weekly" && (
          <div className="flex gap-2">
            {WEEKDAYS.map((day) => (
              <button
                type="button"
                key={day.value}
                onClick={() => toggleWeekday(day.value)}
                className={
                  form.recurrenceDays.includes(day.value)
                    ? "btn-primary h-9 w-9 p-0 text-sm"
                    : "btn-secondary h-9 w-9 p-0 text-sm"
                }
              >
                {day.label}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="field-label" htmlFor="task-start">
              Desde
            </label>
            <input
              id="task-start"
              type="date"
              className="field-input"
              value={form.startDate}
              onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
            />
          </div>
          <div className="flex-1">
            <label className="field-label" htmlFor="task-end">
              Hasta (opcional)
            </label>
            <input
              id="task-end"
              type="date"
              className="field-input"
              value={form.endDate}
              onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
            />
          </div>
        </div>

        <div>
          <label className="field-label" htmlFor="task-assigned">
            Asignada a (opcional)
          </label>
          <input
            id="task-assigned"
            className="field-input"
            value={form.assignedTo}
            onChange={(e) => setForm((f) => ({ ...f, assignedTo: e.target.value }))}
          />
        </div>

        <div className="flex gap-2">
          <button type="submit" className="btn-primary">
            {editingId ? "Guardar cambios" : "Añadir tarea"}
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
