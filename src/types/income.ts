// src/types/income.ts

export type Income = {
  id: string;

  /**
   * Always positive
   * Represents incoming money
   */
  amount: number;

  /**
   * Salary | Gift | Bonus | Custom
   */
  source: string;

  /**
   * YYYY-MM (denormalized)
   */
  month: string;

  /**
   * Actual received date (epoch ms)
   */
  date: number;

  /**
   * Metadata
   */
  createdAt: number;
  updatedAt?: number;

  /**
   * Soft delete
   */
  isDeleted: boolean;
  deletedAt?: number;
};
