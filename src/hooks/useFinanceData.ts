import { useState, useMemo } from 'react';

import { parseCsv } from '../utils/csvParser';
import type { FinanceSummary, Transaction } from '../types/finance';

export const useFinanceData = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [importedFiles, setImportedFiles] = useState<string[]>([]);

  const addTransaction = (transaction: Transaction) => {
    setTransactions(prev => [...prev, transaction]);
  };

  const importTransactions = async (file: File) => {
    try {
      const newTransactions = await parseCsv(file);
      setTransactions(prev => [...prev, ...newTransactions]);
      setImportedFiles(prev => [...prev, file.name]);
    } catch (error) {
      console.error('Error parsing CSV', error);
      alert('Erro ao importar arquivo CSV.');
    }
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const summary = useMemo<FinanceSummary>(() => {
    return transactions.reduce(
      (acc, t) => {
        if (t.type === 'income') {
          acc.totalIncome += t.amount;
        } else {
          // ensure amount is positive for expenses in the summary
          const amount = Math.abs(t.amount);
          acc.totalExpense += amount;
          if (t.isFixed) {
            acc.fixedExpenses += amount;
          } else {
            acc.variableExpenses += amount;
          }
        }
        acc.totalBalance = acc.totalIncome - acc.totalExpense;
        return acc;
      },
      {
        totalBalance: 0,
        totalIncome: 0,
        totalExpense: 0,
        fixedExpenses: 0,
        variableExpenses: 0,
      }
    );
  }, [transactions]);

  const topExpenses = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    return expenses
      .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
      .slice(0, 5); // Top 5
  }, [transactions]);

  return {
    transactions,
    summary,
    topExpenses,
    importedFiles,
    addTransaction,
    importTransactions,
    deleteTransaction
  };
};
