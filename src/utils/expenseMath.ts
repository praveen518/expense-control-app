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

export const getRemainingForPocketInMonth = (
  allocated: number,
  openingBalance: number,
  expenses: Expense[],
  pocketId: string,
  month: string
): number => {
  const spent = getSpentForPocketInMonth(
    expenses,
    pocketId,
    month
  );

  return allocated + openingBalance - spent;
};
