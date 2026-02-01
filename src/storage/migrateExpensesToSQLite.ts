import AsyncStorage from '@react-native-async-storage/async-storage';
import { Expense } from '../types/expense';
import {
  insertExpenseRow,
  selectAllExpensesRaw,
} from '../db/expense.adapter';

const LEGACY_EXPENSES_KEY = 'USER_EXPENSES';
const MIGRATION_FLAG = 'EXPENSES_SQLITE_MIGRATED';

export const migrateExpensesToSQLite = async () => {
  // 1️⃣ Already migrated?
  const alreadyMigrated = await AsyncStorage.getItem(MIGRATION_FLAG);
  if (alreadyMigrated === 'true') {
    return;
  }

  // 2️⃣ If SQLite already has data, trust it
  const sqliteExpenses = selectAllExpensesRaw();
  if (sqliteExpenses.length > 0) {
    await AsyncStorage.setItem(MIGRATION_FLAG, 'true');
    return;
  }

  // 3️⃣ Read legacy AsyncStorage data
  const legacyRaw = await AsyncStorage.getItem(LEGACY_EXPENSES_KEY);
  if (!legacyRaw) {
    await AsyncStorage.setItem(MIGRATION_FLAG, 'true');
    return;
  }

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

  // 4️⃣ Normalize + insert
  for (const legacy of legacyExpenses) {
    // Defensive checks
    if (!legacy.id || !legacy.amount || !legacy.pocketId) continue;

    const createdAt =
      typeof legacy.createdAt === 'number'
        ? legacy.createdAt
        : Date.parse(legacy.createdAt) || now;

    const deletedAt =
      legacy.deletedAt
        ? Date.parse(legacy.deletedAt)
        : undefined;

    const expense: Expense = {
      id: legacy.id,
      pocketId: legacy.pocketId,
      amount: legacy.amount,
      month: legacy.month,
      date: legacy.date ?? createdAt,
      createdAt,
      updatedAt: createdAt,
      isDeleted: Boolean(deletedAt),
      deletedAt,
      note: legacy.note ?? undefined,
    };

    insertExpenseRow(expense);
  }

  // 5️⃣ Mark migration complete
  await AsyncStorage.setItem(MIGRATION_FLAG, 'true');

  // Optional cleanup (do this once you’re confident)
  // await AsyncStorage.removeItem(LEGACY_EXPENSES_KEY);
};
