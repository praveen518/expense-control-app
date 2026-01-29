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
