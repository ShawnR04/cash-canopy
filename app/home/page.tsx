import HomeClient from "./HomeClient";
import { getUserProfile } from "@/lib/getUserProfile"
//
import Dashboard from "../pages/dashboard/page";
import Transactions from "../pages/transactions/page";
import Budgets from "../pages/budgets/page";
import Report from "../pages/report/page";
import Goals from "../pages/goals/page";
import Settings from "../pages/settings/page";

export default async function Home(){
    const {username,email} = await getUserProfile();
    //console.log(username,email);
    return(
        <>
            <HomeClient
                username={username}
                email={email}
                dashboardTab={<Dashboard/>}
                transactionsTab={<Transactions/>}
                budgetsTab={<Budgets/>}
                reportTab={<Report/>}
                goalsTab={<Goals/>}
                settingsTab={<Settings/>}
            />
        </>
    );
}