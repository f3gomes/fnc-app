import React from 'react';
import { cn } from '../utils/cn';
import type { Category } from '../types/finance';

interface CategoryModalProps {
  isOpen: boolean;
  currentCategory: Category;
  onClose: () => void;
  onChange: (category: Category) => void;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  currentCategory,
  onClose,
  onChange,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-6 w-full max-w-sm">
        <h3 className="text-lg font-semibold mb-4">Alterar categoria</h3>

        <select
          value={currentCategory}
          onChange={(e) => onChange(e.target.value as Category)}
          className={cn(
            "w-full p-2 rounded-md border text-sm",
            "bg-white text-gray-900 border-gray-300",
            "dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700",
            "focus:outline-none focus:ring-2 focus:ring-blue-500"
          )}
        >
          <option value="food">Alimentação</option>
          <option value="transport">Transporte</option>
          <option value="housing">Moradia</option>
          <option value="salary">Salário</option>
          <option value="other">Outros</option>
        </select>

        <button
          onClick={onClose}
          className="mt-4 text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-lg py-2 px-4 w-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};