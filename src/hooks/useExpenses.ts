import { useSyncExternalStore } from "react";
import { expenseStore } from "../store/expense/expenseStore.instance";

export function useExpenses() {
  return useSyncExternalStore(
    expenseStore.subscribe.bind(expenseStore),
    expenseStore.getSnapshot.bind(expenseStore)
  );
}
