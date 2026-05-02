import React, { useRef, useState } from 'react';
import { useFinanceData } from '../hooks/useFinanceData';
import { SummaryCards } from './SummaryCards';
import { TopExpenses } from './TopExpenses';
import { TransactionList } from './TransactionList';
import { TransactionModal } from './TransactionModal';
import { Plus, Upload, Wallet } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { transactions, summary, topExpenses, addTransaction, deleteTransaction, importTransactions } = useFinanceData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await importTransactions(file);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-black dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-black shadow-lg">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Controle Financeiro</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Visão geral das suas finanças</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="file"
              accept=".csv"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm"
            >
              <Upload className="w-4 h-4" />
              Importar CSV
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Nova Transação
            </button>
          </div>
        </header>

        {/* Resumo */}
        <SummaryCards summary={summary} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <TransactionList transactions={transactions} onDelete={deleteTransaction} />
          </div>
          <div className="lg:col-span-1 space-y-8">
            <TopExpenses expenses={topExpenses} />

            <div className="bg-linear-to-br from-purple-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
              <h3 className="text-lg font-semibold mb-2">Dica Financeira</h3>
              <p className="text-purple-100 text-sm leading-relaxed relative z-10">
                Seus gastos fixos representam {summary.totalExpense > 0 ? ((summary.fixedExpenses / summary.totalExpense) * 100).toFixed(0) : 0}% das suas despesas totais neste mês. Manter este número abaixo de 50% é ideal para uma saúde financeira sólida!
              </p>
            </div>
          </div>
        </div>

      </div>

      <TransactionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={addTransaction}
      />
    </div>
  );
};
