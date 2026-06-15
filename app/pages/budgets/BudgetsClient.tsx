'use client'

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { HiX } from "react-icons/hi";
//
import { toast } from "sonner";
import { createBudget } from "@/app/actions/budgets"
import BudgetsCard from "@/components/app/budgets/BudgetsCard"
import TotalBudget from "@/components/app/budgets/TotalBudget"
//
import type { SelectCategory } from "@/db/schema";


type CategoryWithTransactions = SelectCategory & {
    spentAmount: number;
};

interface BudgetClientProps{
    budgets: CategoryWithTransactions[];
    totalIncome: number;
    totalExpense: number;
}

export default function BudgetsClient({budgets, totalIncome, totalExpense}:BudgetClientProps){
    const [isOpen, setIsOpen] = useState(false);

    const INPUTBOXES = [
        {
            id: "name",
            text: "Category Name",
            type: "text",
            required: true,
        },
        {
            id: "monthly_budget",
            text: "Monthly Budget ($)",
            type: "number",
            step: "0.01",
            min: "0.01",
            required: true,
        }
    ];

    const handleAction = async (formData: FormData) => {
        const categoryName = formData.get('name') || "Category"

        const toastId = toast.loading(`Adding ${categoryName}...`)

        const res = await createBudget(formData);

        if(res.success){
            setIsOpen(false)
            toast.success(`${categoryName} added successfully`,{ id: toastId });
        }else{
            toast.error(`Failed to add ${categoryName}.`, { id: toastId });
        };
    };

    {/* 1. Filter out the income entries first */}
    const filteredBudgets = budgets?.filter(
        (budget) => 
            budget.name?.toLowerCase() !== "income"
    ) || [];

    {/* 1. Locate the single budget item where the name or type matches "income" */}
    const incomeCategory = budgets?.find(
        (b) => b.name?.toLowerCase() === "income"
    );

    {/* 2. Create a fallback safe object structure in case no database entry exists yet */}
    const defaultIncomeCategory = {
        id: 0,
        userId: "",
        name: "Income",
        monthly_budget: 0,
        icon: "Coins", // Matches a default value in your categoryIconMap
        spentAmount: 0,
        totalIncomeAmount: totalIncome,
        totalExpenseAmount: totalExpense
    };

    {/* 3. Combine the database object values with the incoming totals */}
    const categoryPayload = incomeCategory 
        ? { ...incomeCategory, totalIncomeAmount: totalIncome, totalExpenseAmount: totalExpense }
        : defaultIncomeCategory;
    return(
        <>
            <div className="h-full overflow-y-auto no-scrollbar p-4">
                <div className="sticky top-0 flex h-15 w-full items-center justify-between p-2">
                    <h1 className="text-primary text-2xl font-bold md:text-3xl">
                        Budgets
                    </h1>
                    <Button
                        type="button"
                        onClick={() => setIsOpen(true)}
                        className="flex h-10 items-center gap-2 font-semibold"
                    >
                        <span className="text-2xl font-bold">+</span> Add Budget
                    </Button>
                </div>

                <div className="mb-6">
                    <TotalBudget totalIncomeAmount={totalIncome} totalExpenseAmount={totalExpense} category={categoryPayload} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 flex-1 gap-4 overflow-y-auto no-scrollbar content-start">
                    {/* 2. Render based on the filtered list */}
                    {filteredBudgets.length > 0 ? (
                        filteredBudgets.map((budget) => (
                            <BudgetsCard key={budget.id} category={budget} />
                        ))
                    ) : (
                        <div className="h-30 flex items-center justify-center col-span-3 text-center text-muted-foreground">
                            <p className="bg-card h-2/3 w-1/2 flex items-center justify-center rounded-xl shadow-sm transition-all">
                                No expense budgets found.
                            </p>
                        </div>
                    )}
                </div>

                {isOpen && (
                    <div 
                        className="w-full h-full absolute top-0 left-0 bg-card/50 backdrop-blur-[2px] flex items-center justify-center md:pl-60"
                    >
                        <form 
                            action={handleAction} 
                            className="bg-card w-90 md:w-110 p-3 gap-5 flex flex-col rounded-md"
                        >
                            <div className="h-10 flex items-center justify-between">
                                <h1 className="text-primary text-2xl font-bold">
                                    Add Budget
                                </h1>
                                <button 
                                    className="cursor-pointer"
                                    type="button"
                                    onClick={() => setIsOpen(!isOpen)}
                                    aria-label="Close Modal"
                                >
                                    <HiX className="w-6 h-6"/>
                                </button>
                            </div>

                            {INPUTBOXES.map((input) => (
                                <div key={input.id} className="flex flex-col gap-2">
                                    <Label className="text-muted-foreground text-lg">
                                        {input.text}
                                    </Label>
                                    <Input
                                        id={input.id}
                                        type={input.type}
                                        name={input.id}
                                        step={input.step}
                                        min={input.min}
                                        required={input.required}
                                        className="h-10 transition-all duration-300"
                                    />
                                </div>
                            ))}

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="icon" className="text-muted-foreground text-base">
                                  Icon
                                </Label>
                                <select name="icon" id="icon" title="icon"
                                    defaultValue=""
                                    required
                                    className="h-10 w-full min-w-0 rounded-lg border border-input bg-border/30 px-2.5 py-1 text-base text-muted-foreground transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                                >
                                    <option className="bg-background text-muted-foreground" value="" disabled>Select Category Icon</option>
                                    <option className="bg-background text-foreground" value="Savings">Savings</option>
                                    <option className="bg-background text-foreground" value="Food">Food</option>
                                    <option className="bg-background text-foreground" value="Shopping">Shopping</option>
                                    <option className="bg-background text-foreground" value="Health">Health</option>
                                    <option className="bg-background text-foreground" value="Entertainment">Entertainment</option>
                                    <option className="bg-background text-foreground" value="Education">Education</option>
                                    <option className="bg-background text-foreground" value="Other">Other</option>
                                </select>
                            </div>

                            <div className="flex justify-center items-center">
                                <button 
                                    type="submit" 
                                    className="bg-primary w-1/2 p-2 text-lg font-bold hover:bg-primary/80 transition-all duration-300 rounded-md"
                                >
                                    Save Budget
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </>
    );
}
