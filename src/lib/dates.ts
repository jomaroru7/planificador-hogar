import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getDate,
  getDay,
  isWithinInterval,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import type { TaskRow } from "@/types/database";

export const ISO_DATE_FORMAT = "yyyy-MM-dd";

export function toISODate(date: Date): string {
  return format(date, ISO_DATE_FORMAT);
}

export function todayISO(): string {
  return toISODate(new Date());
}

/** Days shown in a month grid, including the leading/trailing days of adjacent weeks. */
export function getCalendarGridDays(monthDate: Date): Date[] {
  const start = startOfWeek(startOfMonth(monthDate), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(monthDate), { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
}

export function shiftMonth(monthDate: Date, delta: number): Date {
  return addMonths(monthDate, delta);
}

/** Whether a recurring/one-off task has an occurrence on the given ISO date. */
export function taskOccursOnDate(task: TaskRow, isoDate: string): boolean {
  if (!task.active) return false;

  const date = parseISO(isoDate);
  const start = parseISO(task.start_date);
  if (date < start) return false;
  if (task.end_date && date > parseISO(task.end_date)) return false;

  switch (task.recurrence) {
    case "none":
      return task.start_date === isoDate;
    case "daily":
      return true;
    case "weekly": {
      const days = task.recurrence_days ?? [];
      return days.includes(getDay(date));
    }
    case "monthly":
      return getDate(date) === getDate(start);
    default:
      return false;
  }
}

export function isDateInRange(
  isoDate: string,
  rangeStartISO: string,
  rangeEndISO: string,
): boolean {
  const date = parseISO(isoDate);
  return isWithinInterval(date, {
    start: parseISO(rangeStartISO),
    end: parseISO(rangeEndISO),
  });
}
