"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import { useAppDispatch } from "@/store/hooks";
import { initAuth, sessionChanged } from "@/store/slices/authSlice";
import { supabase } from "@/lib/supabase/client";

function AuthListener() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(initAuth());

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        dispatch(sessionChanged(session));
      },
    );

    return () => subscription.subscription.unsubscribe();
  }, [dispatch]);

  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthListener />
      {children}
    </Provider>
  );
}
