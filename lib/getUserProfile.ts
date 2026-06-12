// src/utils/auth.ts
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const secretKey = process.env.JWT_SECRET_KEY || process.env.JWT_SECRET || "my_special_secret_key";
const encodedKey = new TextEncoder().encode(secretKey);

interface UserSession {
  username: string;
  email: string | null;
}

// Notice we changed "export default" to a named export "export async function..."
// This makes it easier to import multiple auth helpers from this file later if needed.
export async function getUserProfile(): Promise<UserSession> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  const fallbackUser: UserSession = { username: "Guest", email: null };

  if (!token) return fallbackUser;

  try {
    const { payload } = await jwtVerify(token, encodedKey, { algorithms: ["HS256"] });
    const username = typeof payload.username === "string" ? payload.username : "User";
    const email = typeof payload.email === "string" ? payload.email : null;
    return { username, email };
  } catch (error) {
    return fallbackUser;
  }
}