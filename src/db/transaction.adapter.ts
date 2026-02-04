import { QuickSQLite } from 'react-native-quick-sqlite';
import { DB_NAME } from './db';
import { Transaction } from '../types/transaction';

/* ================= INSERT ================= */

export const insertTransactionRow = (tx: Transaction) => {
  QuickSQLite.execute(
    DB_NAME,
    `
    INSERT INTO transactions (
      id,
      amount,
      type,
      pocketId,
      source,
      category,
      month,
      date,
      createdAt,
      updatedAt,
      deletedAt,
      isDeleted
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      tx.id,
      tx.amount,
      tx.type,
      tx.pocketId ?? null,
      tx.source ?? null,
      tx.category ?? null,
      tx.month,
      tx.date,
      tx.createdAt,
      tx.updatedAt ?? null,
      tx.deletedAt ?? null,
      tx.deletedAt ? 1 : 0,
    ]
  );
};

/* ================= SOFT DELETE ================= */

export const markTransactionDeleted = (
  id: string,
  deletedAt: number
) => {
  QuickSQLite.execute(
    DB_NAME,
    `
    UPDATE transactions
    SET deletedAt = ?, isDeleted = 1, updatedAt = ?
    WHERE id = ?
    `,
    [deletedAt, deletedAt, id]
  );
};

/* ================= HARD DELETE ================= */

export const permanentlyDeleteTransactionRow = (
  id: string
) => {
  QuickSQLite.execute(
    DB_NAME,
    `DELETE FROM transactions WHERE id = ?`,
    [id]
  );
};

/* ================= READS ================= */

export const selectAllTransactionsRaw =
  (): Transaction[] => {
    const res = QuickSQLite.execute(
      DB_NAME,
      `SELECT * FROM transactions`
    );
    return normalizeRows<Transaction>(res.rows);
  };

export const selectDeletedTransactionsRaw =
  (): Transaction[] => {
    const res = QuickSQLite.execute(
      DB_NAME,
      `SELECT * FROM transactions WHERE isDeleted = 1`
    );
    return normalizeRows<Transaction>(res.rows);
  };

export const updateTransactionRow = (
  id: string,
  fields: Partial<Transaction>
) => {
  const columns: string[] = [];
  const values: any[] = [];

  for (const [key, value] of Object.entries(fields)) {
    if (key === 'id') continue;
    columns.push(`${key} = ?`);
    values.push(value);
  }

  if (!columns.length) return;

  QuickSQLite.execute(
    DB_NAME,
    `
    UPDATE transactions
    SET ${columns.join(', ')}
    WHERE id = ?
    `,
    [...values, id]
  );
};

export const restoreTransactionRow = (id: string) => {
  QuickSQLite.execute(
    DB_NAME,
    `
    UPDATE transactions
    SET
      isDeleted = 0,
      deletedAt = NULL,
      updatedAt = ?
    WHERE id = ?
    `,
    [Date.now(), id]
  );
};


/* ================= utils ================= */

function normalizeRows<T>(
  rows?: { length: number; item: (i: number) => T }
): T[] {
  if (!rows) return [];
  return Array.from({ length: rows.length }, (_, i) =>
    rows.item(i)
  );
}
