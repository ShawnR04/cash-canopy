import { FaArrowUp, FaCalendarAlt, FaPercentage } from "react-icons/fa";
import { FaWallet,FaPiggyBank } from "react-icons/fa";
import { FiArrowUpRight, FiArrowDownRight } from "react-icons/fi";
import { getDashboardStats } from "@/lib/getDashboardStats";


export default async function DashboardCard(){
    
    const { totalBalance, monthlyIncome, monthlyExpenses,savingsRate,balancePercentageChange} = await getDashboardStats();

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);
    }

    const currentMonthName = new Date().toLocaleString("default", { month: "long" });

    const DASHBOARD_CARDS = [
      { title: "Total Balance", valueColor: totalBalance < 0 ? "text-destructive" : "text-primary", value:`${formatCurrency(totalBalance)}`,subtextColor:"text-primary",subText:`${balancePercentageChange}% from last month`,icon:FaArrowUp, icon2: FaWallet, icon2Bg: "bg-primary/10 text-primary" },
      { title: "Monthly Income", valueColor:"text-emerald-600",value:`${formatCurrency(monthlyIncome)}`,subtextColor:"text-muted-foreground",subText:currentMonthName,icon:FaCalendarAlt, icon2: FiArrowUpRight, icon2Bg: "bg-emerald-500/10 text-emerald-500" },
      { title: "Monthly Expenses", valueColor:"text-destructive",value:`${formatCurrency(monthlyExpenses)}`,subtextColor:"text-muted-foreground",subText:currentMonthName,icon:FaCalendarAlt, icon2: FiArrowDownRight, icon2Bg: "bg-destructive/10 text-destructive"},
      { title: "Savings Rate", valueColor:"",value:`${savingsRate}%`,subtextColor:"text-muted-foreground",subText:"Of Income",icon:FaPercentage, icon2: FaPiggyBank, icon2Bg: "bg-indigo-500/10 text-indigo-500" },
    ];

    return(
        <>
            {DASHBOARD_CARDS.map((card) => (                
                <div key={card.title} className="bg-card p-5 flex rounded-xl shadow-sm hover:shadow-md transition-all border border-border relative">
                    <div className="w-2/3">
                        <h2 key={card.title} className="text-lg">
                            {card.title}
                        </h2>
                        <h1 className={`text-2xl md:text-3xl font-bold ${card.valueColor}`}>
                            {card.value}
                        </h1>
                        <p className={`flex items-center gap-1 text-sm ${card.subtextColor}`}>
                            <card.icon/>
                            {card.subText}
                        </p>
                    </div>
                    {/* absolute on mobile layout structures, dropping back into relative flex blocks on desktop */}
                    <div className="absolute top-4 right-4 md:relative md:top-auto md:right-auto flex items-center justify-center md:w-1/3 shrink-0">
                        <div className={`${card.icon2Bg} text-xl md:text-2xl p-2.5 rounded-xl flex items-center justify-center aspect-square transition-transform group-hover:scale-105`}>
                            <card.icon2 />
                        </div>
                    </div>
                </div>
            ))}
        </>
    );
}