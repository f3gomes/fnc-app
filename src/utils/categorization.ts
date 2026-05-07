import type { Category, TransactionType } from "../types/finance";

const fixedKeywords = [
  "netflix",
  "spotify",
  "amazon prime",
  "disney+",
  "hbo",
  "internet",
  "luz",
  "agua",
  "água",
  "condominio",
  "condomínio",
  "aluguel",
  "seguro",
  "mensalidade",
  "escola",
  "academia",
  "vivo",
  "claro",
  "tim",
];

export const categoryKeywords: Record<Category, string[]> = {
  Housing: [
    "aluguel",
    "condominio",
    "condomínio",
    "luz",
    "agua",
    "água",
    "internet",
    "energia",
    "gas",
    "gás",
    "prefortaleza",
  ],

  Food: [
    "ifood",
    "rappi",
    "supermercado",
    "mercado",
    "padaria",
    "restaurante",
    "mcdonalds",
    "mc donalds",
    "burger king",
    "bk",
    "pizza",
    "carrefour",
    "extra",
    "pao de acucar",
    "pão de açúcar",
    "gostosinho da china",
  ],

  Transport: [
    "uber",
    "99",
    "posto",
    "combustivel",
    "combustível",
    "gasolina",
    "estacionamento",
    "ipva",
    "seguro auto",
    "pedagio",
    "pedágio",
    "zul",
    "auto pecas",
    "auto peças",
    "posto l e s",
  ],

  Health: [
    "farmacia",
    "farmácias",
    "farmacias",
    "droga raia",
    "pague menos",
    "unimed",
    "bradesco saude",
    "bradesco saúde",
    "sulamerica",
    "sulamérica",
    "medico",
    "médico",
    "hospital",
    "farmacias aldesul",
  ],

  Education: [
    "escola",
    "faculdade",
    "universidade",
    "curso",
    "alura",
    "udemy",
    "mensalidade",
  ],

  Leisure: [
    "cinema",
    "ingresso",
    "netflix",
    "spotify",
    "amazon prime",
    "disney+",
    "hbo",
    "teatro",
    "show",
    "steam",
    "playstation",
    "xbox",
    "airbnb",
    "iap cosmeticos",
    "iap cosméticos",
  ],

  Income: [
    "salario",
    "salário",
    "pix recebido",
    "transferencia recebida",
    "transferência recebida",
    "rendimento",
    "ted recebido",
    "doc recebido",
  ],

  Other: ["diegorogerysalves"],
};

export const inferCategoryAndType = (
  description: string,
  value: number,
  isCreditCard: boolean = false,
): { category: Category; type: TransactionType; isFixed: boolean } => {
  const lowerDesc = description.toLowerCase();

  const type: TransactionType = isCreditCard
    ? value >= 0
      ? "expense"
      : "income"
    : value >= 0
      ? "income"
      : "expense";

  const installmentRegex = /\b\d{1,2}\/\d{1,2}\b/g;
  const hasInstallment = installmentRegex.test(lowerDesc);

  const isKnownFixed = fixedKeywords.some((keyword) =>
    lowerDesc.includes(keyword),
  );

  const isFixed = type === "expense" && (hasInstallment || isKnownFixed);

  let inferredCategory: Category = type === "income" ? "Income" : "Other";

  if (type === "expense") {
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some((keyword) => lowerDesc.includes(keyword))) {
        inferredCategory = category as Category;
        break;
      }
    }
  }

  return {
    category: inferredCategory,
    type,
    isFixed,
  };
};
