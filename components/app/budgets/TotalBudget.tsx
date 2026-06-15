
interface TotalBudgetProps {
    totalIncomeAmount: number;
}

export default function TotalBudget({ totalIncomeAmount }: TotalBudgetProps) {
    // Dynamically formats the raw number into a clean currency string (e.g., $1,250.00)
    const formattedAmount = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(totalIncomeAmount);

    return (
        <div className="bg-card p-5 gap-3 flex flex-col rounded-xl shadow-sm border border-border/50 transition-all cursor-pointer active:scale-[0.98] relative group hover:shadow-md">
            {/* Top Row: Label and Subtle Indicator */}
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
                    Total Income Budget
                </span>
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            {/* Middle Row: Formatted Large Numeric Display */}
            <div className="flex items-baseline gap-1">
                <h2 className="text-3xl font-extrabold text-card-foreground tracking-tight break-all">
                    {formattedAmount}
                </h2>
            </div>

            {/* Bottom Row: Informational Footer Text */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="text-emerald-500 font-semibold">100%</span>
                <span>allocated to active income tracking</span>
            </div>
        </div>
    );
}