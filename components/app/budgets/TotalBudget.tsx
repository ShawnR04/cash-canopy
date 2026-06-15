'use client'

import React, { useState } from "react";
import { categoryIconMap, categoryStyleMap, categoryStyleMap2 } from "@/lib/categoryIcons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HiX } from "react-icons/hi";
import { toast } from "sonner";
import { updateBudget, createBudget } from "@/app/actions/budgets";
import type { SelectCategory } from "@/db/schema";

type CategoryWithTransactions = SelectCategory & {
    spentAmount: number;
    totalIncomeAmount: number;
    totalExpenseAmount: number;
};

interface TotalBudgetProps {
    category: CategoryWithTransactions;
    totalIncomeAmount: number;
    totalExpenseAmount: number;
}

export default function TotalBudget({ category, totalIncomeAmount, totalExpenseAmount }: TotalBudgetProps) {
    const [isUpdateOpen, setIsUpdateOpen] = useState(false);

    const baseIncome = category?.monthly_budget || 0;
    const effectiveTotalIncome = baseIncome + totalIncomeAmount;
    const remainingAmount = effectiveTotalIncome - totalExpenseAmount;

    // Formats the value into a clean currency layout (e.g., $4,250.00)
    const formattedAmount = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(remainingAmount);

    const progress = effectiveTotalIncome > 0 
        ? Math.min((totalExpenseAmount / effectiveTotalIncome) * 100, 100) 
        : 0;

    // FIXED: Safely read the dynamic string property, but fall back explicitly to your custom income keys 
    const iconKey = (category.icon in categoryIconMap) 
        ? category.icon 
        : ("Income" in categoryIconMap ? "Income" : "Coins");

    const Icon = categoryIconMap[iconKey as keyof typeof categoryIconMap] ?? categoryIconMap.Other;
    
    const specificStyle =
      categoryStyleMap[iconKey as keyof typeof categoryStyleMap] ||
      categoryStyleMap.Other;
      
    const specificStyle2 =
      categoryStyleMap2[iconKey as keyof typeof categoryStyleMap2] ||
      categoryStyleMap2.Other;

    const handleUpdate = async (formData: FormData) => {
        const newAmount = formData.get("monthly_budget");
        const toastId = toast.loading("Updating Base Income...");
        
        let res;
        if (category.id === 0) {
            // Needs to be created if it's the dummy fallback
            formData.append("name", "Income");
            formData.append("icon", "Income");
            res = await createBudget(formData);
        } else {
            res = await updateBudget(category.id, Number(newAmount), category.name || "Income");
        }

        if (res?.success) {
            toast.success("Income budget updated!", { id: toastId });
            setIsUpdateOpen(false);
        } else {
            toast.error("Failed to update income budget.", { id: toastId });
        }
    };

    return (
        <>
        <div onClick={() => setIsUpdateOpen(true)} className="bg-card p-4 md:p-5 gap-4 flex flex-col rounded-xl shadow-sm border border-border/50 transition-all cursor-pointer active:scale-[0.98] relative group hover:shadow-md">
            {/* Row 1: Header Meta (Icon, Label and Dynamic Spent Pill) */}
            <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-primary-foreground text-xl ${specificStyle}`}>
                        <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg font-semibold text-muted-foreground tracking-wider uppercase">
                            Remaining Budget
                        </span>
                    </div>
                </div>
                
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${progress >= 90 ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                    {progress.toFixed(0)}% Used
                </span>
            </div>

            {/* Row 2: Large Data Display */}
            <div className="flex flex-col gap-1">
                <h2 className={`text-3xl font-extrabold tracking-tight break-all transition-colors ${
                    remainingAmount < 0 ? "text-destructive" : "text-success"
                }`}>
                    {formattedAmount}
                </h2>
                <div className="flex justify-between items-center text-xs text-muted-foreground mt-1">
                    <p className="text-base font-medium flex gap-1">Total Income: 
                        <span className="text-success">${effectiveTotalIncome.toFixed(2)}</span>
                    </p>
                    <p className="text-base font-medium flex gap-1">Total Expenses: 
                        <span className="text-destructive">${totalExpenseAmount.toFixed(2)}</span>
                    </p>
                </div>
            </div>

            {/* Row 3: Progress Tracker */}
            <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden relative">
                <div 
                    className={`h-full rounded-full transition-all duration-500 ease-out ${specificStyle2 || 'bg-primary'}`}
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Row 4: Status Footer Context */}
            <div className="flex justify-between items-center text-xs text-muted-foreground pt-1 border-t border-border/40">
                <span>Safe to Spend</span>
                <span className={remainingAmount < 0 ? "text-destructive font-bold" : "text-emerald-500 font-medium"}>
                    {remainingAmount < 0 ? "Over Budget" : "On Track"}
                </span>
            </div>
        </div>
        
        {isUpdateOpen && (
            <div className="h-full w-full flex justify-center items-center fixed top-0 left-0 z-[60] bg-black/60 backdrop-blur-xs">
                <form action={handleUpdate}
                    className="w-85 md:w-110 flex flex-col dark:bg-card bg-primary-foreground rounded-xl p-4 gap-5 shadow-2xl"
                >
                    <div className="flex items-center justify-between pb-2 border-b border-border/10">
                      <h1 className="text-primary text-xl font-bold">
                          Update Base Income
                      </h1>
                      <Button
                          type="button"
                          className="hover:text-destructive bg-transparent text-foreground shadow-none"
                          onClick={(e) => { e.stopPropagation(); setIsUpdateOpen(false); }}
                      >
                          <HiX className="w-5 h-5"/>
                      </Button>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                        <Label className="text-muted-foreground">Base Amount ($)</Label>
                        <Input
                            id="monthly_budget"
                            name="monthly_budget"
                            type="number"
                            step="0.01"
                            min="0.01"
                            className="h-10"
                            defaultValue={category?.monthly_budget || ""}
                            placeholder="Enter base income amount"
                            required
                            autoFocus
                        />
                    </div>
                    
                    <div className="flex gap-3 mt-2">
                        <Button type="button" variant="outline" className="flex-1 h-10 text-lg font-bold cursor-pointer" onClick={(e) => { e.stopPropagation(); setIsUpdateOpen(false); }}>
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1 h-10 text-lg font-bold cursor-pointer hover:bg-primary/90 transition-all duration-300 bg-primary">
                            Save
                        </Button>
                    </div>
                </form>
            </div>
        )}
        </>
    );
}