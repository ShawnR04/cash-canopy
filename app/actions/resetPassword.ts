'use server'

import { db } from "@/db/index";
import { usersTable as users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { jwtVerify } from "jose";

const secretKey = process.env.JWT_SECRET || "super-secret-key-change-me";
const encodedKey = new TextEncoder().encode(secretKey);

export async function resetPassword(formData: FormData){
    const token = formData.get("session_token")?.toString();
    const newPassword = formData.get("password")?.toString();

    if(!token || !newPassword){
        return{
            success: false,
            error: "Token and new password are required."
        }
    }

    try{
        let payload;

        try{
            const verified = await jwtVerify(token, encodedKey,
                {
                    algorithms: ["HS256"]
                }
            );
            payload = verified.payload;

        }catch(error){
            return{
                success: false,
                error: "Invalid or expired token."
            }
        }

        const userId = payload.userId as string;

        await db.update(users).set({
            password: newPassword
        }).where(eq(users.id, userId));

        return { success: true }

    }catch(error){
        console.error("Error resetting password:",error);
        return{
            success: false,
            error: "An unexpected error occurred."
        }
    }


}