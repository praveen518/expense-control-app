// src/db/db.ts
import { QuickSQLite } from 'react-native-quick-sqlite';

export const DB_NAME = 'expenses.db';

let isOpen = false;

export function openDB() {
  if (isOpen) return;

  QuickSQLite.open(DB_NAME);
  isOpen = true;

  console.log('✅ SQLite opened:', DB_NAME);
}
