'use client'

import { useState } from "react";
import { LogOut } from "lucide-react";
import { logoutUser } from "@/app/actions/logout";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function LogoutButton(){
    const [isOpen, setIsOpen] = useState(false);

    const router = useRouter();

    const handleLogout = async () => {
    setIsOpen(false); // Close the modal immediately when confirmed
    const toastId = toast.loading("Logging out...");

    const res = await logoutUser();

    if (res.success) {
      toast.success("Logged out successfully!", { id: toastId });
      
      router.push("/authentication/login");
      router.refresh();
    } else {
      toast.error(res.error || "An error occurred during logout.", { id: toastId });
    }
  };
    return(
        <>
            <div 
                onClick={() => setIsOpen(true)}
                className="text-destructive bg-destructive/15 cursor-pointer p-1 rounded-md"
            >
                <LogOut className="w-8 h-8"/>
            </div>

            {isOpen && (
                <div 
                    onClick={() => setIsOpen(false)}
                    className="bg-card/50 fixed inset-0 top-0 left-0 w-screen h-full backdrop-blur-xs flex items-center justify-center z-50"
                >
                    <div className="bg-foreground w-80 p-3 gap-2 flex flex-col text-background rounded-md">
                        <h1 className="h-10 flex items-center justify-center text-xl font-semibold">
                            Are you absolutely sure?
                        </h1>
                        <p className="text-center">
                            This will end your current active session and you will need to sign back in to access the hero section.
                        </p>
                        <div className="h-15 px-5 flex items-center justify-between">
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="bg-muted-foreground p-2 rounded-md"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleLogout}
                                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground p-2 rounded-md"
                            >
                                Yes, Log out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}