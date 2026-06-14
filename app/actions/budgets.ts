"use server";

import { db } from "@/db";
import { categoriesTable } from "@/db/schema";
import { getCurrentSession } from "@/lib/auth/session";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

function refreshBudgets() {
  revalidatePath("/home");
  revalidatePath("/pages/budgets");
}

export async function createBudget(formData: FormData) {
  const session = await getCurrentSession();
  if (!session) return { success: false, error: "Unauthorized." };

  const name = formData.get("name")?.toString().trim() ?? "";
  const amountValue = formData.get("monthly_budget")?.toString().trim() ?? "";
  const icon = formData.get("icon")?.toString().trim() ?? "";
  const monthlyBudget = Number(amountValue);

  if (!name || !icon || !Number.isSafeInteger(monthlyBudget) || monthlyBudget < 0) {
    return { success: false, error: "Enter a valid name, icon, and whole-number amount." };
  }

  try {
    await db.insert(categoriesTable).values({
      userId: session.userId,
      name,
      monthly_budget: monthlyBudget,
      icon,
    });
    refreshBudgets();
    return { success: true };
  } catch (error) {
    console.error("Error creating budget:", error);
    return { success: false, error: "Failed to create category." };
  }
}

export async function updateBudget(id: number, amount: number, name: string) {
  const session = await getCurrentSession();
  if (!session) return { success: false, error: "Unauthorized." };
  if (!Number.isSafeInteger(id) || !Number.isSafeInteger(amount) || amount < 0 || !name.trim()) {
    return { success: false, error: "Invalid category values." };
  }

  try {
    await db
      .update(categoriesTable)
      .set({ monthly_budget: amount, name: name.trim() })
      .where(
        and(
          eq(categoriesTable.id, id),
          eq(categoriesTable.userId, session.userId),
        ),
      );
    refreshBudgets();
    return { success: true };
  } catch (error) {
    console.error("Failed to update category:", error);
    return { success: false, error: "Failed to update category." };
  }
}

export async function deleteBudget(categoryId: number) {
  const session = await getCurrentSession();
  if (!session) return { success: false, error: "Unauthorized." };

  try {
    await db
      .delete(categoriesTable)
      .where(
        and(
          eq(categoriesTable.id, categoryId),
          eq(categoriesTable.userId, session.userId),
        ),
      );
    refreshBudgets();
    return { success: true };
  } catch (error) {
    console.error("Failed to delete category:", error);
    return { success: false, error: "Failed to delete category." };
  }
}
