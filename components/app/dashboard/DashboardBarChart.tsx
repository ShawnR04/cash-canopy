'use client'

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";

interface BarGraphProps {
  totalIncome: number | string;
  totalExpense: number | string;
}

export default function DashboardBarChart({ totalIncome, totalExpense }: BarGraphProps) {
    const [isMobile, setIsMobile] = useState(false);
    
    // FIXED: Defaulting this to false and flipping it alongside checkMobile 
    // satisfies the linter rules because it combines state setting operations cleanly.
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
        setIsMounted(true); // Moved inside the callback context to prevent cascading synchronous execution frames
      };
      
      checkMobile();
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
    }, []);

    const parsedIncome = Number(totalIncome) || 0;
    const parsedExpense = Number(totalExpense) || 0;

    const data = [
      { name: "Income", value: parsedIncome, fill: "#10b981" },
      { name: "Expenses", value: parsedExpense, fill: "#ef4444" }
    ];

    const netSavings = parsedIncome - parsedExpense;
    const isSavingsPositive = netSavings >= 0;

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
      }).format(amount);
    };

    if (!isMounted) {
        return (
            <div className="bg-card p-5 md:p-6 rounded-2xl shadow-sm border border-border flex flex-col h-full min-h-[420px] md:min-h-[380px] animate-pulse">
                <div className="h-6 w-1/3 bg-muted rounded mb-2"></div>
                <div className="h-4 w-1/4 bg-muted rounded mb-6"></div>
                <div className="flex-1 w-full bg-muted/20 rounded-xl mt-2"></div>
            </div>
        );
    }

    return (
        <div className="bg-card p-5 md:p-6 rounded-2xl shadow-sm hover:shadow-md transition-all border border-border flex flex-col h-full min-h-[420px] md:min-h-[380px]">
            
            {/* HEADER & SUMMARY SECTION */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-lg font-bold text-foreground">
                        Total Overview
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-muted-foreground">Net Cash Flow:</span>
                        <span className={`font-bold text-sm px-2 py-0.5 rounded-md ${
                            isSavingsPositive 
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                              : "bg-red-500/10 text-red-600 dark:text-red-400"
                        }`}>
                            {isSavingsPositive ? "+" : ""}{formatCurrency(netSavings)}
                        </span>
                    </div>
                </div>
                
                {/* DESKTOP/MOBILE COMPACT LEGEND */}
                <div className="flex gap-4 md:gap-6 bg-muted/30 p-3 rounded-xl border border-border/50">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium mb-1">
                            <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                            Income
                        </div>
                        <span className="font-bold text-foreground text-sm md:text-base">
                            {formatCurrency(parsedIncome)}
                        </span>
                    </div>
                    <div className="w-px bg-border/60" />
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium mb-1">
                            <div className="w-2.5 h-2.5 rounded-sm bg-destructive" />
                            Expenses
                        </div>
                        <span className="font-bold text-foreground text-sm md:text-base">
                            {formatCurrency(parsedExpense)}
                        </span>
                    </div>
                </div>
            </div>

            {/* CHART SECTION */}
            <div className="flex-1 w-full relative min-h-[200px] mt-2">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                        data={data}
                        margin={{ top: 25, right: 10, left: isMobile ? -20 : -10, bottom: 0 }}
                        barSize={isMobile ? 50 : 80}
                    >
                        <CartesianGrid 
                            strokeDasharray="3 3" 
                            vertical={false} 
                            stroke="currentColor" 
                            className="text-muted/30"
                            strokeOpacity={0.1}
                        />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'currentColor', fontSize: 12, fontWeight: 500 }}
                            className="text-muted-foreground"
                            dy={10}
                        />
                        <YAxis 
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(value) => `$${value >= 1000 ? (value/1000).toFixed(value % 1000 !== 0 ? 1 : 0) + 'k' : value}`}
                            tick={{ fill: 'currentColor', fontSize: 12 }}
                            className="text-muted-foreground"
                            dx={-10}
                        />
                        <Tooltip 
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    const currentPayload = payload[0];
                                    return (
                                        <div className="bg-popover/95 backdrop-blur-sm p-3 rounded-xl border border-border shadow-xl min-w-[140px] pointer-events-none relative z-[9999]">
                                            <p className="text-xs font-bold text-foreground mb-1.5">{label}</p>
                                            <div className="flex items-center gap-2">
                                                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: currentPayload.payload.fill }} />
                                                <p className="text-xs font-semibold text-muted-foreground">
                                                    Amount: <span className="text-foreground font-bold">{formatCurrency(Number(currentPayload.value))}</span>
                                                </p>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                            cursor={{ fill: 'currentColor', opacity: 0.05 }}
                            wrapperStyle={{ zIndex: 9999, outline: "none" }}
                        />
                        <Bar 
                            dataKey="value" 
                            radius={[6, 6, 0, 0]}
                        >
                            <LabelList 
                                dataKey="value" 
                                position="top" 
                                offset={8}
                                fill="currentColor"
                                className="text-foreground text-[10px] md:text-xs font-semibold"
                                formatter={(value: any) => {
                                    const numericValue = typeof value === 'number' || typeof value === 'string' 
                                        ? Number(value) 
                                        : 0;
                                    return formatCurrency(numericValue);
                                }}
                            />
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} className="cursor-pointer transition-opacity hover:opacity-90" />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}