"use server";

import { removeSession, switchSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export async function switchAccount(sessionId: string) {
  try {
    const switched = await switchSession(sessionId);
    if (!switched) return { success: false, error: "That session is no longer available." };

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Switch account error:", error);
    return { success: false, error: "Failed to switch accounts." };
  }
}

export async function removeAccount(sessionId: string) {
  try {
    const removed = await removeSession(sessionId);
    if (!removed) return { success: false, error: "That session is no longer available." };

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Remove account error:", error);
    return { success: false, error: "Failed to remove the account." };
  }
}
