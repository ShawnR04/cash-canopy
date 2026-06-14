"use server";

import { db } from "@/db";
import {
  categoriesTable,
  transactionsTable,
  usersTable,
  type InsertTransaction,
} from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { jwtVerify } from "jose";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

const secretKey =
  process.env.JWT_SECRET_KEY ||
  process.env.JWT_SECRET ||
  "my_special_secret_key";

const encodedKey = new TextEncoder().encode(secretKey);

type CreateTransactionResult =
  | { success: true }
  | { success: false; error: string; details?: string };

function getRequiredString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function parseDateInput(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

function describeError(error: unknown) {
  if (!(error instanceof Error)) return String(error);

  const databaseError = error as Error & {
    code?: string;
    rawCode?: number;
    cause?: unknown;
  };

  return JSON.stringify({
    name: databaseError.name,
    message: databaseError.message,
    code: databaseError.code,
    rawCode: databaseError.rawCode,
    cause:
      databaseError.cause instanceof Error
        ? databaseError.cause.message
        : databaseError.cause,
  });
}

export async function createTransaction(
  formData: FormData,
): Promise<CreateTransactionResult> {
  const token = (await cookies()).get("session_token")?.value;

  if (!token) {
    return {
      success: false,
      error: "Unauthorized: No session token found.",
    };
  }

  let userId: string;

  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ["HS256"],
    });

    if (typeof payload.userId !== "string" || !payload.userId.trim()) {
      return {
        success: false,
        error: "Unauthorized: Session does not contain a valid user ID.",
      };
    }

    userId = payload.userId;
  } catch (error) {
    console.error("Transaction authentication failed:", describeError(error));
    return {
      success: false,
      error: "Unauthorized: Invalid or expired session.",
    };
  }

  const typeValue = getRequiredString(formData, "type");
  const amountValue = getRequiredString(formData, "amount");
  const description = getRequiredString(formData, "description");
  const categoryIdValue = getRequiredString(formData, "categoryId");
  const dateValue = getRequiredString(formData, "date");

  if (typeValue !== "income" && typeValue !== "expense") {
    return { success: false, error: "Type must be income or expense." };
  }

  const amount = Number(amountValue);
  if (!amountValue || !Number.isSafeInteger(amount) || amount <= 0) {
    return {
      success: false,
      error: "Amount must be a positive whole number.",
    };
  }

  if (!description) {
    return { success: false, error: "Description is required." };
  }

  const date = parseDateInput(dateValue);
  if (!date) {
    return { success: false, error: "Date must be a valid calendar date." };
  }

  let categoryId: number | null = null;
  if (categoryIdValue) {
    categoryId = Number(categoryIdValue);
    if (!Number.isSafeInteger(categoryId) || categoryId <= 0) {
      return { success: false, error: "Category is invalid." };
    }
  }

  if (typeValue === "income" && categoryId === null) {
    return {
      success: false,
      error: "Select a category before adding income.",
    };
  }

  try {
    const [user] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!user) {
      return {
        success: false,
        error: "Unauthorized: The session user no longer exists.",
      };
    }

    if (categoryId !== null) {
      const [category] = await db
        .select({ id: categoriesTable.id })
        .from(categoriesTable)
        .where(
          and(
            eq(categoriesTable.id, categoryId),
            eq(categoriesTable.userId, userId),
          ),
        )
        .limit(1);

      if (!category) {
        return {
          success: false,
          error: "The selected category does not exist or is not yours.",
        };
      }
    }

    const transaction = {
      userId,
      type: typeValue,
      amount,
      description,
      categoryId,
      date,
    } satisfies InsertTransaction;

    console.info("Creating transaction:", {
      ...transaction,
      date: transaction.date.toISOString(),
      rawFormValues: {
        type: typeValue,
        amount: amountValue,
        categoryId: categoryIdValue || null,
        date: dateValue,
      },
    });

    await db.transaction(async (tx) => {
      await tx.insert(transactionsTable).values(transaction);

      if (typeValue === "income" && categoryId !== null) {
        await tx
          .update(categoriesTable)
          .set({
            monthly_budget: sql`COALESCE(${categoriesTable.monthly_budget}, 0) + ${amount}`,
          })
          .where(
            and(
              eq(categoriesTable.id, categoryId),
              eq(categoriesTable.userId, userId),
            ),
          );
      }
    });

    revalidatePath("/pages/transactions");
    revalidatePath("/pages/budgets");
    revalidatePath("/home");

    return { success: true };
  } catch (error) {
    const details = describeError(error);
    console.error("Error creating transaction:", {
      userId,
      parsedValues: {
        type: typeValue,
        amount,
        description,
        categoryId,
        date: date.toISOString(),
      },
      databaseError: details,
    });

    return {
      success: false,
      error: "Failed to add transaction.",
      ...(process.env.NODE_ENV === "development" ? { details } : {}),
    };
  }
}

export async function updateTransaction(formData: FormData) {
  try {
    const id = Number(formData.get("id"));
    const type = formData.get("type") as "income" | "expense";
    const amount = Number(formData.get("amount"));
    const description = formData.get("description") as string;
    const categoryId = Number(formData.get("categoryId"));
    const dateString = formData.get("date") as string;

    if (!id || !type || !amount || !description || !categoryId || !dateString) {
      return { success: false, error: "Missing required fields." };
    }

    const date = new Date(dateString);

    await db
      .update(transactionsTable)
      .set({
        type,
        amount,
        description,
        categoryId,
        date,
      })
      .where(eq(transactionsTable.id, id));

    // Refresh the transactions page to reflect the updated data
    revalidatePath("/transactions");
    
    return { success: true };
  } catch (error) {
    console.error("Error updating transaction:", error);
    return { success: false, error: "Failed to update transaction." };
  }
}

export async function deleteTransaction(id: number) {
  try {
    await db.delete(transactionsTable).where(eq(transactionsTable.id, id));
    
    revalidatePath("/transactions");
    revalidatePath("/budgets"); // Revalidate budgets page to update the spent amount
    
    return { success: true };
  } catch (error) {
    console.error("Failed to delete transaction:", error);
    return { success: false, error: "Failed to delete transaction" };
  }
}

