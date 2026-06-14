"use server";

import { db } from "@/db"; 
import { transactionsTable } from "@/db/schema"; 
import { gte, lte, and, eq } from "drizzle-orm";

export async function getMonthlyGraphData(userId: string) {
  const currentYear = new Date().getFullYear();
  
  // Define the start and end of the current year
  const startOfYear = new Date(currentYear, 0, 1);
  const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

  try {
    // 1. Fetch transactions for the current year from Turso matching ONLY this userId
    const rawTransactions = await db
      .select()
      .from(transactionsTable)
      .where(
        and(
          eq(transactionsTable.userId, userId), // Enforces security at the database layer
          gte(transactionsTable.date, startOfYear),
          lte(transactionsTable.date, endOfYear)
        )
      );

    // Initialize all 12 months so the chart has placeholders even if a month is empty
    const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    const initialMap = monthLabels.reduce((acc, month, index) => {
      acc[index] = {
        month,
        totalIncome: 0,
        totalExpense: 0,
        transactions: [],
      };
      return acc;
    }, {} as Record<number, { month: string; totalIncome: number; totalExpense: number; transactions: any[] }>);

    // 2. Distribute user-specific data into the correct months
    rawTransactions.forEach((tx) => {
      const txDate = new Date(tx.date);
      const monthIndex = txDate.getMonth(); // Returns 0-11

      if (tx.type === "income") {
        initialMap[monthIndex].totalIncome += tx.amount;
      } else if (tx.type === "expense") {
        initialMap[monthIndex].totalExpense += tx.amount;
      }

      // Format individual items to match what your custom tooltip needs
      initialMap[monthIndex].transactions.push({
        id: String(tx.id),
        day: txDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        description: tx.description,
        type: tx.type,
        amount: tx.amount,
        rawDate: txDate.getTime() // Kept for sorting
      });
    });

    // 3. Sort inner transactions chronologically per month and return as an ordered array
    return Object.values(initialMap).map(monthData => {
      monthData.transactions.sort((a, b) => a.rawDate - b.rawDate);
      return monthData;
    });

  } catch (error) {
    console.error("Error calculating user monthly graph aggregates:", error);
    return [];
  }
}