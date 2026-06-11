"use server";

import { db } from "@/db/index";
import { goalsTable as goals } from "@/db/schema";
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
  const token = cookieStore.get("token")?.value; // Adjust "token" if your cookie name is different (e.g. "session")

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
