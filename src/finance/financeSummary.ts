import { expenseStore } from '../store/expense/expenseStore.instance';
// import { getSalary } from '../store/settingsStore';
import { getCurrentMonth } from '../utils/month';

/* =========================
   TOTAL BALANCE (ALL TIME)
   ========================= */

export function getTotalBalance(): number {
  const expenses = expenseStore.getSnapshot();

  return expenses
    .filter(e => !e.deletedAt)
    .reduce((sum, e) => sum + e.amount, 0);
}

/* =========================
   INCOME (THIS MONTH)
   ========================= */

export function getMonthlyIncome(month: string = getCurrentMonth()) {
  const expenses = expenseStore.getSnapshot();

  return expenses
    .filter(
      e =>
        !e.deletedAt &&
        e.month === month &&
        e.amount > 0
    )
    .reduce((sum, e) => sum + e.amount, 0);
}


/* =========================
   SPENT (THIS MONTH)
   ========================= */

export function getMonthlySpent(
  month: string = getCurrentMonth()
): number {
  const expenses = expenseStore.getSnapshot();

  return expenses
    .filter(
      e =>
        !e.deletedAt &&
        e.month === month &&
        e.amount < 0
    )
    .reduce((sum, e) => sum + Math.abs(e.amount), 0);
}
