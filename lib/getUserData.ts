"use server";

import { db } from "@/db/index";
import { 
  transactionsTable as transactions, 
  categoriesTable as categories, 
  goalsTable as goals 
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const secretKey = process.env.JWT_SECRET_KEY || process.env.JWT_SECRET || "my_special_secret_key";
const encodedKey = new TextEncoder().encode(secretKey);

// Shared Private Helper to extract and verify the session user ID safely
async function getAuthUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) return null;

  try {
    const verified = await jwtVerify(token, encodedKey, {
      algorithms: ["HS256"],
    });
    return verified.payload.userId as string;
  } catch (error) {
    return null;
  }
}

/**
 * Fetches only the active user's transactions
 */
export async function getUserTransactions() {
  const userId = await getAuthUserId();
  if (!userId) return [];

  try {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId));
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
}

/**
 * Fetches only the active user's budget categories
 */
export async function getUserBudgets() {
  const userId = await getAuthUserId();
  if (!userId) return [];

  try {
    return await db
      .select()
      .from(categories)
      .where(eq(categories.userId, userId));
  } catch (error) {
    console.error("Error fetching budgets:", error);
    return [];
  }
}

/**
 * Fetches only the active user's financial savings goals
 */
export async function getUserGoals() {
  const userId = await getAuthUserId();
  if (!userId) return [];

  try {
    return await db
      .select()
      .from(goals)
      .where(eq(goals.userId, userId));
  } catch (error) {
    console.error("Error fetching goals:", error);
    return [];
  }
}