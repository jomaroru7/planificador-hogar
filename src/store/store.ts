import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import tasksReducer from "./slices/tasksSlice";
import mealsReducer from "./slices/mealsSlice";
import mealPlanReducer from "./slices/mealPlanSlice";
import eventsReducer from "./slices/eventsSlice";
import telegramReducer from "./slices/telegramSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: tasksReducer,
    meals: mealsReducer,
    mealPlan: mealPlanReducer,
    events: eventsReducer,
    telegram: telegramReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
