import { db } from "@/db/index";
import { transactionsTable as transactions } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
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
    const [result] = await db
      .select({
        monthlyIncome: sql<number>`
          COALESCE(
            SUM(
              CASE
                WHEN ${transactions.type} = 'income'
                  AND date(${transactions.date}, 'start of month') = date('now', 'start of month')
                THEN ${transactions.amount}
                ELSE 0
              END
            ),
            0
          )
        `,
        monthlyExpenses: sql<number>`
          COALESCE(
            SUM(
              CASE
                WHEN ${transactions.type} = 'expense'
                  AND date(${transactions.date}, 'start of month') = date('now', 'start of month')
                THEN ${transactions.amount}
                ELSE 0
              END
            ),
            0
          )
        `,
        totalIncome: sql<number>`
          COALESCE(
            SUM(
              CASE
                WHEN ${transactions.type} = 'income'
                THEN ${transactions.amount}
                ELSE 0
              END
            ),
            0
          )
        `,
        totalExpenses: sql<number>`
          COALESCE(
            SUM(
              CASE
                WHEN ${transactions.type} = 'expense'
                THEN ${transactions.amount}
                ELSE 0
              END
            ),
            0
          )
        `,
        lastMonthIncome: sql<number>`
          COALESCE(
            SUM(
              CASE
                WHEN ${transactions.type} = 'income'
                  AND date(${transactions.date}, 'start of month') = date('now', '-1 month', 'start of month')
                THEN ${transactions.amount}
                ELSE 0
              END
            ),
            0
          )
        `,
        lastMonthExpenses: sql<number>`
          COALESCE(
            SUM(
              CASE
                WHEN ${transactions.type} = 'expense'
                  AND date(${transactions.date}, 'start of month') = date('now', '-1 month', 'start of month')
                THEN ${transactions.amount}
                ELSE 0
              END
            ),
            0
          )
        `,
      })
      .from(transactions)
      .where(eq(transactions.userId, userId));

    // Fetch the user's budgets to extract the manual Base Income
    const budgets = await getUserBudgets();
    const incomeCategory = budgets?.find((b) => b.name?.toLowerCase() === "income");
    const baseIncome = Number(incomeCategory?.monthly_budget) || 0;

    // Fallback parser: Use parseFloat if drivers pass numeric aggregates back as a raw string wrapper
    const monthlyIncome = parseFloat(String(result?.monthlyIncome ?? 0)) + baseIncome;
    const monthlyExpenses = parseFloat(String(result?.monthlyExpenses ?? 0));
    const totalIncome = parseFloat(String(result?.totalIncome ?? 0)) + baseIncome;
    const totalExpenses = parseFloat(String(result?.totalExpenses ?? 0));
    
    const totalBalance = totalIncome - totalExpenses;

    const lastMonthIncome = parseFloat(String(result?.lastMonthIncome ?? 0)) + baseIncome;
    const lastMonthExpenses = parseFloat(String(result?.lastMonthExpenses ?? 0));
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