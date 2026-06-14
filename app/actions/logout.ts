"use server";

import {
  getAccountSessions,
  logoutAllSessions,
  logoutCurrentSession,
} from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export async function logoutUser() {
  try {
    await logoutCurrentSession();
    const hasRemainingAccounts = (await getAccountSessions()).length > 0;
    revalidatePath("/", "layout");
    return { success: true, hasRemainingAccounts };
  } catch (error) {
    console.error("Logout error:", error);
    return { success: false, error: "Failed to log out." };
  }
}

export async function logoutAllUsers() {
  try {
    await logoutAllSessions();
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Logout-all error:", error);
    return { success: false, error: "Failed to log out all accounts." };
  }
}
