import type { Category, TransactionType } from "../types/finance";

const fixedKeywords = [
  'netflix', 'spotify', 'amazon prime', 'disney+', 'hbo', 'internet',
  'luz', 'agua', 'água', 'condominio', 'condomínio', 'aluguel', 'seguro',
  'mensalidade', 'escola', 'academia', 'vivo', 'claro', 'tim'
];

const categoryKeywords: Record<Category, string[]> = {
  Housing: ['aluguel', 'condominio', 'condomínio', 'luz', 'agua', 'água', 'internet', 'energia', 'gas', 'gás'],
  Food: ['ifood', 'rappi', 'supermercado', 'mercado', 'padaria', 'restaurante', 'mcdonalds', 'burger king', 'pizza', 'carrefour', 'extra', 'pao de acucar'],
  Transport: ['uber', '99', 'posto', 'combustivel', 'gasolina', 'estacionamento', 'ipva', 'seguro auto', 'pedagio'],
  Health: ['farmacia', 'droga raia', 'pague menos', 'unimed', 'bradesco saude', 'sulamerica', 'medico', 'hospital'],
  Education: ['escola', 'faculdade', 'universidade', 'curso', 'alura', 'udemy', 'mensalidade'],
  Leisure: ['cinema', 'ingresso', 'netflix', 'spotify', 'amazon prime', 'disney+', 'hbo', 'teatro', 'show', 'steam', 'playstation', 'xbox'],
  Income: ['salario', 'salário', 'pix recebido', 'transferencia recebida', 'rendimento', 'ted recebido', 'doc recebido'],
  Other: []
};

export const inferCategoryAndType = (description: string, value: number): { category: Category, type: TransactionType, isFixed: boolean } => {
  const lowerDesc = description.toLowerCase();

  // Basic type inference from value
  const type: TransactionType = value >= 0 ? 'income' : 'expense';

  // Check for installments in credit card (e.g., "01/12", "1/5", "compra parcelada")
  const installmentRegex = /\b\d{1,2}\/\d{1,2}\b/g;
  const hasInstallment = installmentRegex.test(lowerDesc);

  // Check if it's a known fixed expense
  const isKnownFixed = fixedKeywords.some(keyword => lowerDesc.includes(keyword));

  // If it has an installment, it's a fixed expense for the coming months
  const isFixed = type === 'expense' && (hasInstallment || isKnownFixed);

  // Infer category
  let inferredCategory: Category = type === 'income' ? 'Income' : 'Other';

  if (type === 'expense') {
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => lowerDesc.includes(keyword))) {
        inferredCategory = category as Category;
        break;
      }
    }
  }

  return {
    category: inferredCategory,
    type,
    isFixed
  };
};
