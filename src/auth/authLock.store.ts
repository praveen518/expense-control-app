// src/auth/authLock.store.ts
import { getGlobalPinHash, saveGlobalPinHash } from './authLock.adapter';
import { hashPin } from './pinHash';

type Snapshot = {
  unlocked: boolean;
  hasPin: boolean;
};

class AuthLockStore {
  private unlocked = false;
  private hasPin = false;

  private listeners = new Set<() => void>();
  private snapshot: Snapshot = {
    unlocked: false,
    hasPin: false,
  };

  /* =========================
     React subscription
     ========================= */

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getSnapshot() {
    console.log('[SNAPSHOT]', 'AuthLockStore');
    return this.snapshot;
  }

  private emit() {
    this.snapshot = {
      unlocked: this.unlocked,
      hasPin: this.hasPin,
    };
    for (const l of this.listeners) l();
  }

  /* =========================
     Hydration
     ========================= */

  hydrateFromSQLite() {
    const pinHash = getGlobalPinHash();
    this.hasPin = !!pinHash;
    this.unlocked = false;
    this.emit();
  }

  /* =========================
     Actions
     ========================= */

  setPin(pin: string) {
    const hash = hashPin(pin);
    saveGlobalPinHash(hash);
    this.hasPin = true;
    this.unlocked = true;
    this.emit();
  }

  verifyPin(pin: string): boolean {
    const storedHash = getGlobalPinHash();
    if (!storedHash) return false;

    const ok = hashPin(pin) === storedHash;
    if (ok) {
      this.unlocked = true;
      this.emit();
    }
    return ok;
  }

  lock() {
    this.unlocked = false;
    this.emit();
  }
}

export const authLockStore = new AuthLockStore();
