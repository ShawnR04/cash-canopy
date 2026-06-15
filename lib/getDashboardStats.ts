import { db } from "@/db/index";
import { transactionsTable as transactions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAuthUserId, getUserBudgets } from "@/lib/getUserData";

export async function getDashboardStats() {
  const userId = await getAuthUserId();

  if (!userId) {
    return {
      monthlyIncome: 0,
      monthlyExpenses: 0,
      totalIncome: 0,
      totalExpenses: 0,
      totalBalance: 0,
      savingsRate: 0,
      balancePercentageChange: 0,
    };
  }

  try {
    const userTransactions = await db
      .select({
        type: transactions.type,
        amount: transactions.amount,
        date: transactions.date,
      })
      .from(transactions)
      .where(eq(transactions.userId, userId));

    // Fetch the user's budgets to extract the manual Base Income
    const budgets = await getUserBudgets();
    const incomeCategory = budgets?.find((b) => b.name?.toLowerCase() === "income");
    const baseIncome = Number(incomeCategory?.monthly_budget) || 0;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
    const lastMonth = lastMonthDate.getMonth();
    const lastMonthYear = lastMonthDate.getFullYear();

    let monthlyIncome = baseIncome;
    let monthlyExpenses = 0;
    let totalIncome = baseIncome;
    let totalExpenses = 0;
    let lastMonthIncome = baseIncome;
    let lastMonthExpenses = 0;

    userTransactions.forEach((tx) => {
      const amount = Number(tx.amount) || 0;
      const rawDate = tx.date as any;
      const txDate = new Date(typeof rawDate === "string" && !isNaN(Number(rawDate)) ? Number(rawDate) : rawDate);
      const txMonth = txDate.getMonth();
      const txYear = txDate.getFullYear();

      if (tx.type === "income") {
        totalIncome += amount;
        if (txMonth === currentMonth && txYear === currentYear) {
          monthlyIncome += amount;
        } else if (txMonth === lastMonth && txYear === lastMonthYear) {
          lastMonthIncome += amount;
        }
      } else if (tx.type === "expense") {
        totalExpenses += amount;
        if (txMonth === currentMonth && txYear === currentYear) {
          monthlyExpenses += amount;
        } else if (txMonth === lastMonth && txYear === lastMonthYear) {
          lastMonthExpenses += amount;
        }
      }
    });
    
    const totalBalance = totalIncome - totalExpenses;

    const lastMonthBalance = lastMonthIncome - lastMonthExpenses;

    let balancePercentageChange = 0;

    if (lastMonthBalance === 0) {
      balancePercentageChange = totalBalance > 0 ? 100 : 0;
    } else {
      const difference = totalBalance - lastMonthBalance;
      const rawChange = (difference / lastMonthBalance) * 100;
      balancePercentageChange = Math.round(rawChange * 10) / 10;
    }

    const savingsRate =
      totalIncome > 0
        ? Math.round((((totalIncome - totalExpenses) / totalIncome) * 100) * 10) / 10
        : 0;

    return {
      monthlyIncome,
      monthlyExpenses,
      totalIncome,
      totalExpenses,
      totalBalance,
      savingsRate,
      balancePercentageChange,
    };
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    return {
      monthlyIncome: 0,
      monthlyExpenses: 0,
      totalIncome: 0,
      totalExpenses: 0,
      totalBalance: 0,
      savingsRate: 0,
      balancePercentageChange: 0,
    };
  }
}