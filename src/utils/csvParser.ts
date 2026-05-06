import Papa, { type ParseResult } from "papaparse";

import { inferCategoryAndType, categoryKeywords } from "./categorization";
import type { Transaction } from "../types/finance";

type CsvRow = Record<string, string | undefined>;

const isObviousExpense = (desc: string): boolean => {
  const lowerDesc = desc.toLowerCase();
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (category === "Income" || category === "Other") continue;
    if (keywords.some((keyword) => lowerDesc.includes(keyword))) {
      return true;
    }
  }
  return false;
};

const generateId = () => Math.random().toString(36).substring(2, 11);

const normalizeValue = (val: string): number => {
  if (!val) return 0;
  let cleaned = val.replace(/[R$\s]/g, "");
  if (cleaned.includes(",") && cleaned.includes(".")) {
    cleaned = cleaned.replace(/\./g, "").replace(",", ".");
  } else if (cleaned.includes(",")) {
    cleaned = cleaned.replace(",", ".");
  }
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

const normalizeDate = (dateStr: string): string => {
  if (!dateStr) return new Date().toISOString().split("T")[0];
  const parts = dateStr.split("/");
  if (parts.length === 3) {
    const [day, month, year] = parts;
    const fullYear = year.length === 2 ? `20${year}` : year;
    return `${fullYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split("T")[0];
  }
  return new Date().toISOString().split("T")[0];
};

export const parseCsv = (file: File): Promise<Transaction[]> => {
  return new Promise((resolve, reject) => {
    const lowerName = file.name.toLowerCase();
    const isNameCreditCard =
      lowerName.includes("fatura") ||
      lowerName.includes("cartao") ||
      lowerName.includes("cartão") ||
      lowerName.includes("credit");

    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: ParseResult<CsvRow>) => {
        let positiveValuesCount = 0;
        let obviousExpensesInPositiveValues = 0;

        const parsedRows = results.data
          .map((row) => {
            const keys = Object.keys(row);
            const lowerKeys = keys.map((k) => k.toLowerCase().trim());

            const dateKey =
              keys[
                lowerKeys.findIndex(
                  (k) => k.includes("data") || k.includes("date"),
                )
              ];
            const descKey =
              keys[
                lowerKeys.findIndex(
                  (k) =>
                    k.includes("descrição") ||
                    k.includes("descricao") ||
                    k.includes("histórico") ||
                    k.includes("description") ||
                    k.includes("lançamento") ||
                    k.includes("title"),
                )
              ];
            const valueKey =
              keys[
                lowerKeys.findIndex(
                  (k) =>
                    k.includes("valor") ||
                    k.includes("value") ||
                    k.includes("quantia") ||
                    k.includes("amount"),
                )
              ];

            if (!descKey || !valueKey) {
              return null;
            }

            const rawDate = dateKey ? row[dateKey] : "";
            const rawDesc = row[descKey] || "";
            const rawValue = row[valueKey] || "0";

            const value = normalizeValue(rawValue);

            if (value === 0) return null;

            if (value > 0) {
              positiveValuesCount++;
              if (isObviousExpense(rawDesc)) {
                obviousExpensesInPositiveValues++;
              }
            }

            return { rawDate, rawDesc, value };
          })
          .filter(Boolean) as {
          rawDate: string;
          rawDesc: string;
          value: number;
        }[];

        const isPatternCreditCard =
          positiveValuesCount > 0 &&
          obviousExpensesInPositiveValues / positiveValuesCount >= 0.3;

        const isCreditCard = isNameCreditCard || isPatternCreditCard;

        const transactions: Transaction[] = parsedRows.map(
          ({ rawDate, rawDesc, value }) => {
            const date = normalizeDate(rawDate);
            const { category, type, isFixed } = inferCategoryAndType(
              rawDesc,
              value,
              isCreditCard,
            );

            let finalValue = value;
            if (type === "expense" && finalValue > 0) {
              finalValue = -finalValue;
            } else if (type === "income" && finalValue < 0) {
              finalValue = Math.abs(finalValue);
            }

            return {
              id: generateId(),
              date,
              description: rawDesc.trim(),
              amount: finalValue,
              type,
              category,
              isFixed,
            };
          },
        );

        resolve(transactions);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};
