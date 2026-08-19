import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { supabase } from "@/lib/supabase/client";
import type { TelegramSubscriberRow } from "@/types/database";

const LINK_CODE_TTL_MINUTES = 15;

interface TelegramState {
  subscriber: TelegramSubscriberRow | null;
  linkCode: { code: string; expiresAt: string } | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: TelegramState = {
  subscriber: null,
  linkCode: null,
  status: "idle",
  error: null,
};

function generateCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sin caracteres ambiguos (0/O, 1/I)
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

export const fetchTelegramSubscription = createAsyncThunk(
  "telegram/fetchSubscription",
  async (userId: string) => {
    const { data, error } = await supabase
      .from("telegram_subscribers")
      .select("*")
      .eq("user_id", userId)
      .eq("active", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  },
);

export const generateTelegramLinkCode = createAsyncThunk(
  "telegram/generateLinkCode",
  async (userId: string) => {
    await supabase.from("telegram_link_codes").delete().eq("user_id", userId);

    const code = generateCode();
    const expiresAt = new Date(
      Date.now() + LINK_CODE_TTL_MINUTES * 60_000,
    ).toISOString();

    const { data, error } = await supabase
      .from("telegram_link_codes")
      .insert({ code, user_id: userId, expires_at: expiresAt })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { code: data.code, expiresAt: data.expires_at };
  },
);

export const unlinkTelegram = createAsyncThunk(
  "telegram/unlink",
  async (userId: string) => {
    const { error } = await supabase
      .from("telegram_subscribers")
      .delete()
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
  },
);

const telegramSlice = createSlice({
  name: "telegram",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTelegramSubscription.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchTelegramSubscription.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.subscriber = action.payload;
      })
      .addCase(fetchTelegramSubscription.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Error al comprobar la vinculación";
      })
      .addCase(generateTelegramLinkCode.fulfilled, (state, action) => {
        state.linkCode = action.payload;
      })
      .addCase(generateTelegramLinkCode.rejected, (state, action) => {
        state.error = action.error.message ?? "Error al generar el código";
      })
      .addCase(unlinkTelegram.fulfilled, (state) => {
        state.subscriber = null;
        state.linkCode = null;
      });
  },
});

export default telegramSlice.reducer;
