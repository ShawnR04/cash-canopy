'use client'

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button} from "@/components/ui/button";
import { toast } from "sonner";
import { resetPassword } from "@/app/actions/resetPassword";
import { useRouter } from "next/navigation";

export default function ResetPasswordClient({ token }:{token?: string}){
    const PASSWORDS = [
        {id:"password",text:"Password",type:"password",required:false},
        {id:"confirm-password",text:"Confirm Password",type:"password",required:false}
    ];

    const router = useRouter();

    const handleResetPassword = async (e:React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if(!token){
            toast.error("Invalid or missing reset token")
            return;
        }

        const formElement = e.currentTarget;
        const formData = new FormData(formElement);

        const password = formData.get("password");
        const confirmPassword = formData.get("confirm-password");

        if(password !== confirmPassword){
            toast.error("Passwords do not match");
            return;
        }

        formData.append("session_token",token);

        const toastId = toast.loading(`Resetting password...`);

        try{
            const res = await resetPassword(formData);

            if(res?.success){
                toast.success(`Password reset successfully`,{id:toastId});
                formElement.reset();
                router.push("/authentication/login");
            }else{
                toast.error(res?.error || `Failed to reset password`,{id:toastId});
            }
        }catch(error){
            toast.error("An unexpected error occured.",{id:toastId});
        }
    }

    if(!token){
        return(
            <div className="flex justify-center items-center h-screen">
                <div className="text-center text-destructive font-bold text-xl bg-card p-5 rounded-xl">
                    Invalid or missing password reset token.
                </div>
            </div>
        )
    }
    return(
        <>
            <div className="h-dvh flex items-center justify-center">
                <form onSubmit={handleResetPassword} className="bg-card w-90 p-3 gap-3 flex flex-col rounded-md">
                    <div className="flex flex-col items-center">
                      <h1 className="text-2xl font-bold text-primary">
                        Enter A New Password
                      </h1>
                    </div>

                    <div className="gap-5 grid grid-cols-1">
                        {PASSWORDS.map((password) => (
                            <div key={password.id} className="gap-2 flex flex-col">
                                <Label
                                    className="text-muted-foreground text-lg"
                                >
                                    {password.text}
                                </Label>
                                <Input
                                    type={password.type}
                                    name={password.id}
                                    className="h-12"
                                    required={password.required}
                                />
                            </div>
                        ))}
                    </div>
                     <div className="flex justify-center items-center">
                        <button 
                            type="submit" 
                            className="bg-primary w-1/2 p-2 text-lg font-bold hover:bg-primary/80 transition-all duration-300 rounded-md"
                        >
                            Reset Password
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}