// src/db/schema.ts
import { QuickSQLite } from 'react-native-quick-sqlite';
import { DB_NAME } from './db';

export const initExpenseDB = () => {
  QuickSQLite.execute(DB_NAME, `
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY NOT NULL,
      pocketId TEXT NOT NULL,
      amount INTEGER NOT NULL,
      month TEXT NOT NULL,
      date INTEGER,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER,
      deletedAt INTEGER,
      isDeleted INTEGER DEFAULT 0,
      note TEXT
    );
  `);

  QuickSQLite.execute(DB_NAME, `
    CREATE INDEX IF NOT EXISTS idx_expenses_pocket_month
    ON expenses(pocketId, month);
  `);

  QuickSQLite.execute(DB_NAME, `
    CREATE INDEX IF NOT EXISTS idx_expenses_isDeleted
    ON expenses(isDeleted);
  `);

  console.log('✅ expenses schema v2 ready');
};
