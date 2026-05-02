import Papa from 'papaparse';

import { inferCategoryAndType } from './categorization';
import type { Transaction } from '../types/finance';

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
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const transactions: Transaction[] = [];

        results.data.forEach((row: Record<string, string>) => {
          // Heuristic to find columns
          // Keys in lower case to make matching easier
          const keys = Object.keys(row);
          const lowerKeys = keys.map(k => k.toLowerCase().trim());

          // Find Date Column
          const dateKey = keys[lowerKeys.findIndex(k => k.includes('data') || k.includes('date'))];
          // Find Description Column
          const descKey = keys[lowerKeys.findIndex(k => k.includes('descrição') || k.includes('descricao') || k.includes('histórico') || k.includes('description') || k.includes('lançamento'))];
          // Find Value Column
          const valueKey = keys[lowerKeys.findIndex(k => k.includes('valor') || k.includes('value') || k.includes('quantia'))];

          if (!descKey || !valueKey) {
            // Skip rows that we cannot interpret at all
            return;
          }

          const rawDate = dateKey ? row[dateKey] : '';
          const rawDesc = row[descKey] || '';
          const rawValue = row[valueKey] || '0';

          const value = normalizeValue(rawValue);
          const date = normalizeDate(rawDate);

          // Ignore zero value transactions
          if (value === 0) return;

          const { category, type, isFixed } = inferCategoryAndType(rawDesc, value);

          transactions.push({
            id: generateId(),
            date,
            description: rawDesc.trim(),
            amount: value,
            type,
            category,
            isFixed
          });
        });

        resolve(transactions);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};
