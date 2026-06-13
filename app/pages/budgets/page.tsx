import BudgetsClient from "./BudgetsClient";
import { getCategoriesWithSpending } from "@/lib/getBudgets";


export default async function Budgets(){
    // Fetches only the active user's categories and aggregated spending metrics
    const budgets = await getCategoriesWithSpending();

    return(
        <>
            <BudgetsClient budgets={budgets}/>
        </>
    );
}