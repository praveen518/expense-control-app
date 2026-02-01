// src/store/pocket/pocketStore.ts
import { Pocket } from '../../types/pocket';
import * as pocketAdapter from '../../db/pocket.adapter';
import { expenseStore } from '../expense/expenseStore.instance';

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
      this.pockets.set(p.id, p);
    }

    this.bumpVersion();
    this.emit();
  }

  /* =========================
     Writes (SQLite)
     ========================= */

  addPocket(pocket: Pocket) {
    pocketAdapter.addPocket(pocket);
    this.pockets.set(pocket.id, pocket);
    this.bumpVersion();
    this.emit();
  }

  updatePocket(pocket: Pocket) {
    pocketAdapter.updatePocket(pocket);
    this.pockets.set(pocket.id, pocket);
    this.bumpVersion();
    this.emit();
  }

  deletePocket(id: string) {
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

        const spent =
          expenseStore.getSpentForPocketInMonth(
            pocketId,
            month
          );

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
          const spent =
            expenseStore.getSpentForPocketInMonth(
              pocket.id,
              month
            );

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
