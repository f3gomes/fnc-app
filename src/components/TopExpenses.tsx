import React, { useState } from 'react';

import { Flame, Calendar, Tag, AlertCircle, FileText } from 'lucide-react';
import type { Transaction } from '../types/finance';

interface GroupedTransaction extends Transaction {
  subTransactions?: Transaction[];
}

interface TopExpensesProps {
  expenses: GroupedTransaction[];
}

export const TopExpenses: React.FC<TopExpensesProps> = ({ expenses }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (expenses.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 flex flex-col items-center justify-center min-h-[300px]">
        <Flame className="w-12 h-12 text-gray-300 dark:text-gray-700 mb-4" />
        <p className="text-gray-500 dark:text-gray-400 font-medium">Nenhum gasto registrado</p>
      </div>
    );
  }

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

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
          const isExpanded = expandedId === expense.id;

          return (
            <div
              key={expense.id}
              className={`relative p-3 -mx-3 rounded-xl transition-colors cursor-pointer ${isExpanded ? 'bg-gray-50 dark:bg-gray-800/50' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
              onClick={() => toggleExpand(expense.id)}
            >
              <div className="flex justify-between items-center mb-2 relative z-10">
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

              {/* Dropdown Details */}
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/50 flex flex-col gap-2 text-xs animate-in slide-in-from-top-2 fade-in duration-200">
                  {expense.subTransactions && expense.subTransactions.length > 1 ? (
                    <div className="space-y-2">
                      <div className="text-gray-500 dark:text-gray-400 font-medium mb-1">
                        {expense.subTransactions.length} transações agrupadas:
                      </div>
                      {expense.subTransactions.map(sub => (
                        <div key={sub.id} className="flex flex-col gap-1 p-2 bg-gray-50 dark:bg-gray-800/80 rounded-lg">
                          <div className="flex justify-between items-start">
                            <span className="font-medium text-gray-700 dark:text-gray-300 wrap-break-word pr-2">{sub.description}</span>
                            <span className="font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(sub.amount))}
                            </span>
                          </div>
                          <div className="flex gap-3 text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{new Date(sub.date).toLocaleDateString('pt-BR')}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Tag className="w-3 h-3" />
                              <span>{sub.category}</span>
                            </div>
                            {sub.isFixed && (
                              <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                                <AlertCircle className="w-3 h-3" />
                                <span>Fixa</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start gap-1.5 text-gray-600 dark:text-gray-400">
                        <FileText className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                        <span className="wrap-break-word whitespace-normal">{expense.description}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(expense.date).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                          <Tag className="w-3.5 h-3.5" />
                          <span>{expense.category}</span>
                        </div>
                      </div>
                      {expense.isFixed && (
                        <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400 mt-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Despesa Fixa</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
