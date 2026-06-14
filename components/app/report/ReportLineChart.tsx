"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import colors from "tailwindcss/colors";

interface TransactionItem {
  id: string;
  day: string;
  description: string;
  type: "income" | "expense";
  amount: number;
}

interface MonthlyGraphItem {
  month: string;
  totalIncome: number;
  totalExpense: number;
  transactions: TransactionItem[];
}

interface GraphProps {
  data: MonthlyGraphItem[];
}

// Safely typing the implicit Recharts Tooltip primitive payload values
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: MonthlyGraphItem;
  }>;
}

const MultiTransactionTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const monthlyItem = payload[0].payload;

    if (monthlyItem.transactions.length === 0) {
      return (
        <div className="bg-card p-3 rounded-xl border border-border shadow-xl text-center text-xs text-muted-foreground">
          No transactions in {monthlyItem.month}
        </div>
      );
    }

    return (
      <div className="bg-card p-4 rounded-xl shadow-xl border border-border min-w-[200px] max-w-[280px]">
        <div className="mb-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Breakdown for
          </p>
          <h4 className="font-extrabold text-base text-primary">
            {monthlyItem.month}
          </h4>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
          {monthlyItem.transactions.map((tx) => {
            const isIncome = tx.type === "income";
            return (
              <div key={tx.id} className="flex items-center justify-between gap-4 text-xs py-1 border-b border-border/40 last:border-0">
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-foreground capitalize truncate">
                    {tx.description}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Day {tx.day}
                  </span>
                </div>
                {/* Fixed color token using Tailwind fallback configuration strings */}
                <span 
                  className={`font-bold text-sm shrink-0 ${
                    isIncome ? "text-emerald-500" : "text-destructive"
                  }`}
                >
                  {isIncome ? "+" : "-"}${tx.amount.toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
};

export default function ReportLineChart({ data }: GraphProps) {
  return (
    <div className="bg-card p-5 rounded-xl shadow-sm hover:shadow-md transition-all border border-border">
      <div>
        <h1 className="text-primary py-2 text-lg font-bold">
          Monthly Overview
        </h1>
      </div>

      <div className="h-10 flex items-center justify-center gap-4 text-xs font-medium text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: colors.emerald[500] }}
          />
          <span>Total Income</span>
        </div>
        <div className="flex items-center gap-1.5">
          {/* Linked dot legend token cleanly into Tailwind class syntax */}
          <span className="w-3 h-3 rounded-full bg-destructive" />
          <span>Total Expenses</span>
        </div>
      </div>

      <div className="h-[350px] w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid
              vertical={false}
              stroke="currentColor"
              className="text-muted border-dashed"
              opacity={0.15}
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              className="text-xs text-muted-foreground font-medium"
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              className="text-xs text-muted-foreground font-medium"
              tickFormatter={(val) => `$${val}`}
              dx={-5}
            />
            <Tooltip content={<MultiTransactionTooltip />} />
            <Line
              dataKey="totalIncome"
              stroke={colors.emerald[500]}
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 1, fill: colors.emerald[500] }}
              activeDot={{ r: 6 }}
              type="monotone"
            />
            <Line
              dataKey="totalExpense"
              /* Swapped key inline style values into native Tailwind CSS theme utility mappings */
              stroke="rgb(239, 68, 68)" 
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 1, fill: "rgb(239, 68, 68)" }}
              activeDot={{ r: 6 }}
              type="monotone"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}