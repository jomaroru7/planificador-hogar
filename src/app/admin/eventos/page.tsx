"use client";

import { useEffect, useState, type FormEvent } from "react";
import { addMonths, format } from "date-fns";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addEvent, deleteEvent, fetchEventsRange } from "@/store/slices/eventsSlice";
import { todayISO } from "@/lib/dates";

const emptyForm = { date: todayISO(), title: "", description: "" };

export default function EventsAdminPage() {
  const dispatch = useAppDispatch();
  const events = useAppSelector((state) => state.events.items);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    dispatch(
      fetchEventsRange({
        startISO: format(addMonths(new Date(), -1), "yyyy-MM-dd"),
        endISO: format(addMonths(new Date(), 6), "yyyy-MM-dd"),
      }),
    );
  }, [dispatch]);

  const sortedEvents = [...events].sort((a, b) => a.date.localeCompare(b.date));

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const title = form.title.trim();
    if (!title || !form.date) return;
    dispatch(
      addEvent({
        date: form.date,
        title,
        description: form.description.trim() || null,
      }),
    );
    setForm(emptyForm);
  }

  return (
    <div>
      <ul className="mb-6 divide-y divide-neutral-200 dark:divide-neutral-800">
        {sortedEvents.length === 0 && (
          <li className="py-3 text-sm text-neutral-400">Sin eventos en este rango.</li>
        )}
        {sortedEvents.map((event) => (
          <li key={event.id} className="flex items-center justify-between gap-3 py-3">
            <div className="min-w-0">
              <p className="text-xs text-neutral-400">{event.date}</p>
              <p className="truncate">{event.title}</p>
            </div>
            <button
              type="button"
              onClick={() => dispatch(deleteEvent(event.id))}
              className="shrink-0 text-xs text-red-600 hover:underline"
            >
              Eliminar
            </button>
          </li>
        ))}
      </ul>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 border-t border-neutral-200 pt-4 dark:border-neutral-800"
      >
        <h3 className="section-heading">Nuevo evento</h3>
        <div>
          <label className="field-label" htmlFor="event-date">
            Fecha
          </label>
          <input
            id="event-date"
            type="date"
            className="field-input"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
          />
        </div>
        <div>
          <label className="field-label" htmlFor="event-title">
            Título
          </label>
          <input
            id="event-title"
            className="field-input"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
        </div>
        <div>
          <label className="field-label" htmlFor="event-description">
            Descripción (opcional)
          </label>
          <input
            id="event-description"
            className="field-input"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </div>
        <button type="submit" className="btn-primary">
          Añadir evento
        </button>
      </form>
    </div>
  );
}
