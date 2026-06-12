"use server";

import { db } from "@/db/index";
import { goalsTable as goals } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const secretKey =
  process.env.JWT_SECRET_KEY ||
  process.env.JWT_SECRET ||
  "my_special_secret_key";
const encodedKey = new TextEncoder().encode(secretKey);

export async function createGoal(formData: FormData) {
  // 1. Get user session token from cookies
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value; // Adjust "token" if your cookie name is different (e.g. "session")

  if (!token) {
    return { success: false, error: "Unauthorized: No session token found." };
  }

  let userId: string;
  try {
    // 2. Verify the token and extract the userId
    const verified = await jwtVerify(token, encodedKey, {
      algorithms: ["HS256"],
    });
    userId = verified.payload.userId as string;
  } catch (error) {
    return {
      success: false,
      error: "Unauthorized: Invalid or expired session.",
    };
  }

  // 3. Extract and parse form data
  const name = formData.get("name")?.toString().trim() || "Untitled Goal";
  const targetRaw = formData.get("target_amount")?.toString().trim();
  const savedRaw = formData.get("saved_amount")?.toString().trim();
  const dateRaw = formData.get("target_date")?.toString().trim();

  const target_amount = targetRaw ? Number(targetRaw) : 0;
  const saved_amount = savedRaw ? Number(savedRaw) : 0;

  const target_date = dateRaw ? new Date(dateRaw) : new Date();

  try {
    // 4. Insert into the database using the authenticated userId
    await db.insert(goals).values({
      userId,
      name,
      target_amount,
      saved_amount,
      target_date,
    });

    // Make sure this matches the routing path your UI is hosted on!
    revalidatePath("/hero");
    return { success: true };
  } catch (error) {
    console.error("Error creating goal:", error);
    return { success: false, error: "An unexpected error occurred." };
  }
}

export async function updateGoals(id: number, add_amount: number, change_amount: number, name: string){
    try{
        await db
        .update(goals)
        .set({
            saved_amount: sql`${goals.saved_amount} + ${add_amount}`,
            target_amount:change_amount,
            name:name
        })
        .where(eq(goals.id, id));

    revalidatePath("/goals");
    return { success: true };
    }catch(error){
        console.error("Error updating goal:", error);
        return { success: false, error: "An unexpected error occurred." };
    }
}

export async function deleteGoals(goalId: number) {
  try {
    // Perform the delete mutation in Turso
    await db
      .delete(goals)
      .where(eq(goals.id, goalId));

    // Purge the cache for the budgets page so the UI updates instantly
    revalidatePath("/goals"); 
    
    return { success: true };
  } catch (error) {
    console.error("Failed to delete category from Turso:", error);
    return { success: false, error: "Database operation failed" };
  }
}