"use client";

import React, { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "@/components/app/Sidebar";
import type { AccountSession } from "@/lib/auth/types";
import AccountSwitcher from "@/components/app/AccountSwitcher";
import { getAuthUserId } from "@/lib/getUserData";

interface MainDashboardProps {
  username: string;
  accounts: AccountSession[];
  dashboardTab: React.ReactNode;
  transactionsTab: React.ReactNode;
  budgetsTab: React.ReactNode;
  reportTab: React.ReactNode;
  goalsTab: React.ReactNode;
  settingsTab: React.ReactNode;
  userId: string;
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
  userId,
}: MainDashboardProps) {

  
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  // 1. Read the tab from the URL search params (?tab=...)
  // If no parameter exists, default seamlessly to "dashboard"
  const activeTab = searchParams.get("tab") || "dashboard";

  // 2. Custom state setter that updates the URL instead of local component state
  const setActiveTab = (newTab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", newTab);
    
    // Wrap in startTransition to keep the UI smooth during dynamic slot rendering swaps
    startTransition(() => {
      router.push(`?${params.toString()}`, { scroll: false });
    });
  };

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
        return dashboardTab;
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
          userId={userId}
        />
      </div>

      <div className="w-full h-full flex flex-col pt-15 md:pt-0 md:pl-60 transition-all duration-400 ease-in-out">
        <div className="h-10 flex items-center justify-end my-2">
          <div className="px-5">
            <AccountSwitcher
              accounts={accounts}
              activeTab={activeTab}
            />
          </div>
        </div>
        <div className="flex-1 w-full overflow-hidden">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}