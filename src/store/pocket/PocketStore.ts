import { Pocket } from '../../types/pocket';
import { invariant } from '../../utils/invariant';
import {
  getPockets,
  addPocket as addPocketRow,
  deletePocket as deletePocketRow,
} from '../../db/pocket.adapter';
import { transactionStore } from '../transaction/transactionStore.instance';

/**
 * PocketStore
 *
 * - Owns pocket definitions (id, name, allocated)
 * - Does NOT own money
 * - Spent is derived from TransactionStore
 */
export class PocketStore {
  private pockets = new Map<string, Pocket>();
  private listeners = new Set<() => void>();
  private snapshot: Pocket[] = [];

  /* =========================
     Subscription
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
    console.log('[SNAPSHOT]', 'PocketStore');
    return this.snapshot;
  }

  /* =========================
     Hydration
     ========================= */

  hydrateFromSQLite() {
    const rows = getPockets();
    this.pockets.clear();

    for (const p of rows) {
      invariant(p.id, 'Pocket missing id');
      invariant(p.name, 'Pocket missing name');
      invariant(
        Number.isFinite(p.allocated),
        'Pocket allocated invalid'
      );

      this.pockets.set(p.id, {
        id: p.id,
        name: p.name,
        allocated: p.allocated,
        spent: 0, // derived, never stored
      });
    }

    this.emit();
  }

  /* =========================
     Writes
     ========================= */

  async addPocket(pocket: Pocket) {
    invariant(pocket.id, 'Pocket must have id');
    invariant(pocket.name, 'Pocket must have name');

    await addPocketRow(pocket);
    this.pockets.set(pocket.id, pocket);
    this.emit();
  }

  deletePocket(pocketId: string) {
    invariant(this.pockets.has(pocketId), 'Pocket not found');

    deletePocketRow(pocketId);
    this.pockets.delete(pocketId);
    this.emit();
  }

  /* =========================
     Reads (derived)
     ========================= */

  getPocketById(id: string) {
    return this.pockets.get(id) ?? null;
  }

  getPocketSummaryForMonth(
    pocketId: string,
    month: string
  ) {
    const pocket = this.pockets.get(pocketId);
    if (!pocket) return null;

    const spent =
      transactionStore.getTotalSpentForPocketInMonth(
        pocketId,
        month
      );

    return {
      pocket,
      allocated: pocket.allocated,
      remaining: pocket.allocated - spent,
    };
  }

  getAllPocketSummaries(month: string) {
    return Array.from(this.pockets.values()).map(
      pocket => {
        const spent =
          transactionStore.getTotalSpentForPocketInMonth(
            pocket.id,
            month
          );

        return {
          pocket,
          allocated: pocket.allocated,
          remaining: pocket.allocated - spent,
        };
      }
    );
  }
}

export const pocketStore = new PocketStore();
