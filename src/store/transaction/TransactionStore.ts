import { Transaction } from '../../types/transaction';
import {
  insertTransactionRow,
  markTransactionDeleted,
  restoreTransactionRow,
  selectAllTransactionsRaw,
  selectDeletedTransactionsRaw,
  permanentlyDeleteTransactionRow,
  updateTransactionRow,
} from '../../db/transaction.adapter';
import { invariant } from '../../utils/invariant';

const DELETE_RETENTION_DAYS = 30;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export class TransactionStore {
  private version = 0;
  private selectorCache = new Map<
    string,
    { version: number; value: any }
  >();

  private transactions = new Map<string, Transaction>();
  private listeners = new Set<() => void>();
  private snapshot: Transaction[] = [];

  private lastDeletedId: string | null = null;
  private canUndoDelete = false;
  private undoTimer: ReturnType<typeof setTimeout> | null =
    null;

  private readonly UNDO_WINDOW_MS = 5000;
  private undoSnapshot = {
    canUndo: false,
    lastDeleted: null as Transaction | null,
    };


  /* ================= Subscription ================= */

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit() {
  this.snapshot = Array.from(this.transactions.values());

  this.undoSnapshot = {
    canUndo: this.canUndoDelete,
    lastDeleted: this.lastDeletedId
      ? this.transactions.get(this.lastDeletedId) ?? null
      : null,
  };

  for (const l of this.listeners) l();
}

  getSnapshot() {
    console.log('[SNAPSHOT]', 'TransactionStore');
    return this.snapshot;
  }

  canUndo() {
    return this.canUndoDelete;
  }

  /* ================= Hydration ================= */

  hydrateFromSQLite() {
    const rows = selectAllTransactionsRaw();
    this.transactions.clear();

    for (const tx of rows) {
      invariant(tx.id, 'Transaction missing id');
      invariant(tx.month, 'Transaction missing month');

      invariant(
        tx.type === 'income'
          ? tx.amount > 0
          : tx.amount < 0,
        'Invalid amount/type combination'
      );

      if (tx.type === 'expense') {
        invariant(
          tx.pocketId,
          'Expense must belong to a pocket'
        );
      }

      this.transactions.set(tx.id, {
        ...tx,
        isDeleted: Boolean(tx.isDeleted),
      });
    }

    this.cleanupOldDeleted();
    this.bumpVersion();
    this.emit();
  }

  /* ================= Writes ================= */

  addTransaction(tx: Transaction) {
    insertTransactionRow(tx);
    this.transactions.set(tx.id, tx);
    this.bumpVersion();
    this.emit();
  }

  deleteTransaction(id: string) {
    const tx = this.transactions.get(id);
    invariant(tx, 'Transaction not found');
    invariant(!tx.isDeleted, 'Already deleted');

    if (this.undoTimer) {
        clearTimeout(this.undoTimer);
        this.undoTimer = null;
    }

    const deletedAt = Date.now();
    markTransactionDeleted(id, deletedAt);

    this.transactions.set(id, {
        ...tx,
        isDeleted: true,
        deletedAt,
        updatedAt: deletedAt,
    });

    this.lastDeletedId = id;
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

        const tx = this.transactions.get(this.lastDeletedId);
        invariant(tx && tx.isDeleted, 'Invalid undo');

        restoreTransactionRow(tx.id);

        this.transactions.set(tx.id, {
            ...tx,
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


  /* ================= Selectors ================= */

  getIncomeForMonth(month: string) {
    return this.memo(`income:${month}`, () =>
      [...this.transactions.values()].reduce(
        (sum, t) =>
          !t.isDeleted &&
          t.month === month &&
          t.amount > 0
            ? sum + t.amount
            : sum,
        0
      )
    );
  }

  getUndoSnapshot() {
    return this.undoSnapshot;
    }

  updateTransaction(tx: Transaction) {
    updateTransactionRow(tx.id, tx);
    this.transactions.set(tx.id, tx);
    this.bumpVersion();
    this.emit();
}

  getExpenseForMonth(month: string) {
    return this.memo(`expense:${month}`, () =>
      [...this.transactions.values()].reduce(
        (sum, t) =>
          !t.isDeleted &&
          t.month === month &&
          t.amount < 0
            ? sum + Math.abs(t.amount)
            : sum,
        0
      )
    );
  }

  getBalanceForMonth(month: string) {
    return this.memo(`balance:${month}`, () =>
      [...this.transactions.values()].reduce(
        (sum, t) =>
          !t.isDeleted && t.month === month
            ? sum + t.amount
            : sum,
        0
      )
    );
  }

  getExpensesForPocketInMonth(
  pocketId: string,
  month: string
) {
  return this.memo(
    `expenses:${pocketId}:${month}`,
    () =>
      Array.from(this.transactions.values())
        .filter(
          t =>
            t.type === 'expense' &&
            t.pocketId === pocketId &&
            t.month === month &&
            !t.isDeleted
        )
        .sort((a, b) => b.date - a.date)
  );
}

getTotalSpentForPocketInMonth(
  pocketId: string,
  month: string
) {
  return this.memo(
    `spent:${pocketId}:${month}`,
    () =>
      Array.from(this.transactions.values()).reduce(
        (sum, t) =>
          t.type === 'expense' &&
          t.pocketId === pocketId &&
          t.month === month &&
          !t.isDeleted
            ? sum + Math.abs(t.amount)
            : sum,
        0
      )
  );
}

restoreTransactionById(id: string) {
  const tx = this.transactions.get(id);
  invariant(tx, 'Transaction not found');
  invariant(tx.isDeleted, 'Transaction is not deleted');

  restoreTransactionRow(id);

  this.transactions.set(id, {
    ...tx,
    isDeleted: false,
    deletedAt: undefined,
    updatedAt: Date.now(),
  });

  this.bumpVersion();
  this.emit();
}


  /* ================= Internals ================= */

  private cleanupOldDeleted() {
    const cutoff =
      Date.now() - DELETE_RETENTION_DAYS * MS_PER_DAY;

    for (const t of selectDeletedTransactionsRaw()) {
      if (t.deletedAt && t.deletedAt < cutoff) {
        permanentlyDeleteTransactionRow(t.id);
        this.transactions.delete(t.id);
      }
    }
  }

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
