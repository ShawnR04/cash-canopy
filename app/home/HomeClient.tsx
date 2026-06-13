'use client' 

import { useState }from "react";
import Sidebar from "@/components/app/Sidebar";

interface MainDashboardProps {
    username: string;
    email: string | null;
    dashboardTab: React.ReactNode;
    transactionsTab: React.ReactNode;
    budgetsTab: React.ReactNode;
    reportTab: React.ReactNode;
    goalsTab: React.ReactNode;
    settingsTab: React.ReactNode;
}

export default function HomeClient({ 
    username , 
    email, 
    dashboardTab, 
    transactionsTab, 
    budgetsTab, 
    reportTab, 
    goalsTab, 
    settingsTab
}: MainDashboardProps){
    const [activeTab,setActiveTab] = useState("transactions");
    const renderContent = () => {
        switch(activeTab){
            case "dashboard": return dashboardTab;
            case "transactions": return transactionsTab;
            case "budgets": return budgetsTab;
            case "report": return reportTab;
            case "goals": return goalsTab;
            case "settings": return settingsTab;
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