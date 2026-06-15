import DashboardClient from "./DashboardClient";
import { getUserBudgets,getAuthUserId } from "@/lib/getUserData";
import { getTransactions } from "@/lib/getTransactions"

export default async function Dashboard(){
    const categories = await getUserBudgets();
    const transactions = await getTransactions();
    return(
        <>
            <DashboardClient categories={categories} transactions={transactions}/>
        </>
    );
}