import { categoriesTable, transactionsTable } from "@/db/schema";
import { db } from "@/db";
import { desc, eq, and } from "drizzle-orm";
import { getAuthUserId } from "@/lib/getUserData";

export async function getTransactions() {
  const userId = await getAuthUserId();

  if (!userId) {
    return [];
  }

  return await db
    .select({
      id: transactionsTable.id,
      date: transactionsTable.date,
      description: transactionsTable.description,
      type: transactionsTable.type,
      amount: transactionsTable.amount,
      categoryId: transactionsTable.categoryId,
      categoryName: categoriesTable.name,
      categoryIcon: categoriesTable.icon,
    })
    .from(transactionsTable)
    .leftJoin(
      categoriesTable,
      and(
        eq(transactionsTable.categoryId, categoriesTable.id),
        eq(categoriesTable.userId, userId)
      )
    )
    .where(eq(transactionsTable.userId, userId))
    .orderBy(desc(transactionsTable.date));
}