"use client";

import React, { useState, useEffect } from "react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import type { SelectCategory } from "@/db/schema";

type CategoryWithSpent = SelectCategory & { spentAmount?: number | string };

interface DashboardPieChartProps {
  categories?: CategoryWithSpent[];
  totalExpenses: number | string; 
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: {
      color: string;
      percentage: string;
    };
  }>;
}

const COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
  '#06b6d4', '#ec4899', '#f97316', '#14b8a6', '#6366f1', 
  '#a855f7', '#f43f5e', '#0ea5e9', '#84cc16', '#d946ef', 
  '#eab308', '#22c55e', '#64748b', '#fa5252', '#ab51e6'
];
const UNCATEGORIZED_COLOR = '#64748b';

/* ==========================================================================
   CUSTOM TOOLTIP COMPONENT (HOVER CARD RECONSTRUCTED)
   ========================================================================== */
const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
      }).format(amount);
    };

    return (
      /* FIXED: Set relative context and explicit high z-index boundary */
      <div className="bg-popover/95 backdrop-blur-sm p-3 rounded-xl border border-border shadow-xl min-w-[160px] pointer-events-none relative z-[9999]">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: data.payload.color }} />
          <p className="text-xs font-bold text-foreground capitalize">{data.name}</p>
        </div>
        <div className="flex flex-col gap-0.5 pl-4.5">
          <p className="text-xs font-semibold text-muted-foreground">
            Amount: <span className="text-foreground font-bold">{formatCurrency(data.value)}</span>
          </p>
          <p className="text-[10px] font-medium text-muted-foreground">
            Share: <span className="text-primary font-bold">{data.payload.percentage}%</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

/* ==========================================================================
   MAIN DASHBOARD PIE CHART COMPONENT
   ========================================================================== */
export default function DashboardPieChart({ categories, totalExpenses }: DashboardPieChartProps) {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
      const checkMobile = () => setIsMobile(window.innerWidth < 768);
      checkMobile();
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
    }, []);

    const parsedTotalExpenses = Number(totalExpenses) || 0;

    // 1. Map out data slices
    const data = (categories || [])
      .map(category => ({
        name: category.name,
        value: Number(category.spentAmount) || 0,
      }))
      .filter(item => item.value > 0);

    const totalCategorized = data.reduce((sum, item) => sum + item.value, 0);
    const uncategorizedAmount = parsedTotalExpenses - totalCategorized;

    if (uncategorizedAmount > 0) {
      data.push({
        name: "Uncategorized",
        value: uncategorizedAmount
      });
    }

    // 2. Strict math execution targeting the actual display elements
    const actualDisplayTotal = data.reduce((sum, item) => sum + item.value, 0);

    const finalData = data.map((item, index) => {
      const isUncategorized = item.name === "Uncategorized";
      return {
        ...item,
        color: isUncategorized ? UNCATEGORIZED_COLOR : COLORS[index % COLORS.length],
        percentage: actualDisplayTotal > 0 ? ((item.value / actualDisplayTotal) * 100).toFixed(1) : "0.0"
      };
    });

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
      }).format(amount);
    };

    if (actualDisplayTotal === 0) {
        return (
            <div className="bg-card p-5 rounded-xl shadow-sm border border-border flex flex-col h-full min-h-[420px] md:min-h-[380px] items-center justify-center text-sm text-muted-foreground">
                No spending entries recorded
            </div>
        );
    }

    return (
        <div className="bg-card p-5 rounded-xl shadow-sm hover:shadow-md transition-all border border-border flex flex-col h-full min-h-[420px] md:min-h-[380px]">
            <h1 className="text-lg py-2 text-primary font-bold">Spending by Category</h1>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 items-center justify-center gap-6 w-full mt-2 min-h-[260px]">
                
                {/* LEFT SIDE: THE CHART CELL OVERLAY CONTAINER */}
                <div className="relative w-full h-[240px] md:h-[260px] flex items-center justify-center mx-auto">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={finalData}
                                cx="50%"
                                cy="50%"
                                innerRadius={isMobile ? 55 : 70}
                                outerRadius={isMobile ? 85 : 105}
                                paddingAngle={3}
                                dataKey="value"
                            >
                                {finalData.map((entry, index) => (
                                    <Cell 
                                      key={`cell-${index}`} 
                                      fill={entry.color} 
                                      className="stroke-card hover:opacity-95 transition-opacity focus:outline-none stroke-2 cursor-pointer" 
                                    />
                                ))}
                            </Pie>
                            {/* FIXED: Configured wrapperStyle directly to intercept Recharts injection layering */}
                            <Tooltip 
                              content={<CustomTooltip />} 
                              cursor={{ fill: "none" }} 
                              wrapperStyle={{ zIndex: 9999 }}
                            />
                        </PieChart>
                    </ResponsiveContainer>

                    {/* ABSOLUTE CENTER HOLE LAYER METRICS */}
                    {/* FIXED: Lowered z-index context back down to z-[1] so tooltips overlay over top */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1] flex flex-col items-center justify-center text-center pointer-events-none select-none">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Total Expenses</span>
                        <span className="text-lg md:text-xl font-extrabold tracking-tight text-foreground block whitespace-nowrap">
                            {formatCurrency(actualDisplayTotal)}
                        </span>
                    </div>
                </div>

                {/* RIGHT SIDE: CUSTOM DOM-LEVEL LEGEND ROW LIST LISTING */}
                <div className="w-full flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1 no-scrollbar justify-center">
                    {finalData.map((item, index) => (
                        <div key={`legend-${index}`} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/40 hover:bg-muted/60 transition-colors text-xs w-full">
                            <div className="h-10 flex items-center gap-2 min-w-0">
                                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                                <span className="font-semibold text-foreground truncate max-w-[100px] capitalize">{item.name}</span>
                                <span className="text-muted-foreground text-[10px]">({item.percentage}%)</span>
                            </div>
                            <span className="font-bold text-foreground ml-2 whitespace-nowrap">{formatCurrency(item.value)}</span>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}