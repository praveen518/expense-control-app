// src/db/pocket.adapter.ts
import { QuickSQLite } from 'react-native-quick-sqlite';
import { DB_NAME } from './db';
import { Pocket } from '../types/pocket';

export const getPockets = (): Pocket[] => {
  const res = QuickSQLite.execute(
    DB_NAME,
    `SELECT * FROM pockets`
  );

  if (!res.rows) return [];

  return Array.from(
    { length: res.rows.length },
    (_, i) => res.rows!.item(i) as Pocket
  );
};

export const addPocket = (pocket: Pocket) => {
  QuickSQLite.execute(
    DB_NAME,
    `
    INSERT INTO pockets (id, name, allocated, createdAt)
    VALUES (?, ?, ?, ?)
    `,
    [
      pocket.id,
      pocket.name,
      pocket.allocated,
      new Date().toISOString(),
    ]
  );
};

export const updatePocket = (pocket: Pocket) => {
  QuickSQLite.execute(
    DB_NAME,
    `
    UPDATE pockets
    SET name = ?, allocated = ?
    WHERE id = ?
    `,
    [pocket.name, pocket.allocated, pocket.id]
  );
};

export const deletePocket = (id: string) => {
  QuickSQLite.execute(
    DB_NAME,
    `DELETE FROM pockets WHERE id = ?`,
    [id]
  );
};
