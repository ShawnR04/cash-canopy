'use client'

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
//
import { toast } from "sonner";
import { loginUser } from "@/app/actions/login";
import { useRouter } from "next/navigation";

export default function Login(){
    const [showPassword, setShowPassword] = useState(false);

    const router = useRouter();

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const formElement = e.currentTarget;
      const formData = new FormData(formElement);

      const toastId = toast.loading(`Logging in...`);

      try {
        const res = await loginUser(formData);

        if (res?.success) {
          toast.success(`Welcome ${formData.get("user")}`, { id: toastId });
          formElement.reset();

          setTimeout(() => {
            router.push("/home");
          }, 500);
        } else {
          toast.error(res?.error || `Failed to login`, { id: toastId });
        }
      } catch (error) {
        toast.error("An unexpected error occured.", { id: toastId });
      }
    };

    return(
        <>
            <div className="h-dvh flex justify-center items-center">
                <form 
                    onSubmit={handleLogin}
                    className="bg-card w-90 md:w-110 p-3 gap-5 flex flex-col rounded-md"
                >
                    <div className="flex flex-col items-center">
                        <h1 className="text-xl font-bold text-muted-foreground">
                            Welcome back!
                        </h1>
                        <h1 className="text-[28px] font-bold text-primary">
                            Sign in to your account.
                        </h1>
                    </div> 

                    <div className="flex flex-col gap-2">
                        <Label className="text-muted-foreground text-lg">
                            Username
                        </Label>
                        <Input
                            id="user"
                            type="text"
                            name="user"
                            className="h-12 md:h-10 transition-all duration-300"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label className="text-muted-foreground text-lg">
                            Password
                        </Label>

                        <div className="relative flex items-center">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                name="password"
                                className="h-12 md:h-10 transition-all duration-300"
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

                    <div className="flex justify-between text-base h-10">
                        <Link 
                            href="/authentication/signup"
                            className="p-1 hover:bg-muted-foreground/10 hover:text-primary rounded-md transition-all duration-300"
                        >
                            Don&apos;t have an account?
                        </Link>

                        <Link 
                            href="/authentication/login/forgot_password"
                            className="p-1 hover:bg-muted-foreground/10 hover:text-primary rounded-md transition-all duration-300"
                        >
                            forgot password?
                        </Link>
                    </div>

                    <div className="flex justify-center items-center">
                        <button 
                            type="submit" 
                            className="bg-primary w-2/3 p-2 text-xl font-bold hover:bg-primary/80 transition-all duration-300 rounded-md"
                        >
                            Login
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}