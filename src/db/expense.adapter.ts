// src/db/expense.adapter.ts
import { QuickSQLite } from 'react-native-quick-sqlite';
import { DB_NAME } from './db';
import { Expense } from '../types/expense';

/**
 * READ: all expenses
 */
export const getExpenses = (): Expense[] => {
  const result = QuickSQLite.execute(
    DB_NAME,
    'SELECT * FROM expenses'
  );

  return normalizeRows<Expense>(result.rows);
};


/**
 * WRITE: add expense
 */
export const addExpense = (expense: Expense) => {
  QuickSQLite.execute(
    DB_NAME,
    `
    INSERT INTO expenses
      (id, pocketId, amount, month, createdAt, deletedAt, note)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      expense.id,
      expense.pocketId,
      expense.amount,
      expense.month,
      expense.createdAt,
      expense.deletedAt ?? null,
      expense.note ?? null
    ]
  );
};

/**
 * WRITE: soft delete
 */
export const softDeleteExpense = (
  expenseId: string,
  deletedAt: string
) => {
  QuickSQLite.execute(
    DB_NAME,
    'UPDATE expenses SET deletedAt = ? WHERE id = ?',
    [deletedAt, expenseId]
  );
};

/**
 * WRITE: restore expense
 */
export const restoreExpense = (expenseId: string) => {
  QuickSQLite.execute(
    DB_NAME,
    'UPDATE expenses SET deletedAt = NULL WHERE id = ?',
    [expenseId]
  );
};

export const getActiveExpenses = (): Expense[] => {
  const res = QuickSQLite.execute(
    DB_NAME,
    `
    SELECT * FROM expenses
    WHERE deletedAt IS NULL
    ORDER BY createdAt DESC
    `
  );

  if (!res.rows) return [];
  return Array.from({ length: res.rows.length }, (_, i) =>
    res.rows!.item(i) as Expense
  );
};

export const getDeletedExpenses = (): Expense[] => {
  const res = QuickSQLite.execute(
    DB_NAME,
    `
    SELECT * FROM expenses
    WHERE deletedAt IS NOT NULL
    ORDER BY deletedAt DESC
    `
  );

  if (!res.rows) return [];
  return Array.from({ length: res.rows.length }, (_, i) =>
    res.rows!.item(i) as Expense
  );
};


function normalizeRows<T>(rows?: { length: number; item: (i: number) => T }): T[] {
  if (!rows) return [];
  return Array.from({ length: rows.length }, (_, i) => rows.item(i));
}
