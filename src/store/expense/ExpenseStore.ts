import { Expense } from '../../types/expense';
import * as expenseStorage from '../../storage/expenseSQLite';

/**
 * ExpenseStore
 *  - Single source of truth
 *  - React 18 safe (cached snapshot)
 *  - Supports soft delete + undo
 */
export class ExpenseStore {
  /** in-memory state */
  private expenses = new Map<string, Expense>();
  private listeners = new Set<() => void>();

  /** cached snapshot for useSyncExternalStore */
  private snapshot: Expense[] = [];

  /** undo state */
  private lastDeleted: Expense | null = null;
  private canUndoDelete = false;
  private undoTimer: ReturnType<typeof setTimeout> | null =
    null;

  private readonly UNDO_WINDOW_MS = 5000;

  /* =========================
     React subscription
     ========================= */

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit() {
    // snapshot changes ONLY here
    this.snapshot = Array.from(this.expenses.values());
    for (const l of this.listeners) l();
  }

  getSnapshot(): Expense[] {
    return this.snapshot;
  }

  /* =========================
     Init
     ========================= */

  async init() {
    const storedExpenses =
      await expenseStorage.getExpenses();

    this.expenses.clear();
    for (const e of storedExpenses) {
      this.expenses.set(e.id, e);
    }

    this.emit();
  }

  /* =========================
     READ helpers
     ========================= */

  canUndo() {
    return this.canUndoDelete;
  }

  /* =========================
     WRITE operations
     ========================= */

  async addExpense(expense: Expense) {
    await expenseStorage.addExpense(expense);

    this.expenses.set(expense.id, expense);
    this.emit();
  }

  /**
   * Soft delete with undo support
   */
  async deleteExpense(expenseId: string) {
    const expense = this.expenses.get(expenseId);
    if (!expense || expense.deletedAt) return;

    // clear previous undo (single-level undo)
    if (this.undoTimer) {
      clearTimeout(this.undoTimer);
      this.undoTimer = null;
    }

    const deletedAt = new Date().toISOString();

    const deletedExpense: Expense = {
      ...expense,
      deletedAt,
    };

    // register undo
    this.lastDeleted = expense;
    this.canUndoDelete = true;

    // persist soft delete
    await expenseStorage.softDeleteExpense(
      expenseId,
      deletedAt
    );

    // update memory
    this.expenses.set(expenseId, deletedExpense);
    this.emit();

    // start undo expiry
    this.undoTimer = setTimeout(() => {
      this.lastDeleted = null;
      this.canUndoDelete = false;
      this.undoTimer = null;
      this.emit(); // 🔥 critical
    }, this.UNDO_WINDOW_MS);
  }

  /**
   * Undo last delete (time-bound)
   */
  async undoDelete() {
    if (!this.lastDeleted) return;

    const restored: Expense = {
      ...this.lastDeleted,
      deletedAt: undefined,
    };

    await expenseStorage.restoreExpense(
      restored.id
    );

    this.expenses.set(restored.id, restored);

    this.lastDeleted = null;
    this.canUndoDelete = false;

    if (this.undoTimer) {
      clearTimeout(this.undoTimer);
      this.undoTimer = null;
    }

    this.emit();
  }

  /**
   * Restore from Recently Deleted screen
   * (not time-bound)
   */
  async restoreExpense(expenseId: string) {
    const expense = this.expenses.get(expenseId);
    if (!expense || !expense.deletedAt) return;

    const restored: Expense = {
      ...expense,
      deletedAt: undefined,
    };

    await expenseStorage.restoreExpense(expenseId);

    this.expenses.set(expenseId, restored);
    this.emit();
  }
}
