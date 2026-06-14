"use client";

import { useState } from "react";
import Sidebar from "@/components/app/Sidebar";
import type { AccountSession } from "@/lib/auth/types";
import AccountSwitcher from "@/components/app/AccountSwitcher";

interface MainDashboardProps {
  username: string;
  accounts: AccountSession[];
  dashboardTab: React.ReactNode;
  transactionsTab: React.ReactNode;
  budgetsTab: React.ReactNode;
  reportTab: React.ReactNode;
  goalsTab: React.ReactNode;
  settingsTab: React.ReactNode;
}

export default function HomeClient({
  username,
  accounts,
  dashboardTab,
  transactionsTab,
  budgetsTab,
  reportTab,
  goalsTab,
  settingsTab,
}: MainDashboardProps) {

  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return dashboardTab;
      case "transactions":
        return transactionsTab;
      case "budgets":
        return budgetsTab;
      case "report":
        return reportTab;
      case "goals":
        return goalsTab;
      case "settings":
        return settingsTab;
      default:
        return null;
    }
  };

  return (
    <div className="h-dvh">
      <div className="overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          username={username}
          accounts={accounts}
        />
      </div>

      <div className="w-full h-full flex flex-col pt-15 md:pt-0 md:pl-60 transition-all duration-400 ease-in-out">
        <div className="h-10 flex items-center justify-end mt-2">
          <div className="px-5">
            <AccountSwitcher
              accounts={accounts}
              activeTab={activeTab}
            />
          </div>
        </div>

        {renderContent()}
      </div>
    </div>
  );
}