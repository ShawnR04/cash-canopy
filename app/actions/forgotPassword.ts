"use server"

import { db } from "@/db/index";
import { usersTable as users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { SignJWT } from "jose";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const secretKey = process.env.JWT_SECRET_KEY || "my_special_secret_key";
const encodedKey = new TextEncoder().encode(secretKey);

export async function requestPasswordReset(formData: FormData) {
    const email = formData.get("email")?.toString();

    if (!email) {
        return { 
            success: false,
            error: "Email is required."
        };
    }

    try {
        // 1. Double check environment variables before running to prevent crash
        if (!process.env.RESEND_API_KEY) {
            console.error("CRITICAL CONFIG ERROR: RESEND_API_KEY environment variable is missing.");
            return { success: false, error: "Email configuration error on server." };
        }

        const existingUsers = await db
            .select()
            .from(users)
            .where(eq(users.email, email));
        
        // Security best practice: Don't reveal if an email doesn't exist
        if (existingUsers.length === 0) {
            return { success: true };
        }

        const user = existingUsers[0];

        // Generate a signed, 1-hour expiration JWT
        const resetToken = await new SignJWT({ userId: user.id, email: user.email })
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime("1h")
            .sign(encodedKey);

        //const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://expense-tracker-v2-sigma.vercel.app";
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://192.168.1.204:3000";
        const resetLink = `${baseUrl}/authentication/login/reset_password?token=${resetToken}`;

        // Backup: Log to console in development environments so you don't get locked out by sandbox restrictions
        if (process.env.NODE_ENV === "development") {
            console.log("\n[DEV ONLY] Reset Link:", resetLink, "\n");
        }

        // Send the email via Resend
        const { data, error: emailError } = await resend.emails.send({
            from: 'CashCanopy Security <security@cashcanopy.dev>', // Replace with your domain once verified in Resend
            to: [user.email],
            subject: 'Password Reset Request',
            html: `
                <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
                    <h2>Password Reset Request</h2>
                    <p>You requested a password reset for your Expense Tracker account.</p>
                    <p>Click the link below to set a new password. This link is valid for <strong>1 hour</strong>.</p>
                    <p style="margin: 24px 0;"><a href="${resetLink}" style="background: var(--primary); color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Reset Password</a></p>
                    <p style="color: #666; font-size: 12px;">If you didn't request this, you can safely ignore this email.</p>
                </div>
            `
        });

        // Explicitly catch Resend provider errors
        if (emailError) {
            console.error("Resend API Error:", emailError);
            return { success: false, error: "Failed to dispatch reset email. Please try again later." };
        }

        console.log("Email sent successfully:", data);
        return { success: true };

    } catch (error) {
        console.error("Forgot Password Error:", error);
        return { success: false, error: "12An unexpected error occurred." };
    }
}