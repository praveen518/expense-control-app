import AsyncStorage from '@react-native-async-storage/async-storage';
import { Expense } from '../types/expense';
import * as expenseSQLite from './expenseSQLite';

const LEGACY_EXPENSES_KEY = 'USER_EXPENSES';
const MIGRATION_FLAG = 'EXPENSES_SQLITE_MIGRATED';

export const migrateExpensesToSQLite = async () => {
  // 1️⃣ Check if migration already done
  const alreadyMigrated = await AsyncStorage.getItem(
    MIGRATION_FLAG
  );

  if (alreadyMigrated === 'true') {
    return;
  }

  // 2️⃣ Check if SQLite already has data
  const sqliteExpenses =
    await expenseSQLite.getExpenses();

  if (sqliteExpenses.length > 0) {
    // SQLite is already authoritative
    await AsyncStorage.setItem(
      MIGRATION_FLAG,
      'true'
    );
    return;
  }

  // 3️⃣ Read legacy AsyncStorage expenses
  const legacyRaw = await AsyncStorage.getItem(
    LEGACY_EXPENSES_KEY
  );

  if (!legacyRaw) {
    // Nothing to migrate
    await AsyncStorage.setItem(
      MIGRATION_FLAG,
      'true'
    );
    return;
  }

  let legacyExpenses: Expense[] = [];

try {
  legacyExpenses = JSON.parse(legacyRaw);
} catch {
  legacyExpenses = [];
}

if (!Array.isArray(legacyExpenses)) {
  legacyExpenses = [];
}


  // 4️⃣ Insert into SQLite
  for (const expense of legacyExpenses) {
    await expenseSQLite.addExpense(expense);
  }

  // 5️⃣ Mark migration complete
  await AsyncStorage.setItem(
    MIGRATION_FLAG,
    'true'
  );

  // (Optional, but recommended)
  // await AsyncStorage.removeItem(LEGACY_EXPENSES_KEY);
};
