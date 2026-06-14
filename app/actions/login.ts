"use server";

import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { createSession } from "@/lib/auth/session";
import { compare } from "bcrypt-ts";
import { eq, or } from "drizzle-orm";

export async function loginUser(formData: FormData) {
  const identifier = formData.get("user")?.toString().trim() ?? "";
  const password = formData.get("password")?.toString() ?? "";

  if (!identifier || !password) {
    return { success: false, error: "Username/email and password are required." };
  }

  try {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(
        or(eq(usersTable.email, identifier), eq(usersTable.username, identifier)),
      )
      .limit(1);

    if (!user || !(await compare(password, user.password))) {
      return { success: false, error: "Invalid username/email or password." };
    }

    await createSession(user.id);

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
      },
    };
  } catch (error) {
    console.error("Database login error:", error);
    return { success: false, error: "An unexpected error occurred during login." };
  }
}
