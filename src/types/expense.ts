// src/types/expense.ts
export type Expense = {
  id: string;
  pocketId: string;

  /**
   * Signed amount
   * +income, -expense
   */
  amount: number;

  /**
   * YYYY-MM (denormalized)
   */
  month: string;

  /**
   * Actual expense date (epoch ms)
   */
  date: number;

  /**
   * Timestamps (epoch ms)
   */
  createdAt: number;
  updatedAt?: number;

  /**
   * Soft delete
   */
  isDeleted: boolean;
  deletedAt?: number;

  /**
   * Optional note
   */
  note?: string;
};
