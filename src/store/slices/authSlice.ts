import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";

interface AuthState {
  user: User | null;
  status: "loading" | "authenticated" | "unauthenticated";
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  status: "loading",
  error: null,
};

export const initAuth = createAsyncThunk("auth/init", async () => {
  const { data } = await supabase.auth.getSession();
  return data.session?.user ?? null;
});

export const signIn = createAsyncThunk(
  "auth/signIn",
  async ({ email, password }: { email: string; password: string }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw new Error(error.message);
    return data.user;
  },
);

export const signOut = createAsyncThunk("auth/signOut", async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    sessionChanged(state, action: PayloadAction<Session | null>) {
      state.user = action.payload?.user ?? null;
      state.status = action.payload ? "authenticated" : "unauthenticated";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initAuth.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = action.payload ? "authenticated" : "unauthenticated";
      })
      .addCase(signIn.pending, (state) => {
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = "authenticated";
      })
      .addCase(signIn.rejected, (state, action) => {
        state.error = action.error.message ?? "No se pudo iniciar sesión";
      })
      .addCase(signOut.fulfilled, (state) => {
        state.user = null;
        state.status = "unauthenticated";
      });
  },
});

export const { sessionChanged } = authSlice.actions;
export default authSlice.reducer;
