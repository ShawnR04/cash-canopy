import React from "react";
import type { SelectCategory } from "@/db/schema";
import { categoryIconMap, categoryStyleMap } from "@/lib/categoryIcons";

type CategoryWithSpent = SelectCategory & {
    spentAmount?: number;
};

export default function ReportBreakdown({ categories }: { categories: CategoryWithSpent[] }){
    const activeCategories = categories?.filter(
        (category) => category.spentAmount && category.spentAmount > 0
    ) || [];

    // Calculate the combined total of ONLY the active items for percentage calculations
    const totalActiveSpent = activeCategories.reduce(
      (sum, cat) => sum + (cat.spentAmount || 0), 
      0
    );

    // Sort them highest to lowest so your "Top Expenses" card naturally lists the heaviest hits first
    const sortedExpenses = [...activeCategories].sort(
      (a, b) => (b.spentAmount || 0) - (a.spentAmount || 0)
    );

    return(
        <>
            <div className="bg-card p-5 rounded-xl shadow-sm hover:shadow-md transition-all border border-border">
                <div className="">
                    <h1 className="text-primary py-2 text-lg font-bold">
                        Top Expenses
                    </h1>
                </div>
                <div className="">
                    {sortedExpenses.length === 0 ? (
                        <p className="">No expense recorded</p>
                    ) : (
                        sortedExpenses.map((category) => {
                            const Icon =
                              categoryIconMap[category.icon as keyof typeof categoryIconMap] ??
                              categoryIconMap.Other;
                            const specificStyle =
                              categoryStyleMap[category.icon as keyof typeof categoryStyleMap] ||
                              categoryStyleMap.Other;

                            return (
                                <div key={`top-${category.id}`} className="flex items-center justify-between py-2 text-lg">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-primary-foreground text-sm ${specificStyle}`}>
                                            <Icon />
                                        </div>
                                        <p className="capitalize">
                                            {category.name}
                                        </p>
                                    </div>
                                    <p className="text-destructive font-medium text-[16px]">
                                        ${category.spentAmount?.toFixed(2)}
                                    </p>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
            <div className="bg-card p-5 rounded-xl shadow-sm hover:shadow-md transition-all border border-border">
                <div className="">
                    <h1 className="text-primary py-2 text-lg font-bold">
                        Category Breakdown
                    </h1>
                </div>
                
                <div className="">
                    {activeCategories.length === 0 ? (
                        <p className="">No data available</p>
                    ) : (
                        activeCategories.map((category) => {
                            const spent = category.spentAmount || 0;
                            // Percentage
                            const percentage = totalActiveSpent > 0
                            ? ((spent / totalActiveSpent) * 100).toFixed(1)
                            : "0.0";

                            const Icon =
                              categoryIconMap[category.icon as keyof typeof categoryIconMap] ??
                              categoryIconMap.Other;
                            const specificStyle =
                              categoryStyleMap[category.icon as keyof typeof categoryStyleMap] ||
                              categoryStyleMap.Other;

                            return(
                                <div key={`breakdown-${category.id}`} className="flex items-center justify-between py-2 text-lg">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-primary-foreground text-sm ${specificStyle}`}>
                                            <Icon />
                                        </div>
                                        <p className="capitalize">
                                            {category.name}
                                        </p>
                                    </div>
                                    <p className="text-muted-foreground text-[16px]">
                                        {percentage}%
                                        (${spent.toFixed(2)})
                                    </p>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </>
    );
}