// src/db/income.adapter.ts
import { QuickSQLite } from 'react-native-quick-sqlite';
import { DB_NAME } from './db';
import { Income } from '../types/income';

/**
 * INSERT
 * Raw insert only. No defaults, no logic.
 */
export const insertIncomeRow = (income: Income) => {
  QuickSQLite.execute(
    DB_NAME,
    `
    INSERT INTO income (
      id,
      amount,
      source,
      month,
      date,
      createdAt,
      updatedAt,
      deletedAt,
      isDeleted
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      income.id,
      income.amount,          // always positive
      income.source,
      income.month,
      income.date,
      income.createdAt,
      income.updatedAt ?? null,
      income.deletedAt ?? null,
      income.deletedAt ? 1 : 0,
    ]
  );
};

/**
 * UPDATE
 * Used when editing income (amount, source, date, etc.)
 */
export const updateIncomeRow = (
  id: string,
  fields: Partial<Income>
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
    UPDATE income
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
export const markIncomeDeleted = (
  id: string,
  deletedAt: number
) => {
  QuickSQLite.execute(
    DB_NAME,
    `
    UPDATE income
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
export const restoreIncomeRow = (id: string) => {
  QuickSQLite.execute(
    DB_NAME,
    `
    UPDATE income
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
export const permanentlyDeleteIncomeRow = (id: string) => {
  QuickSQLite.execute(
    DB_NAME,
    `DELETE FROM income WHERE id = ?`,
    [id]
  );
};

/**
 * RAW READ
 * Store decides what to do with this.
 */
export const selectAllIncomeRaw = (): Income[] => {
  const res = QuickSQLite.execute(
    DB_NAME,
    `SELECT * FROM income`
  );

  return normalizeRows<Income>(res.rows);
};

/**
 * RAW READ (month filter)
 */
export const selectIncomeForMonthRaw = (
  month: string
): Income[] => {
  const res = QuickSQLite.execute(
    DB_NAME,
    `
    SELECT * FROM income
    WHERE month = ?
      AND isDeleted = 0
    `,
    [month]
  );

  return normalizeRows<Income>(res.rows);
};

/**
 * RAW READ (useful for cleanup jobs)
 */
export const selectDeletedIncomeRaw = (): Income[] => {
  const res = QuickSQLite.execute(
    DB_NAME,
    `
    SELECT * FROM income
    WHERE isDeleted = 1
    `
  );

  return normalizeRows<Income>(res.rows);
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
