'use client' 

import { useState }from "react";
import Sidebar from "@/components/app/Sidebar";
import Dashboard from "../pages/dashboard/page";
import Transactions from "../pages/transactions/page";
import Budgets from "../pages/budgets/page";
import Report from "../pages/report/page";
import Goals from "../pages/goals/page";
import Settings from "../pages/settings/page";

interface MainDashboardProps {
  username: string;
  email: string | null;
}

export default function HomeClient({ username , email}: MainDashboardProps){
    const [activeTab,setActiveTab] = useState("transactions");
    const renderContent = () => {
        switch(activeTab){
            case "dashboard": return <Dashboard/>;
            case "transactions": return <Transactions/>
            case "budgets": return <Budgets/>;
            case "report": return <Report/>;
            case "goals": return <Goals/>;
            case "settings": return <Settings/>;
            default: return null;
        }
    }
    
    return(
        <> 
            <div className="h-dvh">
                <div className="overflow-hidden">
                    <Sidebar
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        username={username}
                    />
                </div>
                <div className="w-full h-full flex flex-col pt-15 md:pt-0 md:pl-60 transition-all duration-400 ease-in-out">
                    {renderContent()}
                </div>
            </div>
        </>
    );
}