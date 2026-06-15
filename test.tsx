{/* Top Row: Label and Subtle Indicator */}
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
                    Total Income Remaining
                </span>
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            {/* Middle Row: Formatted Large Numeric Display */}
            <div className="flex items-baseline gap-1">
                <h2 className="text-3xl font-extrabold text-card-foreground tracking-tight break-all">
                    {formattedAmount}
                </h2>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden mt-1">
                <div
                    className="bg-emerald-500 h-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Bottom Row: Informational Footer Text */}
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                <div className="flex items-center gap-1.5">
                    <span className="text-emerald-500 font-semibold">{progress.toFixed(0)}%</span>
                    <span>spent</span>
                </div>
                <div className="flex gap-3">
                    <span>Income: ${totalIncomeAmount.toFixed(2)}</span>
                    <span>Spent: ${totalExpenseAmount.toFixed(2)}</span>
                </div>
            </div>