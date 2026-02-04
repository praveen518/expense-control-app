import { Expense } from '../types/expense';

export function getSpentForPocketInMonth(
  expenses: Expense[],
  pocketId: string,
  month: string
) {
  return expenses
    .filter(
      (e) =>
        e.pocketId === pocketId &&
        e.month === month &&
        !e.deletedAt
    )
    .reduce(
      (sum, e) => sum + Math.abs(e.amount),
      0
    );
}


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
