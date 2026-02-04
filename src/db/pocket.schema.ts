// src/db/pocket.schema.ts
import { QuickSQLite } from 'react-native-quick-sqlite';
import { DB_NAME } from './db';

export const initPocketDB = () => {
  QuickSQLite.execute(
    DB_NAME,
    `
    CREATE TABLE IF NOT EXISTS pockets (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      allocated INTEGER NOT NULL,
      createdAt TEXT NOT NULL
    );
    `
  );

  console.log('✅ pockets schema ready');
};
