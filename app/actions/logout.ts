// @/app/actions/logout.ts
"use server";

import { cookies } from "next/headers";

export async function logoutUser() {
  try {
    const cookieStore = await cookies();
    
    // Completely delete the session token cookie
    cookieStore.delete("token");

    return { success: true };
  } catch (error) {
    console.error("Logout Error:", error);
    return { success: false, error: "Failed to log out smoothly." };
  }
}