import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { supabase } from "@/lib/supabase/client";
import type { MealRow } from "@/types/database";

interface MealsState {
  items: MealRow[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: MealsState = {
  items: [],
  status: "idle",
  error: null,
};

export const fetchMeals = createAsyncThunk("meals/fetchAll", async () => {
  const { data, error } = await supabase
    .from("meals")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return data;
});

export const addMeal = createAsyncThunk(
  "meals/add",
  async (meal: Omit<MealRow, "id" | "created_at">) => {
    const { data, error } = await supabase
      .from("meals")
      .insert(meal)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },
);

export const updateMeal = createAsyncThunk(
  "meals/update",
  async ({ id, changes }: { id: string; changes: Partial<MealRow> }) => {
    const { data, error } = await supabase
      .from("meals")
      .update(changes)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },
);

export const deleteMeal = createAsyncThunk("meals/delete", async (id: string) => {
  const { error } = await supabase.from("meals").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return id;
});

/** Increment/decrement the frozen-portions counter, clamped at 0. */
export const adjustPortions = createAsyncThunk(
  "meals/adjustPortions",
  async ({ id, delta }: { id: string; delta: number }, { getState }) => {
    const state = getState() as { meals: MealsState };
    const meal = state.meals.items.find((m) => m.id === id);
    const nextPortions = Math.max(0, (meal?.portions ?? 0) + delta);
    const { data, error } = await supabase
      .from("meals")
      .update({ portions: nextPortions })
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },
);

const mealsSlice = createSlice({
  name: "meals",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMeals.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMeals.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchMeals.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Error al cargar comidas";
      })
      .addCase(addMeal.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.items.sort((a, b) => a.name.localeCompare(b.name));
      })
      .addCase(updateMeal.fulfilled, (state, action) => {
        const idx = state.items.findIndex((m) => m.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(adjustPortions.fulfilled, (state, action) => {
        const idx = state.items.findIndex((m) => m.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteMeal.fulfilled, (state, action) => {
        state.items = state.items.filter((m) => m.id !== action.payload);
      });
  },
});

export default mealsSlice.reducer;
