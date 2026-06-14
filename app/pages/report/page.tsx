import ReportClient from "./ReportClient";
import { getAuthUserId } from "@/lib/getUserData";
import { getCategoriesWithSpending } from "@/lib/getBudgets";
import { getMonthlyGraphData } from "@/lib/getMonthlyGraphData";


export default async function Report(){
    const userId = await getAuthUserId();

    if(!userId){
        return(
            <div className=" h-30 flex items-center justify-center col-span-3 text-center text-muted-foreground">
                <p className="bg-card h-2/3 w-1/2 flex items-center justify-center rounded-xl shadow-sm transition-all">
                    Please log in to view your report history.
                </p>
            </div>
        );
    }

    // 1. Pass the secure userId down to the chart aggregation query
    const chartData = await getMonthlyGraphData(userId);
    const categoriess = await getCategoriesWithSpending();
    
    // 2. FIXED: Map the categories using 'totalSpent' to align with the database helper keys
    const formattedCategories = categoriess.map((cat) => ({
      ...cat,
      spent: cat.spentAmount
    }));
    return(
        <>
            <ReportClient 
                categories={formattedCategories}
                chartData={chartData}
            />
        </>
    );
}