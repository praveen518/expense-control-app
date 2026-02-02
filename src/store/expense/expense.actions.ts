import { Expense } from '../../types/expense';
import { expenseStore } from './expenseStore.instance';
import { balanceStore } from '../balance/balanceStore.instance';
import { invariant } from '../../utils/invariant';

export function addExpenseWithBalance(
  expense: Expense
) {
  invariant(
    expense.amount < 0,
    'Expense amount must be negative'
  );

  expenseStore.addExpense(expense);

  balanceStore.applyDebit(
    Math.abs(expense.amount),
    'expense:add'
  );
}

export function deleteExpenseWithUndo(
  expenseId: string
) {
  const expense =
    expenseStore
      .getSnapshot()
      .find(e => e.id === expenseId);

  invariant(expense, 'Expense not found');

  expenseStore.deleteExpense(expenseId);

  balanceStore.applyCredit(
    Math.abs(expense.amount),
    'expense:delete'
  );
}

export function undoDeleteExpense() {
  const expense =
    expenseStore.getLastDeletedExpense();

  invariant(expense, 'No expense to undo');

  expenseStore.undoDelete();

  balanceStore.applyDebit(
    Math.abs(expense.amount),
    'expense:add'
  );
}

export function editExpenseWithBalance(
  oldExpense: Expense,
  newExpense: Expense
) {
  invariant(
    oldExpense.id === newExpense.id,
    'Expense id mismatch'
  );

  // reverse old
  expenseStore.deleteExpense(oldExpense.id);
  balanceStore.applyCredit(
    Math.abs(oldExpense.amount),
    'expense:edit:old'
  );

  // apply new
  expenseStore.addExpense(newExpense);
  balanceStore.applyDebit(
    Math.abs(newExpense.amount),
    'expense:edit:new'
  );
}
