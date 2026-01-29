import * as SQLite from 'expo-sqlite';
import { Expense } from '../types/expense';

const db = SQLite.openDatabase('expenses.db');

/**
 * Init schema
 */
export const initExpenseDB = () => {
  db.transaction((tx) => {
    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS expenses (
        id TEXT PRIMARY KEY NOT NULL,
        pocketId TEXT NOT NULL,
        amount INTEGER NOT NULL,
        month TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        deletedAt TEXT
      );
    `);

    tx.executeSql(`
      CREATE INDEX IF NOT EXISTS idx_expenses_pocket_month
      ON expenses(pocketId, month);
    `);

    tx.executeSql(`
      CREATE INDEX IF NOT EXISTS idx_expenses_deletedAt
      ON expenses(deletedAt);
    `);
  });
};

/**
 * READ
 */
export const getExpenses = (): Promise<Expense[]> =>
  new Promise((resolve) => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM expenses',
        [],
        (_, result) => {
          resolve(result.rows._array as Expense[]);
        }
      );
    });
  });

/**
 * WRITE: add
 */
export const addExpense = (expense: Expense) => {
  db.transaction((tx) => {
    tx.executeSql(
      `
      INSERT INTO expenses
      (id, pocketId, amount, month, createdAt, deletedAt)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        expense.id,
        expense.pocketId,
        expense.amount,
        expense.month,
        expense.createdAt,
        expense.deletedAt ?? null,
      ]
    );
  });
};

/**
 * WRITE: soft delete
 */
export const softDeleteExpense = (
  expenseId: string,
  deletedAt: string
) => {
  db.transaction((tx) => {
    tx.executeSql(
      'UPDATE expenses SET deletedAt = ? WHERE id = ?',
      [deletedAt, expenseId]
    );
  });
};

/**
 * WRITE: restore
 */
export const restoreExpense = (expenseId: string) => {
  db.transaction((tx) => {
    tx.executeSql(
      'UPDATE expenses SET deletedAt = NULL WHERE id = ?',
      [expenseId]
    );
  });
};
