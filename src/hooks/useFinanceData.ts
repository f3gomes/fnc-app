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

    const grouped = expenses.reduce((acc, t) => {
      const key = t.description.trim().toLowerCase();
      if (!acc[key]) {
        acc[key] = { ...t, subTransactions: [t] };
      } else {
        acc[key].amount += t.amount;
        acc[key].subTransactions.push(t);
      }
      return acc;
    }, {} as Record<string, Transaction & { subTransactions: Transaction[] }>);

    return Object.values(grouped)
      .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
      .slice(0, 5); // Top 5
  }, [transactions]);

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions(prev =>
      prev.map(t => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const exportToJson = () => {
    try {
      const data = {
        transactions,
        importedFiles,
      };

      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `finance-backup-${new Date().toISOString()}.json`;
      a.click();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao exportar JSON', error);
      alert('Erro ao exportar dados.');
    }
  };

  const importFromJson = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      if (
        !parsed ||
        !Array.isArray(parsed.transactions) ||
        !Array.isArray(parsed.importedFiles)
      ) {
        throw new Error('Formato inválido');
      }

      const isValidTransaction = (t: Transaction): t is Transaction => {
        return (
          typeof t.id === 'string' &&
          typeof t.date === 'string' &&
          typeof t.description === 'string' &&
          typeof t.amount === 'number' &&
          (t.type === 'income' || t.type === 'expense') &&
          typeof t.category === 'string' &&
          typeof t.isFixed === 'boolean'
        );
      };

      const validTransactions = parsed.transactions.filter(isValidTransaction);

      setTransactions(validTransactions);
      setImportedFiles(parsed.importedFiles);

    } catch (error) {
      console.error('Erro ao importar JSON', error);
      alert('Arquivo JSON inválido.');
    }
  };

  return {
    transactions,
    summary,
    topExpenses,
    importedFiles,
    addTransaction,
    importTransactions,
    deleteTransaction,
    clearAllData,
    updateTransaction,
    exportToJson,
    importFromJson
  };
};
