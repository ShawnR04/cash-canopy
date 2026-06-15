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
            from: 'CashCanopy Security <security@cashcanopy.dev>', 
            to: [user.email],
            subject: 'Password Reset Request',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Reset Your Password</title>
                </head>
                <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; padding: 48px 16px;">
                        <tr>
                            <td align="center">
                                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 480px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                                    
                                    <tr>
                                        <td style="background-color: #0f172a; padding: 32px; text-align: center;">
                                            <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.025em;">
                                                CashCanopy
                                            </h1>
                                        </td>
                                    </tr>
        
                                    <tr>
                                        <td style="padding: 40px 32px;">
                                            <h2 style="margin: 0 0 16px 0; color: #0f172a; font-size: 20px; font-weight: 600; line-height: 1.3;">
                                                Password Reset Request
                                            </h2>
                                            <p style="margin: 0 0 16px 0; color: #334155; font-size: 15px; line-height: 1.6;">
                                                We received a request to reset the password for your Expense Tracker account. No changes have been made yet.
                                            </p>
                                            <p style="margin: 0 0 32px 0; color: #475569; font-size: 14px; line-height: 1.6;">
                                                Click the button below to set up a new password. This link is valid for <strong style="color: #0f172a;">1 hour</strong>.
                                            </p>
        
                                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                                                <tr>
                                                    <td align="center" style="padding-bottom: 16px;">
                                                        <a href="${resetLink}" target="_blank" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 6px; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);">
                                                            Reset Password
                                                        </a>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
        
                                    <tr>
                                        <td style="padding: 0 32px;">
                                            <div style="border-top: 1px solid #f1f5f9;"></div>
                                        </td>
                                    </tr>
        
                                    <tr>
                                        <td style="padding: 32px; background-color: #fafafa;">
                                            <p style="margin: 0; color: #64748b; font-size: 13px; line-height: 1.5; text-align: center;">
                                                If you didn't make this request, you can safely ignore this email. Your password will remain secure.
                                            </p>
                                        </td>
                                    </tr>
        
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
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
        return { success: false, error: "An unexpected error occurred." };
    }
}