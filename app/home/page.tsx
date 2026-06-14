import HomeClient from "./HomeClient";
import { getAccountSessions, getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import Dashboard from "../pages/dashboard/page";
import Transactions from "../pages/transactions/page";
import Budgets from "../pages/budgets/page";
import Report from "../pages/report/page";
import Goals from "../pages/goals/page";
import Settings from "../pages/settings/page";

export default async function Home() {
  const [user, accounts] = await Promise.all([
    getCurrentUser(),
    getAccountSessions(),
  ]);

  if (!user) redirect("/authentication/login");

  return (
    <HomeClient
      username={user.username}
      accounts={accounts}
      dashboardTab={<Dashboard />}
      transactionsTab={<Transactions />}
      budgetsTab={<Budgets />}
      reportTab={<Report />}
      goalsTab={<Goals />}
      settingsTab={<Settings />}
    />
  );
}
