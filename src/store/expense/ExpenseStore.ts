import { Expense } from '../../types/expense';
import {
  insertExpenseRow,
  markExpenseDeleted,
  restoreExpenseRow,
  selectAllExpensesRaw,
} from '../../db/expense.adapter';
import {
  selectDeletedExpensesRaw,
  permanentlyDeleteExpenseRow,
} from '../../db/expense.adapter';

const DELETE_RETENTION_DAYS = 30;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
export class ExpenseStore {

  private version = 0;
  private selectorCache = new Map<
    string,
    { version: number; value: any }
  >();

  private expenses = new Map<string, Expense>();
  private listeners = new Set<() => void>();
  private snapshot: Expense[] = [];

  private lastDeletedId: string | null = null;
  private canUndoDelete = false;
  private undoTimer: ReturnType<typeof setTimeout> | null = null;

  private readonly UNDO_WINDOW_MS = 5000;

  private undoSnapshot = {
    canUndo: false,
    lastDeleted: null as Expense | null,
  };

  /* =========================
     React subscription
     ========================= */

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit() {
    this.snapshot = Array.from(this.expenses.values());
    this.undoSnapshot.canUndo = this.canUndoDelete;
    this.undoSnapshot.lastDeleted = this.lastDeletedId
      ? this.expenses.get(this.lastDeletedId) ?? null
      : null;

    for (const l of this.listeners) l();
  }

  getSnapshot() {
    return this.snapshot;
  }

  getUndoSnapshot() {
    return this.undoSnapshot;
  }

  /* =========================
     Hydration
     ========================= */

  hydrateFromSQLite() {
  const rows = selectAllExpensesRaw();

  this.expenses.clear();

  for (const e of rows) {
    this.expenses.set(e.id, {
      ...e,
      isDeleted: Boolean(e.isDeleted),
    });
  }

  // ✅ data changed → invalidate selector cache
  this.bumpVersion();

  // ✅ enforce retention policy
  this.cleanupOldDeletedExpenses();

  this.emit();
}

  /* =========================
     WRITE operations
     ========================= */

  addExpense(expense: Expense) {
    insertExpenseRow(expense);
    this.expenses.set(expense.id, expense);
    this.bumpVersion();
    this.emit();
  }

  deleteExpense(expenseId: string) {
    const expense = this.expenses.get(expenseId);
    if (!expense || expense.isDeleted) return;

    if (this.undoTimer) {
      clearTimeout(this.undoTimer);
      this.undoTimer = null;
    }

    const deletedAt = Date.now();

    markExpenseDeleted(expenseId, deletedAt);

    this.expenses.set(expenseId, {
      ...expense,
      isDeleted: true,
      deletedAt,
      updatedAt: deletedAt,
    });

    this.lastDeletedId = expenseId;
    this.canUndoDelete = true;
    this.bumpVersion();
    this.emit();

    this.undoTimer = setTimeout(() => {
      this.lastDeletedId = null;
      this.canUndoDelete = false;
      this.undoTimer = null;
      this.emit();
    }, this.UNDO_WINDOW_MS);
  }

  undoDelete() {
    if (!this.lastDeletedId) return;

    const expense = this.expenses.get(this.lastDeletedId);
    if (!expense) return;

    restoreExpenseRow(expense.id);

    this.expenses.set(expense.id, {
      ...expense,
      isDeleted: false,
      deletedAt: undefined,
      updatedAt: Date.now(),
    });

    this.lastDeletedId = null;
    this.canUndoDelete = false;

    if (this.undoTimer) {
      clearTimeout(this.undoTimer);
      this.undoTimer = null;
    }
    this.bumpVersion();
    this.emit();
  }

  restoreExpense(expenseId: string) {
    const expense = this.expenses.get(expenseId);
    if (!expense || !expense.isDeleted) return;

    restoreExpenseRow(expenseId);

    this.expenses.set(expenseId, {
      ...expense,
      isDeleted: false,
      deletedAt: undefined,
      updatedAt: Date.now(),
    });
    this.bumpVersion();
    this.emit();
  }

  cleanupOldDeletedExpenses() {
  const now = Date.now();
  const cutoff = now - DELETE_RETENTION_DAYS * MS_PER_DAY;

  const deletedExpenses = selectDeletedExpensesRaw();

  let didDelete = false;

  for (const expense of deletedExpenses) {
    if (!expense.deletedAt) continue;

    if (expense.deletedAt < cutoff) {
      permanentlyDeleteExpenseRow(expense.id);
      this.expenses.delete(expense.id);
      didDelete = true;
    }
  }

  if (didDelete) {
    this.bumpVersion();
    this.emit();
  }
}


  canUndo() {
    return this.canUndoDelete;
  }

  private bumpVersion() {
  this.version++;
  this.selectorCache.clear(); // optional but safest
}

private memo<T>(key: string, compute: () => T): T {
  const cached = this.selectorCache.get(key);

  if (cached && cached.version === this.version) {
    return cached.value;
  }

  const value = compute();
  this.selectorCache.set(key, {
    version: this.version,
    value,
  });

  return value;
}

getSpentForPocketInMonth(pocketId: string, month: string) {
  return this.memo(
    `spent:${pocketId}:${month}`,
    () => {
      let total = 0;

      for (const e of this.expenses.values()) {
        if (
          e.pocketId === pocketId &&
          e.month === month &&
          !e.isDeleted &&
          e.amount < 0
        ) {
          total += Math.abs(e.amount);
        }
      }

      return total;
    }
  );
}

getExpensesForPocketInMonth(pocketId: string, month: string) {
  return this.memo(
    `list:${pocketId}:${month}`,
    () =>
      Array.from(this.expenses.values()).filter(
        e =>
          e.pocketId === pocketId &&
          e.month === month &&
          !e.isDeleted
      )
  );
}

getDashboardSummary(month: string) {
  return this.memo(
    `dashboard:${month}`,
    () => {
      let totalSpent = 0;
      let totalIncome = 0;
      let netAmount = 0;

      for (const e of this.expenses.values()) {
        if (e.month !== month || e.isDeleted) continue;

        netAmount += e.amount;

        if (e.amount < 0) {
          totalSpent += Math.abs(e.amount);
        } else {
          totalIncome += e.amount;
        }
      }

      // ---- time math (now centralized) ----
      const [year, m] = month.split('-').map(Number);
      const totalDays = new Date(
        year,
        m,
        0
      ).getDate();

      const today = new Date();
      const isCurrentMonth =
        today.getFullYear() === year &&
        today.getMonth() + 1 === m;

      const daysElapsed = isCurrentMonth
        ? today.getDate()
        : totalDays;

      const daysRemaining = Math.max(
        totalDays - daysElapsed,
        0
      );

      return {
        totalIncome,
        totalSpent,
        netAmount,
        avgPerDay:
          daysElapsed > 0
            ? totalSpent / daysElapsed
            : 0,
        daysRemaining,
        perDayAvailable:
          daysRemaining > 0
            ? netAmount / daysRemaining
            : 0,
      };
    }
  );
}


getExpensesForMonth(month: string) {
  return this.memo(
    `expenses:${month}`,
    () =>
      Array.from(this.expenses.values()).filter(
        e => e.month === month && !e.isDeleted
      )
  );
}

getTopExpensesForMonth(
  month: string,
  limit: number
) {
  return this.memo(
    `top:${month}:${limit}`,
    () => {
      return Array.from(this.expenses.values())
        .filter(
          e =>
            e.month === month &&
            !e.isDeleted &&
            e.amount < 0
        )
        .sort(
          (a, b) =>
            Math.abs(b.amount) -
            Math.abs(a.amount)
        )
        .slice(0, limit);
    }
  );
}

getTopExpenseSummariesForMonth(
  month: string,
  limit: number
) {
  return this.memo(
    `topSummary:${month}:${limit}`,
    () =>
      this.getTopExpensesForMonth(month, limit).map(
        e => ({
          id: e.id,
          title: e.note || 'Expense',
          amount: Math.abs(e.amount),
        })
      )
  );
}

}
