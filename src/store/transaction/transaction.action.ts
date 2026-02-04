// src/store/transaction/transaction.actions.ts
import { v4 as uuid } from 'uuid';
import { Transaction } from '../../types/transaction';
import { transactionStore } from './transactionStore.instance';
import { invariant } from '../../utils/invariant';
import { toMonthKey } from '../../utils/monthKey';

type AddIncomeInput = {
  amount: number; // positive number from UI
  source: string;
  date: Date;
};

type AddExpenseInput = {
  amount: number; // positive number from UI
  pocketId: string;
  category?: string;
  note?: string;
  date: Date;
};

/* =========================
   ADD INCOME
   ========================= */

export function addIncome({
  amount,
  source,
  date,
}: AddIncomeInput) {
  invariant(amount > 0, 'Income amount must be positive');
  invariant(source, 'Income source required');

  const tx: Transaction = {
    id: uuid(),
    type: 'income',
    amount: Math.abs(amount),

    source,
    pocketId: null,

    month: toMonthKey(date),
    date: date.getTime(),

    createdAt: Date.now(),
    isDeleted: false,
  };

  transactionStore.addTransaction(tx);
}

/* =========================
   ADD EXPENSE
   ========================= */

export function addExpense({
  amount,
  pocketId,
  category,
  note,
  date,
}: AddExpenseInput) {
  invariant(amount > 0, 'Expense amount must be positive');
  invariant(pocketId, 'Expense must belong to a pocket');

  const tx: Transaction = {
    id: uuid(),
    type: 'expense',
    amount: -Math.abs(amount), // 🔴 signed here

    pocketId,
    category,
    source: note, // optional reuse if you want parity

    month: toMonthKey(date),
    date: date.getTime(),

    createdAt: Date.now(),
    isDeleted: false,
  };

  transactionStore.addTransaction(tx);
}
