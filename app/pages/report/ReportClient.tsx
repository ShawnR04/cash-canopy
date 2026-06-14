import ReportBreakdownCards from "@/components/app/report/ReportBreakdownCards";
import ReportLineChart from "@/components/app/report/ReportLineChart";
//
import type { SelectCategory } from "@/db/schema";


type CategoryWithSpent = Omit<SelectCategory, "spent"> & {
    spentAmount: number;
    spent?: number;
};
interface ReportClientProps{
    categories: CategoryWithSpent[];
    chartData: any[];
}

export default function ReportClient({categories,chartData}: ReportClientProps){
    return(
        <>
            <div className="p-4 h-full flex flex-col overflow-y-auto gap-2 no-scrollbar">
                <div className="">
                    <ReportLineChart data={chartData}/>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <ReportBreakdownCards categories={categories}/>
                </div>
            </div>
        </>
    );
}