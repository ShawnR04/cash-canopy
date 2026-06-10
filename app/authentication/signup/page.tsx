'use client'

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export default function Signup(){
    const INPUTBOXES = [
        {id:"name",text:"Name",type:"text",required:false},
        {id:"email",text:"Email",type:"email",required:true},
        {id:"username",text:"Username",type:"text",required:true}
    ];

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return(
        <>
            <div className="h-dvh flex justify-center items-center">
                <form 
                    action="" 
                    className="bg-card w-100 md:w-120 p-3 gap-5 flex flex-col rounded-md"
                >
                    <div className="flex flex-col items-center">
                        <h1 className="text-xl font-bold text-muted-foreground">
                            Welcome to CashCanopy.
                        </h1>
                        <h1 className="text-[28px] font-bold text-primary">
                            Create a new account.
                        </h1>
                    </div> 

                    {INPUTBOXES.map((input) => (
                        <div key={input.id} className="flex flex-col gap-2">
                            <Label className="text-muted-foreground text-lg">
                                {input.text}
                            </Label>
                            <Input
                                id={input.id}
                                type={input.type}
                                name={input.id}
                                className="h-10 transition-all duration-300"
                            />
                        </div>
                    ))}

                    <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col gap-2">
                            <Label className="text-muted-foreground text-lg">
                                Password
                            </Label>

                            <div className="relative flex items-center">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    className="h-10 transition-all duration-300"
                                />
                                <button 
                                    type="button" 
                                    className="absolute right-2 cursor-pointer transition-all duration-300"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="" />
                                    ) : (
                                        <Eye className="" />
                                    )}
                                </button>
                            </div>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                            <Label className="text-muted-foreground text-lg">
                                Confirm Password
                            </Label>

                            <div className="relative flex items-center">
                                <Input
                                    id="password"
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="password"
                                    className="h-10 transition-all duration-300"
                                />
                                <button 
                                    type="button" 
                                    className="absolute right-2 cursor-pointer transition-all duration-300"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="" />
                                    ) : (
                                        <Eye className="" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between text-base h-10">
                        <Link 
                            href="/authentication/login"
                            className="p-1 hover:bg-muted-foreground/10 hover:text-primary rounded-md transition-all duration-300"
                        >
                            Already have an account?
                        </Link>
                    </div>

                    <div className="flex justify-center items-center">
                        <button 
                            type="submit" 
                            className="bg-primary w-2/3 p-2 text-xl font-bold hover:bg-primary/80 transition-all duration-300 rounded-md"
                        >
                            Signup
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}