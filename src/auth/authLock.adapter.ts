// src/auth/authLock.adapter.ts
import { QuickSQLite } from 'react-native-quick-sqlite';
import { DB_NAME } from '../db/db';

export const getGlobalPinHash = (): string | null => {
  const res = QuickSQLite.execute(
    DB_NAME,
    `SELECT pin_hash FROM auth_lock WHERE scope = 'GLOBAL' LIMIT 1`
  );

  if (!res.rows || res.rows.length === 0) return null;
  return res.rows.item(0).pin_hash;
};

export const saveGlobalPinHash = (pinHash: string) => {
  QuickSQLite.execute(
    DB_NAME,
    `
    INSERT OR REPLACE INTO auth_lock
      (scope, scope_id, pin_hash, created_at)
    VALUES
      ('GLOBAL', NULL, ?, ?)
    `,
    [pinHash, Date.now()]
  );
};
