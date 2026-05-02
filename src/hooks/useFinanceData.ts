import { useState, useMemo, useEffect } from 'react';

import { parseCsv } from '../utils/csvParser';
import type { FinanceSummary, Transaction } from '../types/finance';

export const useFinanceData = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('@finance:transactions');
    return saved ? JSON.parse(saved) : [];
  });
  const [importedFiles, setImportedFiles] = useState<string[]>(() => {
    const saved = localStorage.getItem('@finance:importedFiles');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('@finance:transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('@finance:importedFiles', JSON.stringify(importedFiles));
  }, [importedFiles]);

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

  const clearAllData = () => {
    setTransactions([]);
    setImportedFiles([]);
    localStorage.removeItem('@finance:transactions');
    localStorage.removeItem('@finance:importedFiles');
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
    const expenses = transactions.filter(t => {
      if (t.type !== 'expense') return false;
      const lowerDesc = t.description.toLowerCase();
      if (lowerDesc.includes('pagamento efetuado') || lowerDesc.includes('pagamento de fatura')) {
        return false;
      }
      return true;
    });
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
    deleteTransaction,
    clearAllData
  };
};
