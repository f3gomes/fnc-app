import React from 'react';

interface ToggleFixedModalProps {
  isOpen: boolean;
  isFixed: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ToggleFixedModal: React.FC<ToggleFixedModalProps> = ({
  isOpen,
  isFixed,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-6 w-full max-w-sm">
        <h3 className="text-lg font-semibold mb-2">
          Alterar tipo de gasto
        </h3>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Deseja alterar este gasto para{' '}
          {isFixed ? 'variável' : 'fixo'}?
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-300 dark:border-gray-700 rounded-lg py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancelar
          </button>

          <button
            onClick={onConfirm}
            className="flex-1 bg-purple-600 text-white rounded-lg py-2 hover:bg-purple-700 transition-colors"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};