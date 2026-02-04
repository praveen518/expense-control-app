// src/store/income/incomeStore.ts
import { Income } from '../../types/income';
import {
  insertIncomeRow,
  markIncomeDeleted,
  restoreIncomeRow,
  selectAllIncomeRaw,
  selectDeletedIncomeRaw,
  permanentlyDeleteIncomeRow,
} from '../../db/income.adapter';
import { invariant } from '../../utils/invariant';

const DELETE_RETENTION_DAYS = 30;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export class IncomeStore {
  private version = 0;
  private selectorCache = new Map<
    string,
    { version: number; value: any }
  >();

  private income = new Map<string, Income>();
  private listeners = new Set<() => void>();
  private snapshot: Income[] = [];

  private lastDeletedId: string | null = null;
  private canUndoDelete = false;
  private undoTimer: ReturnType<typeof setTimeout> | null =
    null;

  private readonly UNDO_WINDOW_MS = 5000;

  /* =========================
     Subscription
     ========================= */

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit() {
    this.snapshot = Array.from(this.income.values());
    for (const l of this.listeners) l();
  }

  getSnapshot() {
    console.log('[SNAPSHOT]', 'IncomeStore');
    return this.snapshot;
  }

  getLastDeletedIncome(): Income | null {
    if (!this.lastDeletedId) return null;
    return this.income.get(this.lastDeletedId) ?? null;
  }

  canUndo() {
    return this.canUndoDelete;
  }

  /* =========================
     Hydration
     ========================= */

  hydrateFromSQLite() {
    const rows = selectAllIncomeRaw();
    this.income.clear();

    for (const i of rows) {
      invariant(i.id, 'Income missing id');
      invariant(
        Number.isFinite(i.amount) && i.amount > 0,
        'Income must be positive'
      );
      invariant(i.month, 'Income missing month');

      this.income.set(i.id, {
        ...i,
        isDeleted: Boolean(i.isDeleted),
      });
    }

    this.cleanupOldDeletedIncome();
    this.bumpVersion();
    this.emit();
  }

  /* =========================
     Writes (NO side effects)
     ========================= */

  addIncome(income: Income) {
    invariant(income.id, 'Income must have id');
    invariant(income.amount > 0, 'Income must be positive');

    insertIncomeRow(income);
    this.income.set(income.id, income);
    this.bumpVersion();
    this.emit();
  }

  deleteIncome(incomeId: string) {
    const income = this.income.get(incomeId);
    invariant(income, 'Income not found');
    invariant(!income.isDeleted, 'Already deleted');

    if (this.undoTimer) {
      clearTimeout(this.undoTimer);
      this.undoTimer = null;
    }

    const deletedAt = Date.now();
    markIncomeDeleted(incomeId, deletedAt);

    this.income.set(incomeId, {
      ...income,
      isDeleted: true,
      deletedAt,
      updatedAt: deletedAt,
    });

    this.lastDeletedId = incomeId;
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

    const income = this.income.get(this.lastDeletedId);
    invariant(income && income.isDeleted, 'Invalid undo');

    restoreIncomeRow(income.id);

    this.income.set(income.id, {
      ...income,
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

  /* =========================
     Cleanup
     ========================= */

  private cleanupOldDeletedIncome() {
    const cutoff =
      Date.now() -
      DELETE_RETENTION_DAYS * MS_PER_DAY;

    for (const i of selectDeletedIncomeRaw()) {
      if (i.deletedAt && i.deletedAt < cutoff) {
        permanentlyDeleteIncomeRow(i.id);
        this.income.delete(i.id);
      }
    }
  }

  /* =========================
     READ selectors
     ========================= */

  getTotalIncomeForMonth(month: string) {
    return this.memo(
      `total:${month}`,
      () => {
        let total = 0;
        for (const i of this.income.values()) {
          if (
            i.month === month &&
            !i.isDeleted
          ) {
            total += i.amount;
          }
        }
        return total;
      }
    );
  }

  /* =========================
     Internals
     ========================= */

  private bumpVersion() {
    this.version++;
    this.selectorCache.clear();
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
}
