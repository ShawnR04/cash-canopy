'use client'

import { LogOut } from "lucide-react";

export default function LogoutButton(){
    return(
        <>
            <div className="text-destructive bg-destructive/15 cursor-pointer p-1 rounded-md">
                <LogOut className="w-8 h-8"/>
            </div>
        </>
    );
}