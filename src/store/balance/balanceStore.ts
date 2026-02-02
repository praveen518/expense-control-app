import AsyncStorage from '@react-native-async-storage/async-storage';
import { invariant } from '../../utils/invariant';
import { BalanceMutationReason } from './balance.types';

const BALANCE_KEY = 'balance.current';

export class BalanceStore {
  private balance = 0;
  private listeners = new Set<() => void>();

  /* =========================
     Hydration
     ========================= */

  async hydrate() {
    const raw = await AsyncStorage.getItem(BALANCE_KEY);
    this.balance = raw ? Number(raw) : 0;

    invariant(
      Number.isFinite(this.balance),
      'Hydrated balance must be a finite number'
    );

    this.emit();
  }

  /* =========================
     Subscription
     ========================= */

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit() {
    for (const l of this.listeners) l();
  }

  /* =========================
     Reads
     ========================= */

  getBalance() {
    return this.balance;
  }

  getSnapshot() {
    return this.balance;
  }

  /* =========================
     Writes (ONLY these)
     ========================= */

  async setOpeningBalance(amount: number) {
    invariant(
      Number.isFinite(amount),
      'Opening balance must be finite'
    );

    this.balance = amount;
    await AsyncStorage.setItem(
      BALANCE_KEY,
      String(this.balance)
    );
    this.emit();
  }

  async applyCredit(
    amount: number,
    _reason: BalanceMutationReason
  ) {
    invariant(
      Number.isFinite(amount) && amount > 0,
      'Credit amount must be positive & finite'
    );

    this.balance += amount;

    await AsyncStorage.setItem(
      BALANCE_KEY,
      String(this.balance)
    );
    this.emit();
  }

  async applyDebit(
    amount: number,
    _reason: BalanceMutationReason
  ) {
    invariant(
      Number.isFinite(amount) && amount > 0,
      'Debit amount must be positive & finite'
    );

    this.balance -= amount;

    await AsyncStorage.setItem(
      BALANCE_KEY,
      String(this.balance)
    );
    this.emit();
  }
}
