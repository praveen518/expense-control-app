// src/store/pocket/pocketStore.ts
import { Pocket } from '../../types/pocket';
import * as pocketAdapter from '../../db/pocket.adapter';
import { expenseStore } from '../expense/expenseStore.instance';
import { invariant } from '../../utils/invariant';

export class PocketStore {
  private version = 0;
  private selectorCache = new Map<
    string,
    { version: number; value: any }
  >();

  private pockets = new Map<string, Pocket>();
  private listeners = new Set<() => void>();
  private snapshot: Pocket[] = [];

  constructor() {
    // Recompute pocket-derived selectors when expenses change
    expenseStore.subscribe(() => {
      this.bumpVersion();
      this.emit();
    });
  }

  /* =========================
     React subscription
     ========================= */

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit() {
    this.snapshot = Array.from(this.pockets.values());
    for (const l of this.listeners) l();
  }

  getSnapshot() {
    return this.snapshot;
  }

  /* =========================
     Hydration (SQLite)
     ========================= */

  hydrateFromSQLite() {
  const pockets = pocketAdapter.getPockets();

  this.pockets.clear();
  for (const p of pockets) {
    // 🔒 invariants
    invariant(p.id, 'Hydrated pocket missing id');
    invariant(
      p.name?.trim().length > 0,
      'Hydrated pocket missing name'
    );
    invariant(
      Number.isFinite(p.allocated),
      'Hydrated pocket allocated must be finite'
    );
    invariant(
      p.allocated >= 0,
      'Hydrated pocket allocated cannot be negative'
    );

    this.pockets.set(p.id, p);
  }
  this.bumpVersion();
  this.emit();
}


  /* =========================
     Writes (SQLite)
     ========================= */

  addPocket(pocket: Pocket) {
    // 🔒 invariants
    invariant(pocket.id, 'Pocket must have id');
    invariant(
      pocket.name?.trim().length > 0,
      'Pocket name is required'
    );
    invariant(
      Number.isFinite(pocket.allocated),
      'Pocket allocated must be finite'
    );
    invariant(
      pocket.allocated >= 0,
      'Pocket allocated cannot be negative'
    );

    pocketAdapter.addPocket(pocket);
    this.pockets.set(pocket.id, pocket);
    this.bumpVersion();
    this.emit();
  }

  updatePocket(pocket: Pocket) {
    const existing = this.pockets.get(pocket.id);

    invariant(
      existing,
      `Pocket ${pocket.id} does not exist`
    );

    invariant(
      pocket.name?.trim().length > 0,
      'Pocket name is required'
    );
    invariant(
      Number.isFinite(pocket.allocated),
      'Pocket allocated must be finite'
    );
    invariant(
      pocket.allocated >= 0,
      'Pocket allocated cannot be negative'
    );

    pocketAdapter.updatePocket(pocket);
    this.pockets.set(pocket.id, pocket);
    this.bumpVersion();
    this.emit();
  }

  deletePocket(id: string) {
    const pocket = this.pockets.get(id);

    invariant(
      pocket,
      `Pocket ${id} does not exist`
    );

    // ❗ Critical invariant:
    // A pocket with ANY active expenses (any month) cannot be deleted
    const hasActiveExpense = (() => {
      for (const e of expenseStore.getSnapshot()) {
        if (
          e.pocketId === id &&
          !e.isDeleted
        ) {
          return true;
        }
      }
      return false;
    })();

    invariant(
      !hasActiveExpense,
      'Cannot delete pocket with existing expenses'
    );

    pocketAdapter.deletePocket(id);
    this.pockets.delete(id);
    this.bumpVersion();
    this.emit();
  }

  /* =========================
     Selectors (unchanged)
     ========================= */

  getPocketSummaryForMonth(
    pocketId: string,
    month: string
  ) {
    return this.memo(
      `summary:${pocketId}:${month}`,
      () => {
        const pocket = this.pockets.get(pocketId);
        if (!pocket) return null;

        const spent = (() => {
          let total = 0;

          for (const e of expenseStore.getSnapshot()) {
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
        })();

        return {
          pocket,
          allocated: pocket.allocated,
          spent,
          remaining: pocket.allocated - spent,
        };
      }
    );
  }

  getAllPocketSummaries(month: string) {
    return this.memo(
      `all:${month}`,
      () =>
        Array.from(this.pockets.values()).map(pocket => {
          let spent = 0;

          for (const e of expenseStore.getSnapshot()) {
            if (
              e.pocketId === pocket.id &&
              e.month === month &&
              !e.isDeleted &&
              e.amount < 0
            ) {
              spent += Math.abs(e.amount);
            }
          }

          return {
            pocket,
            allocated: pocket.allocated,
            spent,
            remaining:
              pocket.allocated - spent,
          };
        })
    );
  }

  /* =========================
     Internals
     ========================= */

  private bumpVersion() {
    this.version++;
    this.selectorCache.clear();
  }

  private memo<T>(
    key: string,
    compute: () => T
  ): T {
    const cached = this.selectorCache.get(key);
    if (
      cached &&
      cached.version === this.version
    ) {
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
