// src/db/schema.ts
import { QuickSQLite } from 'react-native-quick-sqlite';
import { DB_NAME } from './db';

export const initExpenseDB = () => {
  QuickSQLite.execute(
    DB_NAME,
    `
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY NOT NULL,
      pocketId TEXT NOT NULL,
      amount INTEGER NOT NULL,
      month TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      deletedAt TEXT,
      note TEXT
    );
    `
  );

  try {
    QuickSQLite.execute(
      DB_NAME,
      `ALTER TABLE expenses ADD COLUMN note TEXT;`
    );
  } catch (e) {
    console.log(e);
    // Column already exists → ignore
  }

  QuickSQLite.execute(
    DB_NAME,
    `
    CREATE INDEX IF NOT EXISTS idx_expenses_pocket_month
    ON expenses(pocketId, month);
    `
  );

  QuickSQLite.execute(
    DB_NAME,
    `
    CREATE INDEX IF NOT EXISTS idx_expenses_deletedAt
    ON expenses(deletedAt);
    `
  );

  console.log('✅ expenses schema ready');
};
