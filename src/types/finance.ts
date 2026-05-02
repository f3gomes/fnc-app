export type TransactionType = 'income' | 'expense';

export type Category = 
  | 'Housing'
  | 'Food'
  | 'Transport'
  | 'Health'
  | 'Education'
  | 'Leisure'
  | 'Income'
  | 'Other';

export interface Transaction {
  id: string;
  date: string; // ISO format or YYYY-MM-DD
  description: string;
  amount: number;
  type: TransactionType;
  category: Category;
  isFixed: boolean;
}

export interface FinanceSummary {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  fixedExpenses: number;
  variableExpenses: number;
}
