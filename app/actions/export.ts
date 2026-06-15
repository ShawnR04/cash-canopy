"use server";

import { getAuthUserId } from "@/lib/getUserData";
import { db } from "@/db";
import { transactionsTable } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export interface ExportTransaction {
  date: string;
  description: string;
  categoryName: string | null;
  type: "income" | "expense";
  amount: number;
}

export async function getExportData() {
  const  userId  = await getAuthUserId();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const rawTransactions = await db
    .select()
    .from(transactionsTable)
    .where(eq(transactionsTable.userId, userId))
    .orderBy(desc(transactionsTable.date));

  let totalBalance = 0;
  let monthlyIncome = 0;
  let monthlyExpenses = 0;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const transactions: ExportTransaction[] = rawTransactions.map((tx) => {
    const txDate = new Date(tx.date);

    const isCurrentMonth =
      txDate.getMonth() === currentMonth &&
      txDate.getFullYear() === currentYear;

    if (tx.type === "income") {
      totalBalance += tx.amount;

      if (isCurrentMonth) {
        monthlyIncome += tx.amount;
      }
    } else {
      totalBalance -= tx.amount;

      if (isCurrentMonth) {
        monthlyExpenses += tx.amount;
      }
    }

    return {
      date: txDate.toISOString(),
      description: tx.description,
      categoryName: null,
      type: tx.type as "income" | "expense",
      amount: tx.amount,
    };
  });

  return {
    transactions,
    budgets: [],
    totalBalance,
    monthlyIncome,
    monthlyExpenses,
  };
}