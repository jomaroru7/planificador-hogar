import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { supabase } from "@/lib/supabase/client";
import type { MealPlanRow } from "@/types/database";

interface MealPlanState {
  items: MealPlanRow[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: MealPlanState = {
  items: [],
  status: "idle",
  error: null,
};

export const fetchMealPlanRange = createAsyncThunk(
  "mealPlan/fetchRange",
  async ({ startISO, endISO }: { startISO: string; endISO: string }) => {
    const { data, error } = await supabase
      .from("meal_plan")
      .select("*")
      .gte("date", startISO)
      .lte("date", endISO);
    if (error) throw new Error(error.message);
    return data;
  },
);

export const upsertMealPlanEntry = createAsyncThunk(
  "mealPlan/upsert",
  async (entry: Omit<MealPlanRow, "id" | "created_at"> & { id?: string }) => {
    const { data, error } = await supabase
      .from("meal_plan")
      .upsert(entry, { onConflict: "date,meal_type" })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },
);

export const deleteMealPlanEntry = createAsyncThunk(
  "mealPlan/delete",
  async (id: string) => {
    const { error } = await supabase.from("meal_plan").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return id;
  },
);

const mealPlanSlice = createSlice({
  name: "mealPlan",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMealPlanRange.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMealPlanRange.fulfilled, (state, action) => {
        state.status = "succeeded";
        const incoming = action.payload;
        const keys = new Set(incoming.map((e) => e.id));
        state.items = [
          ...state.items.filter((e) => !keys.has(e.id)),
          ...incoming,
        ];
      })
      .addCase(fetchMealPlanRange.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Error al cargar el menú";
      })
      .addCase(upsertMealPlanEntry.fulfilled, (state, action) => {
        const idx = state.items.findIndex((e) => e.id === action.payload.id);
        if (idx !== -1) {
          state.items[idx] = action.payload;
        } else {
          state.items.push(action.payload);
        }
      })
      .addCase(deleteMealPlanEntry.fulfilled, (state, action) => {
        state.items = state.items.filter((e) => e.id !== action.payload);
      });
  },
});

export default mealPlanSlice.reducer;
