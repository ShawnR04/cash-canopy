// lib/getBudgets.ts
import { db } from "@/db/index";
import { categoriesTable as categories, transactionsTable as transactions } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { getAuthUserId } from "./getUserData";


export async function getCategoriesWithSpending() {
  const userId = await getAuthUserId();
  
  // If no user session is active, return an empty array instantly to block data leakage
  if (!userId) {
    console.log("Unauthorized budget load attempt blocked.");
    return [];
  }

  try {
    // Fetch categories belonging ONLY to this user, left-joining their specific transactions
    const results = await db
      .select({
        id: categories.id,
        name: categories.name,
        monthly_budget: categories.monthly_budget,
        icon: categories.icon,
        userId: categories.userId, // 🌟 FIXED: Added to resolve the CategoryWithSpent type mismatch
        spentAmount: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'expense' THEN ${transactions.amount} ELSE 0 END), 0)`.mapWith(Number),
      })
      .from(categories)
      .leftJoin(
        transactions, 
        and(
          eq(transactions.categoryId, categories.id),
          eq(transactions.userId, userId) // Secure Join constraint
        )
      )
      .where(eq(categories.userId, userId)) // Secure Filter constraint
      .groupBy(
        categories.id,
        categories.name,
        categories.monthly_budget,
        categories.icon,
        categories.userId // 🌟 FIXED: Added to group clause to follow SQL rules for aggregated lookups
      );

    return results;
  } catch (error) {
    console.error("Error aggregating budget spending data:", error);
    return [];
  }
}
