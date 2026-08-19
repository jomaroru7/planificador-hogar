// Recurrence supported by household tasks.
export type TaskRecurrence = "none" | "daily" | "weekly" | "monthly";

export type MealType = "comida" | "cena";

export interface TaskRow {
  id: string;
  title: string;
  description: string | null;
  recurrence: TaskRecurrence;
  // For "weekly": 0 (domingo) - 6 (sábado).
  recurrence_days: number[] | null;
  start_date: string; // ISO date (yyyy-MM-dd)
  end_date: string | null;
  assigned_to: string | null;
  active: boolean;
  created_at: string;
}

export interface TaskCompletionRow {
  id: string;
  task_id: string;
  date: string; // ISO date
  completed_at: string;
}

export interface MealRow {
  id: string;
  name: string;
  category: MealType | "ambas" | null;
  portions: number;
  notes: string | null;
  created_at: string;
}

export interface MealPlanRow {
  id: string;
  date: string; // ISO date
  meal_type: MealType;
  meal_id: string | null;
  custom_text: string | null;
  notes: string | null;
  created_at: string;
}

export interface EventRow {
  id: string;
  date: string; // ISO date
  title: string;
  description: string | null;
  created_at: string;
}

// Telegram chat linked to a logged-in user, receives the daily digest / replies to /hoy.
export interface TelegramSubscriberRow {
  id: string;
  user_id: string;
  chat_id: string;
  active: boolean;
  created_at: string;
}

// Short-lived code a logged-in user generates in-app and sends to the bot via /vincular.
export interface TelegramLinkCodeRow {
  code: string;
  user_id: string;
  expires_at: string;
  created_at: string;
}

// Minimal typed schema so @supabase/supabase-js can type `.from(table)` calls.
export interface Database {
  public: {
    Tables: {
      tasks: {
        Row: TaskRow;
        Insert: Omit<TaskRow, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<TaskRow, "id" | "created_at">>;
        Relationships: [];
      };
      task_completions: {
        Row: TaskCompletionRow;
        Insert: Omit<TaskCompletionRow, "id" | "completed_at"> & {
          id?: string;
          completed_at?: string;
        };
        Update: Partial<Omit<TaskCompletionRow, "id">>;
        Relationships: [];
      };
      meals: {
        Row: MealRow;
        Insert: Omit<MealRow, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<MealRow, "id" | "created_at">>;
        Relationships: [];
      };
      meal_plan: {
        Row: MealPlanRow;
        Insert: Omit<MealPlanRow, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<MealPlanRow, "id" | "created_at">>;
        Relationships: [];
      };
      events: {
        Row: EventRow;
        Insert: Omit<EventRow, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<EventRow, "id" | "created_at">>;
        Relationships: [];
      };
      telegram_subscribers: {
        Row: TelegramSubscriberRow;
        Insert: Omit<TelegramSubscriberRow, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<TelegramSubscriberRow, "id" | "created_at">>;
        Relationships: [];
      };
      telegram_link_codes: {
        Row: TelegramLinkCodeRow;
        Insert: Omit<TelegramLinkCodeRow, "created_at"> & { created_at?: string };
        Update: Partial<TelegramLinkCodeRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}

