import DashboardBarChart from "@/components/app/dashboard/DashboardBarChart";
import DashboardCards from "@/components/app/dashboard/DashboardCards";
import DashboardPieChart from "@/components/app/dashboard/DashboardPieChart";
//
import{ getCategoriesWithSpending } from "@/lib/getBudgets";
import type { SelectCategory } from "@/db/schema";
import TransactionsTable, { TransactionWithCategory } from "@/components/app/transactions/TransactionsTable";
import { getDashboardStats } from "@/lib/getDashboardStats";


interface DashboardClientProps {
  categories: SelectCategory[];
  transactions: TransactionWithCategory[];
}

export default async function DashboardClient({categories,transactions}:DashboardClientProps){
    const { totalIncome, totalExpenses, monthlyExpenses } = await getDashboardStats();
    const Dashcategories = await getCategoriesWithSpending();
    return(
        <>
            <div className="p-4 h-full flex flex-col overflow-y-auto gap-2 rounded-xl no-scrollbar px-3 py-2">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <DashboardCards/>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <DashboardPieChart categories={Dashcategories} totalExpenses={monthlyExpenses}/>
                    <DashboardBarChart totalIncome={totalIncome} totalExpense={totalExpenses}/>
                </div>
                <div className="">
                    <TransactionsTable 
                        transactions={transactions}
                        category={categories}
                        itemsPerPage={10}
                    />
                </div>
            </div>
        </>
    );
}