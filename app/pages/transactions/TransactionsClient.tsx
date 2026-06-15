'use client'

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { HiX } from "react-icons/hi";
//
import { toast } from "sonner";
import { createTransaction } from "@/app/actions/transactions";
import type { SelectCategory } from "@/db/schema";
import TransactionsTable, { TransactionWithCategory } from "@/components/app/transactions/TransactionsTable";

interface TransactionsClientProps {
    categories: SelectCategory[];
    transactions: TransactionWithCategory[];
}

export default function TransactionsClient({ categories, transactions}: TransactionsClientProps){
    const [isOpen, setIsOpen] = useState(true);

    // Initialize with today's local date (avoiding UTC offset issues)
    const [transactionDate, setTransactionDate] = useState(() => {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    });

    const handleAction = async (formData: FormData) => {
      const result = await createTransaction(formData);

      console.log(result);

      if (result.success) {
        toast.success("Transaction added successfully");
        setIsOpen(true);
      } else {
        toast.error(result.details ? `${result.error} ${result.details}` : result.error);
      }
    };
    return(
        <>
            <div className="h-full overflow-y-auto no-scrollbar p-4">
                <div className="sticky top-0 flex h-15 w-full items-center justify-between p-2">
                    <h1 className="text-primary text-2xl font-bold md:text-3xl">
                        Transactions
                    </h1>
                    <Button
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex h-10 items-center gap-2 font-semibold"
                    >
                        <span className="text-2xl font-bold">+</span> Add Transaction
                    </Button>
                </div>

                <div className="">
                    <TransactionsTable 
                        transactions={transactions}
                        category={categories}
                        itemsPerPage={10}
                    />
                </div>

                {!isOpen && (
                    <div 
                        className="w-full h-full absolute top-0 left-0 bg-card/50 backdrop-blur-[2px] flex items-center justify-center md:pl-60"
                    >
                        <form 
                            action={handleAction}
                            className="bg-card w-90 md:w-110 p-3 gap-5 flex flex-col rounded-md"
                        >
                            <div className="h-10 flex items-center justify-between">
                                <h1 className="text-primary text-2xl font-bold">
                                    Add Transaction
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

                            <div className="flex flex-col gap-2">
                                <Label className="text-muted-foreground text-lg">
                                    Type
                                </Label>
                                <select 
                                    name="type" 
                                    id="type" 
                                    title="type"
                                    defaultValue=""
                                    required
                                    className="h-10 w-full min-w-0 rounded-lg border border-input bg-border/30 px-2.5 py-1 text-base text-muted-foreground transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                                >
                                    {/* Explicitly style the options for light/dark themes */}
                                    <option value="" className="bg-background text-muted-foreground">Select Type</option>
                                    <option value="income" className="bg-background text-foreground">Income</option>
                                    <option value="expense" className="bg-background text-foreground">Expense</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label className="text-muted-foreground text-lg">
                                    Amount ($)
                                </Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    name="amount"
                                    min="1"
                                    step="1"
                                    required
                                    className="h-10 transition-all duration-300"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label className="text-muted-foreground text-lg">
                                    Description
                                </Label>
                                <Input
                                    id="description"
                                    type="text"
                                    name="description"
                                    required
                                    className="h-10 transition-all duration-300"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label className="text-muted-foreground text-lg">
                                    Category
                                </Label>
                                <select 
                                    name="categoryId"
                                    id="categoryId"
                                    title="category"
                                    defaultValue=""
                                    required
                                    className="h-10 w-full min-w-0 rounded-lg border border-input bg-border/30 px-2.5 py-1 text-base text-muted-foreground transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                                >
                                    {/* Explicitly style the options for light/dark themes */}
                                    <option value="" disabled className="bg-background text-muted-foreground">Select Category</option>
                                    {categories.map((category) => (
                                        <option
                                            key={category.id}
                                            value={category.id}
                                            className="bg-background text-foreground capitalize"
                                        >
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label className="text-muted-foreground text-lg">
                                    Date
                                </Label>
                                <Input
                                    id="date"
                                    type="date"
                                    name="date"
                                    className="h-10 transition-all duration-300"
                                    value={transactionDate}
                                    onChange={(e) => setTransactionDate(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="flex justify-center items-center">
                                <button 
                                    type="submit" 
                                    className="bg-primary w-1/2 p-2 text-lg font-bold hover:bg-primary/80 transition-all duration-300 rounded-md"
                                >
                                    Save Transaction
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </>
    );
}
