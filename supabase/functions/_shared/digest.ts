// deno-lint-ignore-file no-explicit-any
import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import type {
  EventRow,
  MealPlanRow,
  MealRow,
  TaskCompletionRow,
  TaskRow,
} from "./types.ts";

const WEEKDAY_LABELS = [
  "domingo",
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
];

const MONTH_LABELS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

const MEAL_TYPE_LABEL: Record<string, string> = {
  comida: "Comida",
  cena: "Cena",
};

/** "Today" in the household's timezone, as yyyy-MM-dd (ISO date strings sort/compare like dates). */
export function todayISOInMadrid(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(new Date());
}

function formatSpanishDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const weekday = WEEKDAY_LABELS[date.getUTCDay()];
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)} ${day} de ${MONTH_LABELS[month - 1]}`;
}

/** Port of src/lib/dates.ts#taskOccursOnDate (kept in sync by hand — no shared import across the Edge Function boundary). */
function taskOccursOnDate(task: TaskRow, isoDate: string): boolean {
  if (!task.active) return false;
  if (isoDate < task.start_date) return false;
  if (task.end_date && isoDate > task.end_date) return false;

  switch (task.recurrence) {
    case "none":
      return task.start_date === isoDate;
    case "daily":
      return true;
    case "weekly": {
      const days = task.recurrence_days ?? [];
      const dayOfWeek = new Date(`${isoDate}T00:00:00Z`).getUTCDay();
      return days.includes(dayOfWeek);
    }
    case "monthly":
      return Number(isoDate.slice(8, 10)) === Number(task.start_date.slice(8, 10));
    default:
      return false;
  }
}

/** Builds the Spanish-language daily digest text for a given ISO date. */
export async function buildDailyDigest(
  supabase: SupabaseClient<any>,
  isoDate: string,
): Promise<string> {
  const [tasksRes, completionsRes, mealPlanRes, mealsRes, eventsRes] = await Promise.all([
    supabase.from("tasks").select("*").eq("active", true),
    supabase.from("task_completions").select("task_id, date").eq("date", isoDate),
    supabase.from("meal_plan").select("meal_type, meal_id, custom_text").eq("date", isoDate),
    supabase.from("meals").select("id, name"),
    supabase.from("events").select("title").eq("date", isoDate),
  ]);

  const tasks = (tasksRes.data ?? []) as TaskRow[];
  const completions = (completionsRes.data ?? []) as TaskCompletionRow[];
  const mealPlan = (mealPlanRes.data ?? []) as MealPlanRow[];
  const meals = (mealsRes.data ?? []) as MealRow[];
  const events = (eventsRes.data ?? []) as EventRow[];

  const todaysTasks = tasks.filter((task) => taskOccursOnDate(task, isoDate));
  const doneTaskIds = new Set(completions.map((c) => c.task_id));
  const mealNameById = new Map(meals.map((m) => [m.id, m.name]));

  const lines: string[] = [`📅 ${formatSpanishDate(isoDate)}`, ""];

  lines.push("✅ Tareas de hoy");
  if (todaysTasks.length === 0) {
    lines.push("Sin tareas pendientes.");
  } else {
    for (const task of todaysTasks) {
      const mark = doneTaskIds.has(task.id) ? "✔️" : "▫️";
      const assignee = task.assigned_to ? ` (${task.assigned_to})` : "";
      lines.push(`${mark} ${task.title}${assignee}`);
    }
  }
  lines.push("");

  lines.push("🍽️ Menú de hoy");
  if (mealPlan.length === 0) {
    lines.push("Todavía no hay menú planificado.");
  } else {
    for (const entry of mealPlan) {
      const name =
        entry.custom_text || (entry.meal_id && mealNameById.get(entry.meal_id)) ||
        "Sin especificar";
      lines.push(`${MEAL_TYPE_LABEL[entry.meal_type] ?? entry.meal_type}: ${name}`);
    }
  }
  lines.push("");

  lines.push("📌 Otras cosas de hoy");
  if (events.length === 0) {
    lines.push("Sin eventos.");
  } else {
    for (const event of events) lines.push(`- ${event.title}`);
  }

  return lines.join("\n");
}
