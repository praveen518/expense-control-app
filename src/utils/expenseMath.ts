import { Expense } from '../types/expense';

export const getSpentForPocketInMonth = (
  expenses: Expense[],
  pocketId: string,
  month: string
): number => {
  return expenses
    .filter(
      (e) => e.pocketId === pocketId && e.month === month
    )
    .reduce((sum, e) => sum + e.amount, 0);
};
