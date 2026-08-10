"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import AppShell from "@/components/layout/AppShell";
import MonthGrid, { type DaySummary } from "@/components/calendar/MonthGrid";
import DayDetail from "@/components/calendar/DayDetail";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchTasks, fetchCompletionsInRange } from "@/store/slices/tasksSlice";
import { fetchMealPlanRange } from "@/store/slices/mealPlanSlice";
import { fetchMeals } from "@/store/slices/mealsSlice";
import { fetchEventsRange } from "@/store/slices/eventsSlice";
import { getCalendarGridDays, shiftMonth, taskOccursOnDate, todayISO } from "@/lib/dates";

export default function CalendarPage() {
  const dispatch = useAppDispatch();
  const [monthDate, setMonthDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => todayISO());

  const days = useMemo(() => getCalendarGridDays(monthDate), [monthDate]);
  const rangeStart = format(days[0], "yyyy-MM-dd");
  const rangeEnd = format(days[days.length - 1], "yyyy-MM-dd");

  const tasks = useAppSelector((state) => state.tasks.items);
  const completions = useAppSelector((state) => state.tasks.completions);
  const mealPlan = useAppSelector((state) => state.mealPlan.items);
  const meals = useAppSelector((state) => state.meals.items);
  const events = useAppSelector((state) => state.events.items);

  useEffect(() => {
    dispatch(fetchTasks());
    dispatch(fetchMeals());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchCompletionsInRange({ startISO: rangeStart, endISO: rangeEnd }));
    dispatch(fetchMealPlanRange({ startISO: rangeStart, endISO: rangeEnd }));
    dispatch(fetchEventsRange({ startISO: rangeStart, endISO: rangeEnd }));
  }, [dispatch, rangeStart, rangeEnd]);

  function summaryForDate(isoDate: string): DaySummary {
    const dayTasks = tasks.filter((task) => taskOccursOnDate(task, isoDate));
    const pendingTaskCount = dayTasks.filter(
      (task) => !completions.some((c) => c.task_id === task.id && c.date === isoDate),
    ).length;
    const mealLabels = mealPlan
      .filter((entry) => entry.date === isoDate)
      .map((entry) => entry.custom_text || meals.find((m) => m.id === entry.meal_id)?.name || "");
    const eventCount = events.filter((event) => event.date === isoDate).length;
    return {
      taskCount: dayTasks.length,
      pendingTaskCount,
      mealLabels,
      eventCount,
    };
  }

  return (
    <AppShell title="Calendario">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMonthDate((d) => shiftMonth(d, -1))}
          className="btn-secondary px-3 py-1.5"
          aria-label="Mes anterior"
        >
          ‹
        </button>
        <h2 className="text-base font-semibold capitalize">
          {format(monthDate, "MMMM yyyy", { locale: es })}
        </h2>
        <button
          type="button"
          onClick={() => setMonthDate((d) => shiftMonth(d, 1))}
          className="btn-secondary px-3 py-1.5"
          aria-label="Mes siguiente"
        >
          ›
        </button>
      </div>

      <MonthGrid
        monthDate={monthDate}
        days={days}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        summaryForDate={summaryForDate}
      />

      <DayDetail isoDate={selectedDate} />
    </AppShell>
  );
}
