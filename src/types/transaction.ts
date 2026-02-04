export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  amount: number; // +income, -expense (SOURCE OF TRUTH)
  type: TransactionType;

  pocketId?: string | null;
  source?: string;
  category?: string;

  month: string; // YYYY-MM
  date: number;

  createdAt: number;
  updatedAt?: number;
  deletedAt?: number | null;
  isDeleted?: boolean;
}
