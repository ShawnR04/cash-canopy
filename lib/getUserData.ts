"use server";

import { db } from "@/db";
import {
  categoriesTable,
  goalsTable,
  transactionsTable,
} from "@/db/schema";
import { getCurrentSession } from "@/lib/auth/session";
import { eq } from "drizzle-orm";

export async function getAuthUserId() {
  const session = await getCurrentSession();
  return session?.userId ?? null;
}

export async function getUserTransactions() {
  const userId = await getAuthUserId();
  if (!userId) return [];

  try {
    return await db
      .select()
      .from(transactionsTable)
      .where(eq(transactionsTable.userId, userId));
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
}

export async function getUserBudgets() {
  const userId = await getAuthUserId();
  if (!userId) return [];

  try {
    return await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.userId, userId));
  } catch (error) {
    console.error("Error fetching budgets:", error);
    return [];
  }
}

export async function getUserGoals() {
  const userId = await getAuthUserId();
  if (!userId) return [];

  try {
    return await db
      .select()
      .from(goalsTable)
      .where(eq(goalsTable.userId, userId));
  } catch (error) {
    console.error("Error fetching goals:", error);
    return [];
  }
}
