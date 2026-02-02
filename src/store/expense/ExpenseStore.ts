import { Expense } from '../../types/expense';
import {
  insertExpenseRow,
  markExpenseDeleted,
  restoreExpenseRow,
  selectAllExpensesRaw,
  selectDeletedExpensesRaw,
  permanentlyDeleteExpenseRow,
} from '../../db/expense.adapter';
import { invariant } from '../../utils/invariant';
import { pocketStore } from '../pocket/pocketStore.instance';
import { balanceStore } from '../balance/balanceStore.instance';

const DELETE_RETENTION_DAYS = 30;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export class ExpenseStore {
  /* =========================
     Versioning / memo
     ========================= */
  private version = 0;
  private selectorCache = new Map<
    string,
    { version: number; value: any }
  >();

  /* =========================
     State
     ========================= */
  private expenses = new Map<string, Expense>();
  private listeners = new Set<() => void>();
  private snapshot: Expense[] = [];

  /* =========================
     Undo state (CACHED)
     ========================= */
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
    // 🔒 stable snapshot reference
    this.snapshot = Array.from(this.expenses.values());

    // 🔒 stable undo snapshot (NO new object)
    this.undoSnapshot.canUndo = this.canUndoDelete;
    this.undoSnapshot.lastDeleted = this.lastDeletedId
      ? this.expenses.get(this.lastDeletedId) ?? null
      : null;

    for (const l of this.listeners) l();
  }

  getSnapshot() {
    return this.snapshot;
  }

  /* =========================
     Undo selectors (SAFE)
     ========================= */

  getUndoSnapshot() {
    return this.undoSnapshot;
  }

  canUndo() {
    return this.canUndoDelete;
  }

  getLastDeletedExpense(): Expense | null {
    if (!this.lastDeletedId) return null;
    return this.expenses.get(this.lastDeletedId) ?? null;
  }

  /* =========================
     Hydration
     ========================= */
  hydrateFromSQLite() {
    const rows = selectAllExpensesRaw();
    this.expenses.clear();

    for (const e of rows) {
      invariant(e.id, 'Expense missing id');
      invariant(
        Number.isFinite(e.amount) && e.amount !== 0,
        'Invalid expense amount'
      );
      invariant(e.month, 'Expense missing month');

      this.expenses.set(e.id, {
        ...e,
        isDeleted: Boolean(e.isDeleted),
      });
    }

    this.cleanupOldDeletedExpenses();
    this.bumpVersion();
    this.emit();
  }

  /* =========================
     READ selectors
     ========================= */

  getDashboardSummary(month: string) {
    return this.memo(`dashboard:${month}`, () => {
      let totalSpent = 0;

      for (const e of this.expenses.values()) {
        if (e.month !== month || e.isDeleted) continue;
        if (e.amount < 0) {
          totalSpent += Math.abs(e.amount);
        }
      }

      const [year, m] = month.split('-').map(Number);
      const totalDays = new Date(year, m, 0).getDate();

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
        totalSpent,
        daysRemaining,
      };
    });
  }

  getTopExpensesForMonth(month: string, limit: number) {
    return this.memo(
      `top:${month}:${limit}`,
      () =>
        Array.from(this.expenses.values())
          .filter(
            e =>
              e.month === month &&
              !e.isDeleted &&
              e.amount < 0
          )
          .sort(
            (a, b) =>
              Math.abs(b.amount) - Math.abs(a.amount)
          )
          .slice(0, limit)
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

  /* =========================
     WRITE operations
     ========================= */

  addExpense(expense: Expense) {
    invariant(expense.id, 'Expense must have id');
    invariant(
      pocketStore
        .getSnapshot()
        .some(p => p.id === expense.pocketId),
      'Invalid pocket'
    );

    insertExpenseRow(expense);
    this.expenses.set(expense.id, expense);

    // 🔻 expense.amount is NEGATIVE
    balanceStore.applyDebit(Math.abs(expense.amount), 'expense:add');

    this.bumpVersion();
    this.emit();
  }

  deleteExpense(expenseId: string) {
    const expense = this.expenses.get(expenseId);
    invariant(expense, 'Expense not found');
    invariant(!expense.isDeleted, 'Already deleted');

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

    // 🔺 removing a negative restores balance
    balanceStore.applyCredit(Math.abs(expense.amount), 'expense:delete');

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
    invariant(this.lastDeletedId, 'Nothing to undo');

    const expense = this.expenses.get(this.lastDeletedId);
    invariant(expense, 'Expense missing');
    invariant(expense.isDeleted, 'Expense not deleted');

    restoreExpenseRow(expense.id);

    this.expenses.set(expense.id, {
      ...expense,
      isDeleted: false,
      deletedAt: undefined,
      updatedAt: Date.now(),
    });

    // 🔻 reapply expense
    balanceStore.applyDebit(Math.abs(expense.amount), 'expense:add');

    this.lastDeletedId = null;
    this.canUndoDelete = false;

    if (this.undoTimer) {
      clearTimeout(this.undoTimer);
      this.undoTimer = null;
    }

    this.bumpVersion();
    this.emit();
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

  // Add this new method:
  getExpensesForPocketInMonth(pocketId: string, month: string) {
    return this.memo(
      `expenses:${pocketId}:${month}`,
      () =>
        Array.from(this.expenses.values()).filter(
          e =>
            e.pocketId === pocketId &&
            e.month === month &&
            !e.isDeleted
        )
    );
  }

  /* =========================
     Cleanup
     ========================= */

  private cleanupOldDeletedExpenses() {
    const now = Date.now();
    const cutoff =
      now - DELETE_RETENTION_DAYS * MS_PER_DAY;

    for (const e of selectDeletedExpensesRaw()) {
      if (e.deletedAt && e.deletedAt < cutoff) {
        permanentlyDeleteExpenseRow(e.id);
        this.expenses.delete(e.id);
      }
    }
  }

  /* =========================
     Internal helpers
     ========================= */

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

  private bumpVersion() {
    this.version++;
    this.selectorCache.clear();
  }
}
