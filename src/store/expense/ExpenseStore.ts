import { Expense } from "../../types/expense";
import * as expenseStorage from "../../storage/expenseStorage";

export class ExpenseStore {
  private expenses = new Map<string, Expense>();
  private listeners = new Set<() => void>();

  // ✅ cached snapshot
  private snapshot: Expense[] = [];

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit() {
    // 🔑 update snapshot ONLY when data changes
    this.snapshot = Array.from(this.expenses.values());
    for (const l of this.listeners) l();
  }

  getSnapshot(): Expense[] {
    // ✅ same reference unless emit() ran
    return this.snapshot;
  }

  async init() {
    const storedExpenses = await expenseStorage.getExpenses();

    this.expenses.clear();
    for (const e of storedExpenses) {
      this.expenses.set(e.id, e);
    }

    this.emit(); // snapshot created here
  }

  async addExpense(expense: Expense) {
    await expenseStorage.addExpense(expense);
    this.expenses.set(expense.id, expense);
    this.emit();
  }
}
