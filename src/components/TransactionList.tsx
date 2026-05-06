import React, { useMemo, useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Tag, Calendar, Trash2 } from 'lucide-react';
import type { Category, Transaction } from '../types/finance';
import { ToggleFixedModal } from './ToggleFixedModal';
import { CategoryModal } from './CategoryModal';
import { DeleteTransactionModal } from './DeleteTransactionModal';
import { cn } from '../utils/cn';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Transaction>) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDelete, onUpdate }) => {
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [categoryModal, setCategoryModal] = useState<null | string>(null);
  const [toggleFixedModal, setToggleFixedModal] = useState<null | string>(null);

  const sorted = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const selectedTransactionId = toggleFixedModal ?? categoryModal;

  const selectedTransaction = useMemo(
    () => transactions.find(t => t.id === selectedTransactionId),
    [transactions, selectedTransactionId]
  );

  if (transactions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">Você ainda não tem transações.</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Adicione manualmente ou importe um arquivo CSV.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
      <div className="p-6 border-b border-gray-100 dark:border-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Transações Recentes</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-400 dark:text-gray-500 uppercase bg-gray-50/50 dark:bg-gray-800/50">
            <tr>
              <th scope="col" className="px-6 py-4 font-medium">Descrição</th>
              <th scope="col" className="px-6 py-4 font-medium">Data</th>
              <th scope="col" className="px-6 py-4 font-medium">Categoria</th>
              <th scope="col" className="px-6 py-4 font-medium text-right">Valor</th>
              <th scope="col" className="px-6 py-4 font-medium text-center">Ações</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {sorted.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                      {t.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{t.description}</p>

                      {t.type === 'expense' && (
                        <button
                          onClick={() => setToggleFixedModal(t.id)}
                          className={cn(
                            "inline-flex items-center gap-1 mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full hover:opacity-80 transition-colors",
                            t.isFixed
                              ? "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300"
                              : "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                          )}
                        >
                          {t.isFixed ? 'Gasto Fixo' : 'Gasto Variável'}
                        </button>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    {new Intl.DateTimeFormat('pt-BR').format(new Date(t.date))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-gray-400" />
                    <button
                      onClick={() => setCategoryModal(t.id)}
                      className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 hover:opacity-80"
                    >
                      {t.category}
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <span
                    className={cn(
                      'font-semibold flex gap-1',
                      t.type === 'income'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-red-600 dark:text-red-400'
                    )}
                  >
                    <span>
                      {t.type === 'income' ? '+' : '-'}{' '}
                    </span>

                    <span>
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(Math.abs(t.amount))}
                    </span>
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => setItemToDelete(t.id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ToggleFixedModal
        isOpen={!!toggleFixedModal && !!selectedTransaction}
        isFixed={!!selectedTransaction?.isFixed}
        onClose={() => setToggleFixedModal(null)}
        onConfirm={() => {
          if (selectedTransaction) {
            onUpdate(selectedTransaction.id, {
              isFixed: !selectedTransaction.isFixed,
            });
          }
          setToggleFixedModal(null);
        }}
      />

      <CategoryModal
        isOpen={!!categoryModal && !!selectedTransaction}
        currentCategory={selectedTransaction?.category as Category}
        onClose={() => setCategoryModal(null)}
        onChange={(category) => {
          if (selectedTransaction) {
            onUpdate(selectedTransaction.id, { category });
          }
          setCategoryModal(null);
        }}
      />

      <DeleteTransactionModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={() => {
          if (itemToDelete) {
            onDelete(itemToDelete);
          }
          setItemToDelete(null);
        }}
      />
    </div>
  );
};
