export type TransactionType = "income" | "expense";

export type Category =
  | "Housing"
  | "Food"
  | "Transport"
  | "Health"
  | "Education"
  | "Leisure"
  | "Income"
  | "Other";

export const categoryPtBrMap: Record<Category, string> = {
  Housing: "Moradia",
  Food: "Alimentação",
  Transport: "Transporte",
  Health: "Saúde",
  Education: "Educação",
  Leisure: "Lazer",
  Income: "Renda",
  Other: "Outros",
};

export const translateCategory = (category: Category): string => {
  return categoryPtBrMap[category];
};

export interface Transaction {
  id: string;
  date: string; // ISO format or YYYY-MM-DD
  description: string;
  amount: number;
  type: TransactionType;
  category: Category;
  isFixed: boolean;
  excludeFromTopExpenses?: boolean;
}

export interface FinanceSummary {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  fixedExpenses: number;
  variableExpenses: number;
}
