"use server";

import { db } from "@/db/index";
import { usersTable as users } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { SignJWT } from "jose";
import { cookies } from "next/headers";
import { compare } from "bcrypt-ts"; // 1. Import the compare function

const secretKey = process.env.JWT_SECRET_KEY || process.env.JWT_SECRET || "my_special_secret_key";
const encodedKey = new TextEncoder().encode(secretKey);

export async function loginUser(formData: FormData) {
    const identifier = formData.get("user") as string;
    const password = formData.get("password") as string;

    if (!identifier || !password) {
        return {
            success: false,
            error: "Username/Email and Password are required"
        };
    }

    try {
        // Query Turso using Drizzle
        const existingUsers = await db
            .select()
            .from(users)
            .where(or(eq(users.email, identifier), eq(users.username, identifier)));

        if (existingUsers.length === 0) {
            return {
                success: false,
                error: "User not found"
            };
        }

        const user = existingUsers[0];

        // 2. Safe verification checkpoint
        // Compares incoming text with the stored hash using slow, constant-time verification
        const isPasswordValid = await compare(password, user.password);

        if (!isPasswordValid) {
            return {
                success: false,
                error: "Incorrect password"
            };
        }

        // Generate session token with explicit username string included
        const token = await new SignJWT({ 
            userId: user.id, 
            email: user.email,
            username: user.username 
        })
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime("7d")
            .sign(encodedKey);

        // Commit token to browser cookies securely
        const cookieStore = await cookies();
        cookieStore.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        // Strip password hash before sending user object back to UI client
        const { password: _, ...safeUser } = user;

        return { success: true, user: safeUser };

    } catch (error) {
        console.error("Database Login Error:", error);
        return { success: false, error: "An unexpected error occurred during login." };
    }
}