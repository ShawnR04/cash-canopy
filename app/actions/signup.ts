'use server'

import { db } from "@/db/index";
import { usersTable as users } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { eq, or } from "drizzle-orm";
import { hash } from "bcrypt-ts"; // 1. Import the hash function

export async function createUser(formData: FormData){
    const name = formData.get('name')?.toString() || null;
    const email = formData.get('email')?.toString();
    const username = formData.get('username')?.toString();
    const password = formData.get('password')?.toString();

    if(!email || !username || !password){
        return{
            success: false,
            error: "Missing required fields"
        };
    };

    try{
        const exisitingUser = await db
            .select()
            .from(users)
            .where(or(eq(users.email,email), eq(users.username, username)));

        if(exisitingUser.length > 0){
            const hasEmailMatch = exisitingUser.some(u => u.email === email);
            const hasUsernameMatch = exisitingUser.some(u => u.username === username);

            if(hasEmailMatch && hasUsernameMatch){
                return{
                    success: false,
                    error: "An account with the same email and username already exists."
                };
            };
            if(hasEmailMatch){
                return{
                    success:false,
                    error: "An account with the same email already exists."
                };
            };
            if(hasUsernameMatch){
                return{
                    success:false,
                    error: "An account with the same username already exists."
                };
            };
        };

        const hashedPassword = await hash(password, 10); // 2. Hash the password

        await db.insert(users).values({
            name,
            email,
            username,
            password: hashedPassword
        });

        revalidatePath("/signup")
        return{ success: true }
    } catch(error){
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return { success: false, error: errorMessage }
    }
}