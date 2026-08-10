import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { supabase } from "@/lib/supabase/client";
import type { EventRow } from "@/types/database";

interface EventsState {
  items: EventRow[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: EventsState = {
  items: [],
  status: "idle",
  error: null,
};

export const fetchEventsRange = createAsyncThunk(
  "events/fetchRange",
  async ({ startISO, endISO }: { startISO: string; endISO: string }) => {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .gte("date", startISO)
      .lte("date", endISO);
    if (error) throw new Error(error.message);
    return data;
  },
);

export const addEvent = createAsyncThunk(
  "events/add",
  async (event: Omit<EventRow, "id" | "created_at">) => {
    const { data, error } = await supabase
      .from("events")
      .insert(event)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },
);

export const updateEvent = createAsyncThunk(
  "events/update",
  async ({ id, changes }: { id: string; changes: Partial<EventRow> }) => {
    const { data, error } = await supabase
      .from("events")
      .update(changes)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },
);

export const deleteEvent = createAsyncThunk("events/delete", async (id: string) => {
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return id;
});

const eventsSlice = createSlice({
  name: "events",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEventsRange.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchEventsRange.fulfilled, (state, action) => {
        state.status = "succeeded";
        const incoming = action.payload;
        const keys = new Set(incoming.map((e) => e.id));
        state.items = [
          ...state.items.filter((e) => !keys.has(e.id)),
          ...incoming,
        ];
      })
      .addCase(fetchEventsRange.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Error al cargar eventos";
      })
      .addCase(addEvent.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        const idx = state.items.findIndex((e) => e.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.items = state.items.filter((e) => e.id !== action.payload);
      });
  },
});

export default eventsSlice.reducer;
