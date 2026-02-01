// src/db/expense.adapter.ts
import { QuickSQLite } from 'react-native-quick-sqlite';
import { DB_NAME } from './db';
import { Expense } from '../types/expense';

/**
 * INSERT
 * Raw insert only. No defaults, no logic.
 */
export const insertExpenseRow = (expense: Expense) => {
  QuickSQLite.execute(
    DB_NAME,
    `
    INSERT INTO expenses (
      id,
      pocketId,
      amount,
      month,
      date,
      createdAt,
      updatedAt,
      deletedAt,
      isDeleted,
      note
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      expense.id,
      expense.pocketId,
      expense.amount,          // signed
      expense.month,
      expense.date ?? expense.createdAt,
      expense.createdAt,
      expense.updatedAt ?? null,
      expense.deletedAt ?? null,
      expense.deletedAt ? 1 : 0,
      expense.note ?? null,
    ]
  );
};

/**
 * UPDATE
 * Used when editing an expense (amount, note, pocket, date, etc.)
 */
export const updateExpenseRow = (
  id: string,
  fields: Partial<Expense>
) => {
  const columns: string[] = [];
  const values: any[] = [];

  for (const [key, value] of Object.entries(fields)) {
    columns.push(`${key} = ?`);
    values.push(value);
  }

  if (columns.length === 0) return;

  QuickSQLite.execute(
    DB_NAME,
    `
    UPDATE expenses
    SET ${columns.join(', ')},
        updatedAt = ?
    WHERE id = ?
    `,
    [...values, Date.now(), id]
  );
};

/**
 * SOFT DELETE
 */
export const markExpenseDeleted = (
  id: string,
  deletedAt: number
) => {
  QuickSQLite.execute(
    DB_NAME,
    `
    UPDATE expenses
    SET
      deletedAt = ?,
      isDeleted = 1,
      updatedAt = ?
    WHERE id = ?
    `,
    [deletedAt, deletedAt, id]
  );
};

/**
 * RESTORE (undo delete)
 */
export const restoreExpenseRow = (id: string) => {
  QuickSQLite.execute(
    DB_NAME,
    `
    UPDATE expenses
    SET
      deletedAt = NULL,
      isDeleted = 0,
      updatedAt = ?
    WHERE id = ?
    `,
    [Date.now(), id]
  );
};

/**
 * HARD DELETE (used only by cleanup jobs)
 */
export const permanentlyDeleteExpenseRow = (id: string) => {
  QuickSQLite.execute(
    DB_NAME,
    `DELETE FROM expenses WHERE id = ?`,
    [id]
  );
};

/**
 * RAW READ
 * Store decides what to do with this.
 */
export const selectAllExpensesRaw = (): Expense[] => {
  const res = QuickSQLite.execute(
    DB_NAME,
    `SELECT * FROM expenses`
  );

  return normalizeRows<Expense>(res.rows);
};

/**
 * RAW READ (useful for cleanup jobs)
 */
export const selectDeletedExpensesRaw = (): Expense[] => {
  const res = QuickSQLite.execute(
    DB_NAME,
    `
    SELECT * FROM expenses
    WHERE isDeleted = 1
    `
  );

  return normalizeRows<Expense>(res.rows);
};

/* ------------------ utils ------------------ */

function normalizeRows<T>(
  rows?: { length: number; item: (i: number) => T }
): T[] {
  if (!rows) return [];
  return Array.from({ length: rows.length }, (_, i) =>
    rows.item(i)
  );
}
