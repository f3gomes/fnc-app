import React from 'react';

import { TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react';
import type { FinanceSummary } from '../types/finance';
import { cn } from '../utils/cn';

interface SummaryCardsProps {
  summary: FinanceSummary;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const SummaryCards: React.FC<SummaryCardsProps> = ({ summary }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Saldo Atual */}
      <div className={cn("p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800",
        summary.totalBalance >= 0 ? "bg-emerald-50 dark:bg-emerald-950/20" : "bg-red-50 dark:bg-red-950/20"
      )}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Saldo Atual</h3>
          <div className={cn("p-2 rounded-full", summary.totalBalance >= 0 ? "bg-emerald-100 dark:bg-emerald-900/50" : "bg-red-100 dark:bg-red-900/50")}>
            <DollarSign className={cn("w-5 h-5", summary.totalBalance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400")} />
          </div>
        </div>
        <p className={cn("text-3xl font-bold", summary.totalBalance >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400")}>
          {formatCurrency(summary.totalBalance)}
        </p>
      </div>

      {/* Receitas */}
      <div className="p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Receitas</h3>
          <div className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-900/50">
            <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
        <p className="text-3xl font-bold text-gray-900 dark:text-gray-50">
          {formatCurrency(summary.totalIncome)}
        </p>
      </div>

      {/* Despesas */}
      <div className="p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Despesas Totais</h3>
          <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/50">
            <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
        </div>
        <p className="text-3xl font-bold text-gray-900 dark:text-gray-50">
          {formatCurrency(summary.totalExpense)}
        </p>
      </div>

      {/* Fixas vs Variáveis */}
      <div className="p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Fixas vs Variáveis</h3>
          <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/50">
            <PieChart className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500 dark:text-gray-400">Fixas</span>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{formatCurrency(summary.fixedExpenses)}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5 mb-2">
            <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: summary.totalExpense ? `${(summary.fixedExpenses / summary.totalExpense) * 100}%` : '0%' }}></div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500 dark:text-gray-400">Variáveis</span>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{formatCurrency(summary.variableExpenses)}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5">
            <div className="bg-orange-400 h-1.5 rounded-full" style={{ width: summary.totalExpense ? `${(summary.variableExpenses / summary.totalExpense) * 100}%` : '0%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};
