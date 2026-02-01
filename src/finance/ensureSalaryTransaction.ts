import { expenseStore } from '../store/expense/expenseStore.instance';
import { getSalary } from '../store/settingsStore';
import { getCurrentMonth } from '../utils/month';

export function ensureSalaryTransaction() {
  const salary = getSalary();
  if (!salary || salary <= 0) return;

  const month = getCurrentMonth();
  const salaryId = `salary-${month}`;

  const existing = expenseStore
    .getSnapshot()
    .find(
      e =>
        e.id === salaryId &&
        !e.deletedAt
    );

  if (existing) return;

  expenseStore.addExpense({
    id: salaryId,
    pocketId: '__salary__',
    amount: salary,
    month,
    createdAt: new Date(`${month}-01T00:00:00.000Z`).toISOString(),
    note: 'Monthly Salary',
  });
}
