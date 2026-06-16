"use server";

import { getAuthUserId, getUserBudgets } from "@/lib/getUserData";
import { db } from "@/db";
import { transactionsTable, categoriesTable, goalsTable } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export interface ExportTransaction {
  date: string;
  description: string;
  categoryName: string | null;
  type: "income" | "expense";
  amount: number;
}

export interface ExportGoal {
  name: string;
  targetAmount: number;
  savedAmount: number;
  targetDate: string;
}

export async function getExportData() {
  const  userId  = await getAuthUserId();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const rawTransactions = await db
    .select({
      date: transactionsTable.date,
      description: transactionsTable.description,
      type: transactionsTable.type,
      amount: transactionsTable.amount,
      categoryName: categoriesTable.name,
    })
    .from(transactionsTable)
    .leftJoin(categoriesTable, eq(transactionsTable.categoryId, categoriesTable.id))
    .where(eq(transactionsTable.userId, userId))
    .orderBy(desc(transactionsTable.date));

  const rawGoals = await db
    .select({
      name: goalsTable.name,
      targetAmount: goalsTable.target_amount,
      savedAmount: goalsTable.saved_amount,
      targetDate: goalsTable.target_date,
    })
    .from(goalsTable)
    .where(eq(goalsTable.userId, userId))
    .orderBy(desc(goalsTable.target_date));

  const goals: ExportGoal[] = rawGoals.map((g) => ({
    name: g.name,
    targetAmount: Number(g.targetAmount) || 0,
    savedAmount: Number(g.savedAmount) || 0,
    targetDate: new Date(g.targetDate).toISOString(),
  }));

  const userBudgets = await getUserBudgets();
  const incomeCategory = userBudgets?.find((b) => b.name?.toLowerCase() === "income");
  const baseIncome = Number(incomeCategory?.monthly_budget) || 0;

  let totalBalance = baseIncome;
  let monthlyIncome = baseIncome;
  let monthlyExpenses = 0;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const transactions: ExportTransaction[] = rawTransactions.map((tx) => {
    const rawDate = tx.date as any;
    const txDate = new Date(
      typeof rawDate === "string" && !isNaN(Number(rawDate))
        ? Number(rawDate)
        : rawDate
    );
    const amount = Number(tx.amount) || 0;

    const isCurrentMonth =
      txDate.getMonth() === currentMonth &&
      txDate.getFullYear() === currentYear;

    if (tx.type === "income") {
      totalBalance += amount;

      if (isCurrentMonth) {
        monthlyIncome += amount;
      }
    } else {
      totalBalance -= amount;

      if (isCurrentMonth) {
        monthlyExpenses += amount;
      }
    }

    return {
      date: txDate.toISOString(),
      description: tx.description,
      categoryName: tx.categoryName,
      type: tx.type as "income" | "expense",
      amount: amount,
    };
  });

  return {
    transactions,
    goals,
    budgets: [],
    totalBalance,
    monthlyIncome,
    monthlyExpenses,
  };
}