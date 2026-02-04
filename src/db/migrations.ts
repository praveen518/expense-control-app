// src/db/migrations.ts
import { QuickSQLite } from 'react-native-quick-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DB_NAME } from './db';
import { Expense } from '../types/expense';
import { insertExpenseRow } from './expense.adapter';

type Migration = {
  from: number;
  to: number;
  run: () => Promise<void> | void;
};

function getUserVersion(): number {
  const result = QuickSQLite.execute(
    DB_NAME,
    'PRAGMA user_version;'
  );
  return result.rows?.item(0)?.user_version ?? 0;
}

function setUserVersion(version: number) {
  QuickSQLite.execute(
    DB_NAME,
    `PRAGMA user_version = ${version};`
  );
}

function columnExists(
  table: string,
  column: string
): boolean {
  const result = QuickSQLite.execute(
    DB_NAME,
    `PRAGMA table_info(${table});`
  );

  const rows = result.rows;
  if (!rows) return false;

  for (let i = 0; i < rows.length; i++) {
    if (rows.item(i)?.name === column) {
      return true;
    }
  }
  return false;
}

/**
 * Legacy AsyncStorage key
 */
const LEGACY_EXPENSES_KEY = 'USER_EXPENSES';

/**
 * Database migrations
 */
const migrations: Migration[] = [
  // ───────────────────────────────
  // v0 → v1 : create schema + migrate legacy expenses
  // ───────────────────────────────
  {
    from: 0,
    to: 1,
    run: async () => {
      // 1️⃣ Create base schema
      QuickSQLite.execute(DB_NAME, `
        CREATE TABLE IF NOT EXISTS expenses (
          id TEXT PRIMARY KEY NOT NULL,
          pocketId TEXT NOT NULL,
          amount INTEGER NOT NULL,
          month TEXT NOT NULL,
          date INTEGER,
          createdAt INTEGER NOT NULL,
          updatedAt INTEGER,
          note TEXT
        );
      `);

      QuickSQLite.execute(DB_NAME, `
        CREATE TABLE IF NOT EXISTS pockets (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          allocated INTEGER NOT NULL,
          createdAt TEXT NOT NULL
        );
      `);

      QuickSQLite.execute(DB_NAME, `
        CREATE INDEX IF NOT EXISTS idx_expenses_pocket_month
        ON expenses(pocketId, month);
      `);

      // 2️⃣ Migrate legacy AsyncStorage expenses (ONCE)
      const legacyRaw = await AsyncStorage.getItem(
        LEGACY_EXPENSES_KEY
      );
      if (!legacyRaw) return;

      let legacyExpenses: any[] = [];
      try {
        const parsed = JSON.parse(legacyRaw);
        if (Array.isArray(parsed)) {
          legacyExpenses = parsed;
        }
      } catch {
        legacyExpenses = [];
      }

      const now = Date.now();

      for (const legacy of legacyExpenses) {
        if (
          !legacy?.id ||
          !legacy?.pocketId ||
          typeof legacy.amount !== 'number'
        ) {
          continue;
        }

        const createdAt =
          typeof legacy.createdAt === 'number'
            ? legacy.createdAt
            : Date.parse(legacy.createdAt) || now;

        const expense: Expense = {
          id: legacy.id,
          pocketId: legacy.pocketId,
          amount: legacy.amount,
          month: legacy.month,
          date: legacy.date ?? createdAt,
          createdAt,
          updatedAt: createdAt,
          isDeleted: false,
          deletedAt: undefined,
          note: legacy.note ?? undefined,
        };

        insertExpenseRow(expense);
      }

      // Optional: cleanup legacy storage
      // await AsyncStorage.removeItem(LEGACY_EXPENSES_KEY);
    },
  },

  // ───────────────────────────────
  // v1 → v2 : soft delete support
  // ───────────────────────────────
  {
    from: 1,
    to: 2,
    run: () => {
      if (!columnExists('expenses', 'isDeleted')) {
        QuickSQLite.execute(
          DB_NAME,
          `ALTER TABLE expenses ADD COLUMN isDeleted INTEGER DEFAULT 0;`
        );
      }

      if (!columnExists('expenses', 'deletedAt')) {
        QuickSQLite.execute(
          DB_NAME,
          `ALTER TABLE expenses ADD COLUMN deletedAt INTEGER;`
        );
      }

      QuickSQLite.execute(
        DB_NAME,
        `UPDATE expenses SET isDeleted = 0 WHERE isDeleted IS NULL;`
      );

      QuickSQLite.execute(DB_NAME, `
        CREATE INDEX IF NOT EXISTS idx_expenses_isDeleted
        ON expenses(isDeleted);
      `);
    },
  },
    // ───────────────────────────────
  // v2 → v3 : income table
  // ───────────────────────────────
  {
    from: 2,
    to: 3,
    run: () => {
      QuickSQLite.execute(DB_NAME, `
        CREATE TABLE IF NOT EXISTS income (
          id TEXT PRIMARY KEY NOT NULL,
          amount REAL NOT NULL,
          source TEXT NOT NULL,
          month TEXT NOT NULL,
          date INTEGER NOT NULL,
          createdAt INTEGER NOT NULL,
          updatedAt INTEGER,
          isDeleted INTEGER NOT NULL DEFAULT 0,
          deletedAt INTEGER
        );
      `);

      QuickSQLite.execute(DB_NAME, `
        CREATE INDEX IF NOT EXISTS idx_income_month
        ON income(month);
      `);

      QuickSQLite.execute(DB_NAME, `
        CREATE INDEX IF NOT EXISTS idx_income_isDeleted
        ON income(isDeleted);
      `);
    },
  },
  // ───────────────────────────────
  // v3 → v4 : global app PIN lock
  // ───────────────────────────────
  {
    from: 3,
    to: 4,
    run: () => {
      QuickSQLite.execute(DB_NAME, `
        CREATE TABLE IF NOT EXISTS auth_lock (
          scope TEXT PRIMARY KEY,     -- 'GLOBAL' now, 'USER' later
          scope_id TEXT,              -- null for GLOBAL
          pin_hash TEXT NOT NULL,
          created_at INTEGER NOT NULL
        );
      `);
    },
  },
  {
    from: 4,
    to: 5,
    run: () => {
      // 1️⃣ Create transactions table
      QuickSQLite.execute(DB_NAME, `
        CREATE TABLE IF NOT EXISTS transactions (
          id TEXT PRIMARY KEY,
          amount REAL NOT NULL,
          type TEXT CHECK(type IN ('income','expense')) NOT NULL,

          pocketId TEXT,
          source TEXT,
          category TEXT,

          month TEXT NOT NULL,
          date INTEGER NOT NULL,

          createdAt INTEGER NOT NULL,
          updatedAt INTEGER,
          deletedAt INTEGER,
          isDeleted INTEGER NOT NULL DEFAULT 0
        );
      `);

      // 2️⃣ Migrate INCOME → TRANSACTIONS (ONE TIME, SAFE)
      QuickSQLite.execute(DB_NAME, `
        INSERT INTO transactions (
          id,
          amount,
          type,
          source,
          month,
          date,
          createdAt,
          updatedAt,
          deletedAt,
          isDeleted
        )
        SELECT
          id,
          amount,
          'income',
          source,
          month,
          date,
          createdAt,
          updatedAt,
          deletedAt,
          isDeleted
        FROM income
        WHERE id NOT IN (
          SELECT id FROM transactions
        );
      `);
    },
  },
  {
  from: 5,
  to: 6,
  run: async () => {
    // 1️⃣ Read salary from legacy settings
    const raw = await AsyncStorage.getItem(
      'settings.salary'
    );

    const salary = raw ? Number(raw) : NaN;
    if (!Number.isFinite(salary) || salary <= 0) {
      return;
    }

    // 2️⃣ Compute current month key
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const monthKey = `${y}-${m}`;

    const salaryTxId = `salary-${monthKey}`;
    const ts = Date.now();

    // 3️⃣ Insert salary transaction ONCE
    QuickSQLite.execute(DB_NAME, `
      INSERT OR IGNORE INTO transactions (
        id,
        amount,
        type,
        source,
        month,
        date,
        createdAt,
        updatedAt,
        isDeleted
      ) VALUES (
        '${salaryTxId}',
        ${salary},
        'income',
        'Salary',
        '${monthKey}',
        ${ts},
        ${ts},
        ${ts},
        0
      );
    `);
  },
},
{
  from: 6,
  to: 7,
  run: () => {
    /**
     * Migrate expenses → transactions
     *
     * Rules:
     * - expense.amount becomes NEGATIVE
     * - type = 'expense'
     * - pocketId preserved
     * - id preserved
     * - soft delete preserved
     */

    QuickSQLite.execute(DB_NAME, `
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
      )
      SELECT
        e.id,
        -ABS(e.amount),              -- 🔑 NEGATIVE
        'expense',
        e.pocketId,
        e.note,
        NULL,
        e.month,
        e.date,
        e.createdAt,
        e.updatedAt,
        e.deletedAt,
        e.isDeleted
      FROM expenses e
      WHERE e.id NOT IN (
        SELECT id FROM transactions
      );
    `);
  },
},

];

export async function runMigrations() {
  let currentVersion = getUserVersion();

  if (__DEV__) {
    console.log(
      `[DB] user_version = ${currentVersion}`
    );
  }

  while (true) {
    const migration = migrations.find(
      m => m.from === currentVersion
    );
    if (!migration) break;

    if (__DEV__) {
      console.log(
        `[DB] migrate ${migration.from} → ${migration.to}`
      );
    }

    await migration.run();
    setUserVersion(migration.to);
    currentVersion = migration.to;
  }
}
