import { Expense } from '../../types/expense';
import * as expenseStorage from '../../db/expense.adapter';

/**
 * ExpenseStore
 *  - Single source of truth
 *  - React 18 safe (cached snapshot)
 *  - Supports soft delete + undo
 */
export class ExpenseStore {
  private expenses = new Map<string, Expense>();
  private listeners = new Set<() => void>();
  private snapshot: Expense[] = [];

  private lastDeleted: Expense | null = null;
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
  console.log(
    '🟢 EMIT',
    'canUndo:',
    this.canUndoDelete,
    'lastDeleted:',
    this.lastDeleted?.id
  );

  this.snapshot = Array.from(this.expenses.values());
  this.undoSnapshot.canUndo = this.canUndoDelete;
  this.undoSnapshot.lastDeleted = this.lastDeleted;

  for (const l of this.listeners) l();
}


  getUndoSnapshot() {
  return this.undoSnapshot;
}

  getSnapshot() {
    return this.snapshot;
  }

  /* =========================
     Hydration
     ========================= */

  hydrateFromSQLite() {
  const prevLastDeleted = this.lastDeleted;
  const prevCanUndo = this.canUndoDelete;

  const active = expenseStorage.getActiveExpenses();
  const deleted = expenseStorage.getDeletedExpenses();

  this.expenses.clear();
  for (const e of [...active, ...deleted]) {
    this.expenses.set(e.id, e);
  }

  // 🔒 Preserve undo state
  this.lastDeleted = prevLastDeleted;
  this.canUndoDelete = prevCanUndo;

  this.emit();
}


  /* =========================
     WRITE operations
     ========================= */

  addExpense(expense: Expense) {
    expenseStorage.addExpense(expense);
    this.expenses.set(expense.id, expense);
    this.emit();
  }

  deleteExpense(expenseId: string) {
    const expense = this.expenses.get(expenseId);
    if (!expense || expense.deletedAt) return;

    if (this.undoTimer) {
      clearTimeout(this.undoTimer);
      this.undoTimer = null;
    }

    const deletedAt = new Date().toISOString();
    const deletedExpense = { ...expense, deletedAt };

    this.lastDeleted = expense;
    this.canUndoDelete = true;

    expenseStorage.softDeleteExpense(
      expenseId,
      deletedAt
    );

    this.expenses.set(expenseId, deletedExpense);
    this.emit();

    this.undoTimer = setTimeout(() => {
      this.lastDeleted = null;
      this.canUndoDelete = false;
      this.undoTimer = null;
      this.emit();
    }, this.UNDO_WINDOW_MS);
  }

  undoDelete() {
    if (!this.lastDeleted) return;

    expenseStorage.restoreExpense(
      this.lastDeleted.id
    );

    this.expenses.set(
      this.lastDeleted.id,
      { ...this.lastDeleted, deletedAt: undefined }
    );

    this.lastDeleted = null;
    this.canUndoDelete = false;

    if (this.undoTimer) {
      clearTimeout(this.undoTimer);
      this.undoTimer = null;
    }

    this.emit();
  }

  restoreExpense(expenseId: string) {
    const expense = this.expenses.get(expenseId);
    if (!expense || !expense.deletedAt) return;

    expenseStorage.restoreExpense(expenseId);

    this.expenses.set(
      expenseId,
      { ...expense, deletedAt: undefined }
    );

    this.emit();
  }

  getLastDeleted(): Expense | null {
  return this.lastDeleted;
}

  canUndo() {
  return this.canUndoDelete;
}

getCanUndoSnapshot() {
  return this.canUndoDelete;
}

getLastDeletedExpense() {
  return this.lastDeleted;
}

}

