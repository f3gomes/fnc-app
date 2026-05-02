import React from 'react';

import { Flame } from 'lucide-react';
import type { Transaction } from '../types/finance';

interface TopExpensesProps {
  expenses: Transaction[];
}

export const TopExpenses: React.FC<TopExpensesProps> = ({ expenses }) => {
  if (expenses.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 flex flex-col items-center justify-center min-h-[300px]">
        <Flame className="w-12 h-12 text-gray-300 dark:text-gray-700 mb-4" />
        <p className="text-gray-500 dark:text-gray-400 font-medium">Nenhum gasto registrado</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
          <Flame className="w-5 h-5 text-orange-600 dark:text-orange-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Maiores Gastos</h3>
      </div>

      <div className="space-y-4">
        {expenses.map((expense, index) => {
          const maxAmount = Math.abs(expenses[0].amount);
          const percentage = (Math.abs(expense.amount) / maxAmount) * 100;

          return (
            <div key={expense.id} className="relative">
              <div className="flex justify-between items-center mb-1 relative z-10">
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate pr-4 max-w-[200px]" title={expense.description}>
                  {index + 1}. {expense.description}
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(expense.amount))}
                </span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 relative overflow-hidden">
                <div
                  className="bg-orange-400 dark:bg-orange-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%`, opacity: Math.max(0.4, 1 - index * 0.15) }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
