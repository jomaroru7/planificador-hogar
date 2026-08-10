import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { supabase } from "@/lib/supabase/client";
import type { TaskCompletionRow, TaskRow } from "@/types/database";

interface TasksState {
  items: TaskRow[];
  completions: TaskCompletionRow[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: TasksState = {
  items: [],
  completions: [],
  status: "idle",
  error: null,
};

export const fetchTasks = createAsyncThunk("tasks/fetchAll", async () => {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data;
});

export const fetchCompletionsInRange = createAsyncThunk(
  "tasks/fetchCompletionsInRange",
  async ({ startISO, endISO }: { startISO: string; endISO: string }) => {
    const { data, error } = await supabase
      .from("task_completions")
      .select("*")
      .gte("date", startISO)
      .lte("date", endISO);
    if (error) throw new Error(error.message);
    return data;
  },
);

export const addTask = createAsyncThunk(
  "tasks/add",
  async (task: Omit<TaskRow, "id" | "created_at">) => {
    const { data, error } = await supabase
      .from("tasks")
      .insert(task)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },
);

export const updateTask = createAsyncThunk(
  "tasks/update",
  async ({ id, changes }: { id: string; changes: Partial<TaskRow> }) => {
    const { data, error } = await supabase
      .from("tasks")
      .update(changes)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },
);

export const deleteTask = createAsyncThunk("tasks/delete", async (id: string) => {
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return id;
});

export const setTaskCompletion = createAsyncThunk(
  "tasks/setCompletion",
  async ({
    taskId,
    date,
    completed,
  }: {
    taskId: string;
    date: string;
    completed: boolean;
  }) => {
    if (completed) {
      const { data, error } = await supabase
        .from("task_completions")
        .upsert({ task_id: taskId, date }, { onConflict: "task_id,date" })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return { completed: true as const, row: data };
    }
    const { error } = await supabase
      .from("task_completions")
      .delete()
      .eq("task_id", taskId)
      .eq("date", date);
    if (error) throw new Error(error.message);
    return { completed: false as const, taskId, date };
  },
);

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Error al cargar tareas";
      })
      .addCase(fetchCompletionsInRange.fulfilled, (state, action) => {
        const incoming = action.payload;
        const keys = new Set(incoming.map((c) => `${c.task_id}_${c.date}`));
        state.completions = [
          ...state.completions.filter((c) => !keys.has(`${c.task_id}_${c.date}`)),
          ...incoming,
        ];
      })
      .addCase(addTask.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const idx = state.items.findIndex((t) => t.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.items = state.items.filter((t) => t.id !== action.payload);
      })
      .addCase(setTaskCompletion.fulfilled, (state, action) => {
        if (action.payload.completed) {
          state.completions.push(action.payload.row);
        } else {
          state.completions = state.completions.filter(
            (c) =>
              !(
                c.task_id === action.payload.taskId &&
                c.date === action.payload.date
              ),
          );
        }
      });
  },
});

export default tasksSlice.reducer;
