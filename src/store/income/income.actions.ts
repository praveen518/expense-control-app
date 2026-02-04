// src/store/income/income.actions.ts
import { Income } from '../../types/income';
import { incomeStore } from './incomeStore.instance';
import { balanceStore } from '../balance/balanceStore.instance';
import { invariant } from '../../utils/invariant';

export function addIncomeWithBalance(income: Income) {
  invariant(income.amount > 0, 'Income must be positive');

  incomeStore.addIncome(income);
  balanceStore.applyCredit(
    income.amount,
    'income:add'
  );
}

export function deleteIncomeWithUndo(incomeId: string) {
  const income =
    incomeStore
      .getSnapshot()
      .find(i => i.id === incomeId);

  invariant(income, 'Income not found');

  incomeStore.deleteIncome(incomeId);
  balanceStore.applyDebit(
    income.amount,
    'income:remove'
  );
}

export function undoDeleteIncome() {
  const income =
    incomeStore.getLastDeletedIncome();

  invariant(income, 'Nothing to undo');

  incomeStore.undoDelete();
  balanceStore.applyCredit(
    income.amount,
    'income:add'
  );
}
