import { transactionStore } from './transactionStore.instance';
import { invariant } from '../../utils/invariant';
import { toMonthKey } from '../../utils/monthKey';
import { Transaction } from '../../types/transaction';

export function upsertSalaryForMonth(
  amount: number,
  date = new Date()
) {
  invariant(amount > 0, 'Salary must be positive');

  const month = toMonthKey(date);
  const id = `salary-${month}`;
  const now = Date.now();

  const existing =
    transactionStore
      .getSnapshot()
      .find(t => t.id === id && !t.isDeleted);

  const tx: Transaction = {
    id,
    type: 'income',
    amount,
    source: 'Salary',
    pocketId: null,
    month,
    date: date.getTime(),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    isDeleted: false,
  };

  if (existing) {
    transactionStore.updateTransaction(tx);
  } else {
    transactionStore.addTransaction(tx);
  }
}
