// Trimmed copy of the row shapes needed by the Telegram functions. Kept local
// (instead of importing from src/types/database.ts) so this directory can be
// deployed standalone with `supabase functions deploy`. Keep in sync by hand
// if the schema in docs/SUPABASE.md changes.

export type TaskRecurrence = "none" | "daily" | "weekly" | "monthly";
export type MealType = "comida" | "cena";

export interface TaskRow {
  id: string;
  title: string;
  recurrence: TaskRecurrence;
  recurrence_days: number[] | null;
  start_date: string;
  end_date: string | null;
  assigned_to: string | null;
  active: boolean;
}

export interface TaskCompletionRow {
  task_id: string;
  date: string;
}

export interface MealRow {
  id: string;
  name: string;
}

export interface MealPlanRow {
  meal_type: MealType;
  meal_id: string | null;
  custom_text: string | null;
}

export interface EventRow {
  title: string;
}

export interface TelegramSubscriberRow {
  id: string;
  user_id: string;
  chat_id: string;
  active: boolean;
}

export interface TelegramLinkCodeRow {
  code: string;
  user_id: string;
  expires_at: string;
}
