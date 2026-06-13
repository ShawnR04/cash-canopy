"use server";

import { db } from "@/db/index";
import { categoriesTable as categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const secretKey =
  process.env.JWT_SECRET_KEY ||
  process.env.JWT_SECRET ||
  "my_special_secret_key";
const encodedKey = new TextEncoder().encode(secretKey);

export async function createBudget(formData: FormData) {
  // 1. Get user session token from cookies
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

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

  // 3. Extract form data
  const name = formData.get("name")?.toString().trim() || "Untitled Category";
  const monthly_budget = formData.get("monthly_budget");
  const icon = formData.get("icon")?.toString().trim() || "";

  try {
    // 4. Insert into database with the required userId
    await db.insert(categories).values({
      userId,
      name,
      monthly_budget: monthly_budget ? Number(monthly_budget) : 0,
      icon,
    });

    revalidatePath("/hero");
    return { success: true };
  } catch (error) {
    console.error("Error creating budget:", error);
    return { success: false, error: "An unexpected error occurred." };
  }
}

export async function updateBudget(id: number, amount: number,name:string) {
  try {
    await db
      .update(categories)
      .set({ 
        monthly_budget: amount
        ,name:name
       })
      .where(eq(categories.id, id));

    revalidatePath("/budgets"); 
    return { success: true };
  } catch (error) {
    console.error("Failed to update category budget:", error);
    return { success: false, error: "Failed to update budget" };
  }
}

export async function deleteBudget(categoryId: number) {
  try {
    // Perform the delete mutation in Turso
    await db
      .delete(categories)
      .where(eq(categories.id, categoryId));

    // Purge the cache for the budgets page so the UI updates instantly
    revalidatePath("/budgets"); 
    
    return { success: true };
  } catch (error) {
    console.error("Failed to delete category from Turso:", error);
    return { success: false, error: "Database operation failed" };
  }
}