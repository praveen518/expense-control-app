import { transactionStore } from '../store/transaction/transactionStore.instance';
import { getCurrentMonth } from '../utils/month';

/* =========================
   TOTAL BALANCE (ALL TIME)
   ========================= */

export function getTotalBalance(): number {
  const transactions =
    transactionStore.getSnapshot();

  return transactions
    .filter(t => !t.isDeleted)
    .reduce((sum, t) => sum + t.amount, 0);
}

/* =========================
   INCOME (THIS MONTH)
   ========================= */

export function getMonthlyIncome(
  month: string = getCurrentMonth()
): number {
  const transactions =
    transactionStore.getSnapshot();

  return transactions
    .filter(
      t =>
        !t.isDeleted &&
        t.month === month &&
        t.amount > 0
    )
    .reduce((sum, t) => sum + t.amount, 0);
}

/* =========================
   SPENT (THIS MONTH)
   ========================= */

export function getMonthlySpent(
  month: string = getCurrentMonth()
): number {
  const transactions =
    transactionStore.getSnapshot();

  return transactions
    .filter(
      t =>
        !t.isDeleted &&
        t.month === month &&
        t.amount < 0
    )
    .reduce(
      (sum, t) => sum + Math.abs(t.amount),
      0
    );
}
