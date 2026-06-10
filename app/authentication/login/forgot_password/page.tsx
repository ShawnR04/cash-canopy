'use client'

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ForgotPassword(){
    return(
        <>
            <div className="h-dvh flex items-center justify-center">
                <form 
                    action="" 
                    className="bg-card w-90 p-3 gap-3 flex flex-col rounded-md"
                >
                    <div className="flex justify-center items-center">
                        <h1 className="text-primary font-bold text-2xl">
                            Reset Password
                        </h1>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label className="text-muted-foreground text-lg">
                            Email Address
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            className="h-12 md:h-10 transition-all duration-300"
                            placeholder="Enter your email address"
                        />
                    </div>

                    <div className="flex justify-between text-base h-10">
                        <Link 
                            href="/authentication/login"
                            className="p-1 hover:bg-muted-foreground/10 hover:text-primary rounded-md transition-all duration-300"
                        >
                            Back to Login
                        </Link>
                    </div>
                    
                    <div className="flex justify-center items-center">
                        <button 
                            type="submit" 
                            className="bg-primary w-1/2 p-2 text-lg font-bold hover:bg-primary/80 transition-all duration-300 rounded-md"
                        >
                            Send Reset Link
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}