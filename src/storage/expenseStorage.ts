import AsyncStorage from '@react-native-async-storage/async-storage';
import { Expense } from '../types/expense';

const EXPENSES_KEY = 'USER_EXPENSES';

export const getExpenses = async (): Promise<Expense[]> => {
  const value = await AsyncStorage.getItem(EXPENSES_KEY);
  return value ? JSON.parse(value) : [];
};

export const addExpense = async (expense: Expense) => {
  const expenses = await getExpenses();
  await AsyncStorage.setItem(
    EXPENSES_KEY,
    JSON.stringify([...expenses, expense])
  );
};

// 🆕 HARD DELETE
export const deleteExpense = async (expenseId: string) => {
  const expenses = await getExpenses();

  const nextExpenses = expenses.filter(
    (e) => e.id !== expenseId
  );

  // avoid unnecessary write
  if (nextExpenses.length === expenses.length) return;

  await AsyncStorage.setItem(
    EXPENSES_KEY,
    JSON.stringify(nextExpenses)
  );
};

export const getExpensesByMonth = async (month: string) => {
  const expenses = await getExpenses();
  return expenses.filter((e) => e.month === month);
};

export const replaceAllExpenses = async (
  expenses: Expense[]
) => {
  await AsyncStorage.setItem(
    EXPENSES_KEY,
    JSON.stringify(expenses)
  );
};

