"use client";

import clsx from "clsx";
import { format, isSameMonth, isToday } from "date-fns";
import { es } from "date-fns/locale";

export interface DaySummary {
  taskCount: number;
  pendingTaskCount: number;
  mealLabels: string[];
  eventCount: number;
}

export default function MonthGrid({
  monthDate,
  days,
  selectedDate,
  onSelectDate,
  summaryForDate,
}: {
  monthDate: Date;
  days: Date[];
  selectedDate: string;
  onSelectDate: (isoDate: string) => void;
  summaryForDate: (isoDate: string) => DaySummary;
}) {
  const weekdayLabels = ["L", "M", "X", "J", "V", "S", "D"];

  return (
    <div>
      <div className="mb-1 grid grid-cols-7 text-center text-xs font-medium text-neutral-400">
        {weekdayLabels.map((label) => (
          <div key={label} className="py-1">
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 border-t border-l border-neutral-200 dark:border-neutral-800">
        {days.map((day) => {
          const iso = format(day, "yyyy-MM-dd");
          const summary = summaryForDate(iso);
          const inMonth = isSameMonth(day, monthDate);
          const selected = iso === selectedDate;

          return (
            <button
              key={iso}
              type="button"
              onClick={() => onSelectDate(iso)}
              className={clsx(
                "flex min-h-16 flex-col items-start gap-1 border-r border-b border-neutral-200 p-1.5 text-left dark:border-neutral-800",
                !inMonth && "text-neutral-300 dark:text-neutral-700",
                selected && "bg-neutral-100 dark:bg-neutral-900",
              )}
            >
              <span
                className={clsx(
                  "text-xs",
                  isToday(day) &&
                    "flex h-5 w-5 items-center justify-center bg-neutral-900 text-white dark:bg-white dark:text-neutral-900",
                )}
              >
                {format(day, "d", { locale: es })}
              </span>
              <div className="flex flex-wrap gap-0.5">
                {summary.pendingTaskCount > 0 && (
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" title="Tareas pendientes" />
                )}
                {summary.mealLabels.length > 0 && (
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" title="Menú planificado" />
                )}
                {summary.eventCount > 0 && (
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-600" title="Eventos" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
