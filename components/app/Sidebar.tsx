'use client'

import { useState } from "react"
import { 
    HiMenuAlt2, 
    HiX
} from "react-icons/hi";
import { 
    LayoutDashboard, 
    ArrowRightLeft,
    ChartPie, 
    ChartSpline,
    HandCoins,
    Settings
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import Link from "next/link";
import LogoutButton from "./LogoutButton";
import ExportData from "./ExportData";

interface NavMenuProps{
    activeTab:string;
    setActiveTab: (id: string) => void;
    username: string;
}

export default function Sidebar({activeTab, setActiveTab, username}: NavMenuProps){
    const [isOpen, setIsOpen] = useState(false);

    const NAV_LINKS = [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "transactions", label: "Transactions", icon: ArrowRightLeft },
        { id: "budgets", label: "Budgets", icon: ChartPie },
        { id: "report", label: "Report", icon: ChartSpline },
        { id: "goals", label: "Savings Goals", icon: HandCoins }
    ];

    const handleNavClick = (linkId: string) => {
        setActiveTab(linkId);
        setIsOpen(false);
    }

    return(
        <>
            <div className=" bg-card w-full h-15 p-2 flex items-center fixed md:hidden transition-all duration-400 ease-in-out">
                <button 
                    onClick={() => setIsOpen(true)}
                    className="bg-secondary p-1 rounded-md transition-colors"
                    aria-label="Menu"
                >
                    <HiMenuAlt2 className="w-8 h-8"/>
                </button>
            </div>

            {isOpen && (
                <div className="fixed bg-card/50 inset-0 backdrop-blur-[2px] md:hidden transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside 
                className={`
                    bg-card w-60 h-full p-4 fixed top-0 left-0 transform transition-all duration-400 ease-in-out
                    ${isOpen ? "translate-x-0" : "-translate-x-full"}
                    md:translate-x-0 md:block
                `}
            >
                <div className="gap-2 flex flex-col items-center">
                    <div className="">
                        <Image 
                            src="/favicon.ico"
                            alt=""
                            width={50}
                            height={50}
                            className="h-20 w-20"
                        />
                    </div>
                    <h1 className="font-bold text-xl flex flex-col items-center">
                        Welcome
                        <span className="text-primary text-center">
                            {username}
                        </span>
                    </h1>
                    <button 
                        onClick={() => setIsOpen(false)}
                        className="fixed right-2 md:hidden transition-colors"
                        aria-label="Close Menu"
                    >
                        <HiX className="w-8 h-8"/>
                    </button>
                </div>

                <nav className=" py-5 space-y-2">
                    {NAV_LINKS.map((link) => (
                        <div key={link.id} className={cn("group rounded-md transition-all ease-in-out duration-300 hover:bg-primary text-muted-foreground hover:text-foreground",
                            activeTab === link.id ? "bg-primary text-foreground" : ""
                        )}>
                            <button 
                                onClick={() => handleNavClick(link.id)}
                                className="w-full px-5 py-3 gap-3 font-medium text-lg flex items-center transition-all cursor-pointer"
                            >
                                <span className="">
                                    <link.icon className={cn("text-primary group-hover:text-foreground transition-all ease-in-out duration-300",
                                        activeTab === link.id ? "text-foreground" : ""
                                    )}/>
                                </span>
                                {link.label}
                            </button>
                        </div>
                    ))}

                    <div className=" h-15 px-5 flex items-center justify-center">
                        <ExportData/>
                    </div>

                    <div className=" h-10 px-5 flex items-center justify-between">
                        <LogoutButton/>
                        <button 
                            onClick={() => handleNavClick("settings")}
                            className={cn("p-1 rounded-md text-primary bg-primary/15 cursor-pointer",
                                activeTab === "settings" ? "bg-primary text-foreground" : ""
                            )}
                            aria-label="Settings"
                        >
                            <Settings className="w-8 h-8"/>
                        </button>
                    </div>
                </nav>
            </aside>
        </>
    );
}