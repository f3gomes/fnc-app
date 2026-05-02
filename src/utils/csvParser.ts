import Papa from 'papaparse';

import { inferCategoryAndType, categoryKeywords } from './categorization';
import type { Transaction } from '../types/finance';

// Helper to check if it's an obvious expense
const isObviousExpense = (desc: string): boolean => {
  const lowerDesc = desc.toLowerCase();
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (category === 'Income' || category === 'Other') continue;
    if (keywords.some(keyword => lowerDesc.includes(keyword))) {
      return true;
    }
  }
  return false;
};

// Helper to generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 11);

// Normalize value from string (e.g., "R$ -1.500,00" or "-1500.00") to number
const normalizeValue = (val: string): number => {
  if (!val) return 0;
  // Remove R$, spaces, etc.
  let cleaned = val.replace(/[R$\s]/g, '');
  // Handle Brazilian format: -1.500,00 -> -1500.00
  if (cleaned.includes(',') && cleaned.includes('.')) {
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  } else if (cleaned.includes(',')) {
    cleaned = cleaned.replace(',', '.');
  }
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

// Normalize date from DD/MM/YYYY to YYYY-MM-DD
const normalizeDate = (dateStr: string): string => {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    // DD/MM/YYYY or MM/DD/YYYY? Assuming Brazilian DD/MM/YYYY
    const [day, month, year] = parts;
    const fullYear = year.length === 2 ? `20${year}` : year;
    return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  // Try to parse normally if it's not DD/MM/YYYY
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }
  return new Date().toISOString().split('T')[0];
};

export const parseCsv = (file: File): Promise<Transaction[]> => {
  return new Promise((resolve, reject) => {
    const lowerName = file.name.toLowerCase();
    const isNameCreditCard = lowerName.includes('fatura') || 
                             lowerName.includes('cartao') || 
                             lowerName.includes('cartão') || 
                             lowerName.includes('credit');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        let positiveValuesCount = 0;
        let obviousExpensesInPositiveValues = 0;

        const parsedRows = results.data.map((row: Record<string, string>) => {
          // Heuristic to find columns
          const keys = Object.keys(row);
          const lowerKeys = keys.map(k => k.toLowerCase().trim());

          const dateKey = keys[lowerKeys.findIndex(k => k.includes('data') || k.includes('date'))];
          const descKey = keys[lowerKeys.findIndex(k => k.includes('descrição') || k.includes('descricao') || k.includes('histórico') || k.includes('description') || k.includes('lançamento'))];
          const valueKey = keys[lowerKeys.findIndex(k => k.includes('valor') || k.includes('value') || k.includes('quantia'))];

          if (!descKey || !valueKey) {
            return null;
          }

          const rawDate = dateKey ? row[dateKey] : '';
          const rawDesc = row[descKey] || '';
          const rawValue = row[valueKey] || '0';

          const value = normalizeValue(rawValue);
          
          if (value === 0) return null;

          if (value > 0) {
            positiveValuesCount++;
            if (isObviousExpense(rawDesc)) {
              obviousExpensesInPositiveValues++;
            }
          }

          return { rawDate, rawDesc, value };
        }).filter(Boolean) as { rawDate: string, rawDesc: string, value: number }[];

        // If it's a credit card, we usually have positive values for expenses.
        // If more than 30% of positive values are obvious expenses, it's very likely a credit card bill.
        const isPatternCreditCard = positiveValuesCount > 0 && (obviousExpensesInPositiveValues / positiveValuesCount) >= 0.3;

        const isCreditCard = isNameCreditCard || isPatternCreditCard;

        const transactions: Transaction[] = parsedRows.map(({ rawDate, rawDesc, value }) => {
          const date = normalizeDate(rawDate);
          const { category, type, isFixed } = inferCategoryAndType(rawDesc, value, isCreditCard);

          let finalValue = value;
          if (type === 'expense' && finalValue > 0) {
            finalValue = -finalValue;
          } else if (type === 'income' && finalValue < 0) {
            finalValue = Math.abs(finalValue);
          }

          return {
            id: generateId(),
            date,
            description: rawDesc.trim(),
            amount: finalValue,
            type,
            category,
            isFixed
          };
        });

        resolve(transactions);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};
