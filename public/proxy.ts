import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Must match the fallback secret key used in your loginUser server action
const secretKey = process.env.JWT_SECRET_KEY || process.env.JWT_SECRET || "my_special_secret_key";
const encodedKey = new TextEncoder().encode(secretKey);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Safely extract your cookie named "token"
  const tokenCookie = request.cookies.get("token");
  const token = tokenCookie?.value;

  let isTokenValid = false;

  if (token) {
    try {
      // 2. Cryptographically verify the token structure and expiration
      await jwtVerify(token, encodedKey);
      isTokenValid = true;
    } catch (error) {
      // Token is expired, missing, or malformed/tampered with
      console.error("Middleware JWT verification failed:", error);
      isTokenValid = false;
    }
  }

  // 3. RULE 1: If trying to access /hero manually without a valid session token, kick them to login
  if (!isTokenValid && pathname.startsWith("/home")) {
    const loginUrl = new URL("/authentication/login", request.url);
    // Optional: Appends "?callbackUrl=/hero" so you can redirect them back here post-login
    loginUrl.searchParams.set("callbackUrl", pathname); 
    return NextResponse.redirect(loginUrl);
  }

  // 4. RULE 2: If already authenticated, block them from accessing login/signup paths manually
  if (isTokenValid && pathname.startsWith("/authentication")) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return NextResponse.next();
}

// 5. This config object tells Next.js exactly which route paths trigger this file
export const config = {
  matcher: [
    "/home/:path*",
    "/authentication/:path*",
  ],
};