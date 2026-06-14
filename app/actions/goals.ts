"use server";

import { db } from "@/db";
import { goalsTable } from "@/db/schema";
import { getCurrentSession } from "@/lib/auth/session";
import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

function refreshGoals() {
  revalidatePath("/home");
  revalidatePath("/pages/goals");
}

export async function createGoal(formData: FormData) {
  const session = await getCurrentSession();
  if (!session) return { success: false, error: "Unauthorized." };

  const name = formData.get("name")?.toString().trim() ?? "";
  const targetAmount = Number(formData.get("target_amount"));
  const savedAmount = Number(formData.get("saved_amount") || 0);
  const dateValue = formData.get("target_date")?.toString() ?? "";
  const targetDate = new Date(dateValue);

  if (
    !name ||
    !Number.isSafeInteger(targetAmount) ||
    targetAmount <= 0 ||
    !Number.isSafeInteger(savedAmount) ||
    savedAmount < 0 ||
    Number.isNaN(targetDate.getTime())
  ) {
    return { success: false, error: "Enter valid goal values." };
  }

  try {
    await db.insert(goalsTable).values({
      userId: session.userId,
      name,
      target_amount: targetAmount,
      saved_amount: savedAmount,
      target_date: targetDate,
    });
    refreshGoals();
    return { success: true };
  } catch (error) {
    console.error("Error creating goal:", error);
    return { success: false, error: "Failed to create goal." };
  }
}

export async function updateGoals(
  id: number,
  addAmount: number,
  changeAmount: number,
  name: string,
) {
  const session = await getCurrentSession();
  if (!session) return { success: false, error: "Unauthorized." };

  try {
    await db
      .update(goalsTable)
      .set({
        saved_amount: sql`${goalsTable.saved_amount} + ${addAmount}`,
        target_amount: changeAmount,
        name: name.trim(),
      })
      .where(
        and(
          eq(goalsTable.id, id),
          eq(goalsTable.userId, session.userId),
        ),
      );
    refreshGoals();
    return { success: true };
  } catch (error) {
    console.error("Error updating goal:", error);
    return { success: false, error: "Failed to update goal." };
  }
}

export async function deleteGoals(goalId: number) {
  const session = await getCurrentSession();
  if (!session) return { success: false, error: "Unauthorized." };

  try {
    await db
      .delete(goalsTable)
      .where(
        and(
          eq(goalsTable.id, goalId),
          eq(goalsTable.userId, session.userId),
        ),
      );
    refreshGoals();
    return { success: true };
  } catch (error) {
    console.error("Failed to delete goal:", error);
    return { success: false, error: "Failed to delete goal." };
  }
}
