import React, { useRef, useState } from "react";
import { useFinanceData } from "../hooks/useFinanceData";
import { SummaryCards } from "./SummaryCards";
import { TopExpenses } from "./TopExpenses";
import { TransactionList } from "./TransactionList";
import { TransactionModal } from "./TransactionModal";
import { Plus, Upload, Wallet, Trash2, Download } from "lucide-react";
import { ConfirmModal } from "./ConfirmModal";

export const Dashboard: React.FC = () => {
  const {
    transactions,
    summary,
    topExpenses,
    importedFiles,
    addTransaction,
    deleteTransaction,
    importTransactions,
    clearAllData,
    updateTransaction,
    exportToJson,
    importFromJson,
    deleteExpenseGroup,
  } = useFinanceData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [focusedTransactionId, setFocusedTransactionId] = useState<
    string | null
  >(null);

  const [isModalBackupOpen, setIsModalBackupOpen] = useState(false);
  const [isModalRestoreOpen, setIsModalRestoreOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      if (importedFiles.includes(file.name)) {
        setAlertMessage(`arquivo '${file.name}' já importado`);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      await importTransactions(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleJsonUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      if (importedFiles.includes(file.name)) {
        setAlertMessage(`arquivo '${file.name}' já importado`);
        if (jsonInputRef.current) {
          jsonInputRef.current.value = "";
        }
        return;
      }

      await importFromJson(file);
      if (jsonInputRef.current) {
        jsonInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-black dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-black shadow-lg">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl w-56 font-bold tracking-tight text-gray-900 dark:text-white">
                Controle Financeiro
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Visão geral das suas finanças
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setIsClearModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors shadow-sm md:flex"
              title="Limpar todos os dados"
            >
              <Trash2 className="w-4 h-4" />
              <span className="md:block hidden">Limpar Dados</span>
            </button>

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
              <span className="md:block hidden">Importar CSV</span>
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="md:block hidden">Nova Transação</span>
            </button>

            <div className="relative group">
              <button
                onClick={() => setIsModalBackupOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#2563EB]! dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-[#1D4ED8] dark:hover:bg-gray-800 transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" />
              </button>

              <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-10 whitespace-nowrap rounded-md bg-gray-900 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Backup
              </span>
            </div>

            <input
              type="file"
              accept=".json"
              className="hidden"
              ref={jsonInputRef}
              onChange={handleJsonUpload}
            />

            <div className="relative group">
              <button
                onClick={() => setIsModalRestoreOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#FB923C]! dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-[#EA580C]! dark:hover:bg-gray-800 transition-colors shadow-sm"
              >
                <Upload className="w-4 h-4" />
              </button>

              <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-10 whitespace-nowrap rounded-md bg-gray-900 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Restaurar
              </span>
            </div>
          </div>
        </header>

        <SummaryCards summary={summary} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <TransactionList
              transactions={transactions}
              onDelete={deleteTransaction}
              onUpdate={updateTransaction}
              focusedTransactionId={focusedTransactionId}
            />
          </div>
          <div className="lg:col-span-1 space-y-8">
            <TopExpenses
              expenses={topExpenses}
              onDeleteGroup={deleteExpenseGroup}
              onFocusTransaction={setFocusedTransactionId}
            />

            <div className="bg-linear-to-br from-purple-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
              <h3 className="text-lg font-semibold mb-2">Dica Financeira</h3>
              <p className="text-purple-100 text-sm leading-relaxed relative z-10">
                Seus gastos fixos representam{" "}
                {summary.totalExpense > 0
                  ? (
                      (summary.fixedExpenses / summary.totalExpense) *
                      100
                    ).toFixed(0)
                  : 0}
                % das suas despesas totais neste mês. Manter este número abaixo
                de 50% é ideal para uma saúde financeira sólida!
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

      <ConfirmModal
        isOpen={isModalBackupOpen}
        onClose={() => setIsModalBackupOpen(false)}
        onConfirm={() => {
          exportToJson();
          setIsModalBackupOpen(false);
        }}
        title="Backup"
        description="Deseja fazer o backup?"
        confirmText="Backup"
        cancelText="Cancelar"
      />

      <ConfirmModal
        isOpen={isModalRestoreOpen}
        onClose={() => setIsModalRestoreOpen(false)}
        onConfirm={() => {
          jsonInputRef.current?.click();
          setIsModalRestoreOpen(false);
        }}
        title="Restore"
        description="Restaurar a partir de um arquivo JSON?"
        confirmText="Restaurar"
        cancelText="Cancelar"
      />

      {alertMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-xl w-full max-w-sm shadow-2xl p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Aviso
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {alertMessage}
            </p>
            <button
              onClick={() => setAlertMessage(null)}
              className="w-full px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors font-medium text-sm shadow-sm"
            >
              Entendi
            </button>
          </div>
        </div>
      )}

      {isClearModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-xl w-full max-w-sm shadow-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Limpar Todos os Dados
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Tem certeza que deseja excluir todas as transações e o histórico
              de importação? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsClearModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium text-sm"
              >
                Cancelar
              </button>

              <button
                onClick={() => {
                  clearAllData();
                  setIsClearModalOpen(false);
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
              >
                Excluir Tudo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
