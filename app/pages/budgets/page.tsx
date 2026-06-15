import BudgetsClient from "./BudgetsClient";
import { getCategoriesWithSpending } from "@/lib/getBudgets";
import { getTransactions } from "@/lib/getTransactions";


export default async function Budgets(){
    // Fetches only the active user's categories and aggregated spending metrics
    const budgets = await getCategoriesWithSpending();
    const transactions = await getTransactions() || [];

    const totalIncome = transactions
        .filter((t: any) => t.type === 'income')
        .reduce((acc: number, t: any) => acc + Number(t.amount), 0);

    const totalExpense = transactions
        .filter((t: any) => t.type === 'expense')
        .reduce((acc: number, t: any) => acc + Number(t.amount), 0);

    return(
        <>
            <BudgetsClient budgets={budgets} totalIncome={totalIncome} totalExpense={totalExpense} />
        </>
    );
}