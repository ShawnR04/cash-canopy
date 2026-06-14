import { getCurrentUser } from "@/lib/auth/session";

export async function getUserProfile() {
  const user = await getCurrentUser();
  return user
    ? { username: user.username, email: user.email }
    : { username: "Guest", email: null };
}
