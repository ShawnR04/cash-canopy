'use client'

import { useState } from "react";
import { categoryIconMap, categoryStyleMap, categoryStyleMap2 } from "@/lib/categoryIcons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HiX } from "react-icons/hi";
import { toast } from "sonner";
import type { SelectCategory } from "@/db/schema";
import { updateBudget, deleteBudget} from "@/app/actions/budgets";

type CategoryWithTransactions = SelectCategory & {
    spentAmount: number;
};

export default function BudgetsCard({category}: {category: CategoryWithTransactions}){
    const Icon =
      categoryIconMap[category.icon as keyof typeof categoryIconMap] ??
      categoryIconMap.Other;
    const specificStyle =
      categoryStyleMap[category.icon as keyof typeof categoryStyleMap] ||
      categoryStyleMap.Other;
    const specificStyle2 =
      categoryStyleMap2[category.icon as keyof typeof categoryStyleMap2] ||
      categoryStyleMap2.Other;

    const spent = category.spentAmount;
    const available = category.monthly_budget ?? 0;
    const remaining = available - spent;

    const progress = available > 0 ? Math.min((spent / available) * 100, 100) : 0;

    const [isUpdateOpen, setIsUpdateOpen] = useState(false);

    const handleUpdate = async (formData:FormData) => {
      const newAmount = formData.get("amount");
      const newName = formData.get("name")?.toString() || "";
      console.log("Updating category to name:", newName, "and amount:", newAmount);

      const toastId = toast.loading("Updating category...");
      const res = await updateBudget(category.id, Number(newAmount), newName);
      if (res?.success) {
        toast.success("Category updated!", { id: toastId });
        setIsUpdateOpen(false);
      } else {
        toast.error("Failed to update category.", { id: toastId });
      }
    };

    const [isDeleting, setIsDeleting] = useState<number | null>(null);
    const handleDelete = async (id: number) => {
      setIsDeleting(id);
      const toastId = toast.loading("Deleting category...");
      const res = await deleteBudget(id);
      if (res.success) {
        toast.success("Category deleted!", { id: toastId });
      } else {
        toast.error("Failed to delete category.", { id: toastId });
      }
      setIsDeleting(null);
    };

    const INPUTBOXES = [
        { id: "name", text: "Goal Name", type: "text",placeholder:"", defaultValue: category.name,required: false },
        {
          id: "amount",
          text: "Change Amount ($)",
          type: "number",
          step: "0.01",
          min: "0.01",
          placeholder:"",
          defaultValue: category.monthly_budget ?? "",
          required: false,
        },
    ];
    return(
        <>
            <div onClick={() => setIsUpdateOpen(true)} className="bg-card p-3 md:p-5 gap-3 flex flex-col rounded-xl shadow-sm border-border transition-all cursor-pointer active:scale-[0.98] relative">
                <div className="flex gap-2 justify-between">
                    <div className="flex gap-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-primary-foreground text-xl ${specificStyle}`}>
                          <Icon/>
                        </div>
                        <div className="">
                            <h1 className="text-lg font-bold text-muted-foreground capitalize">
                                {category.name}
                            </h1>
                            <p className="text-[13px] text-muted-foreground">
                                Amount: ${available.toFixed(2)}
                            </p>
                        </div>
                    </div>
                    <div className="">
                      <h1 className={`flex justify-center w-30 ${specificStyle2} font-bold`}>
                        {category.icon}
                      </h1>
                    </div>
                </div>
                <div className="">
                    <h1 className="">
                        Spent: ${spent.toFixed(2)}
                    </h1>
                    <h1 className="">
                        Remaining: ${remaining.toFixed(2)}
                    </h1>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex gap-2 justify-between">
                    <p className="text-[13px] text-muted-foreground">
                      {progress.toFixed(0)}% spent
                    </p>
                    <p className="text-[13px] text-muted-foreground">
                      ${remaining.toFixed(2)} left
                    </p>
                </div>
            </div>

            {isUpdateOpen && (
                <div className="h-full w-full flex justify-center items-center absolute top-0 left-0 z-60 bg-black/60 backdrop-blur-xs">
                    <form action={handleUpdate}
                        className="w-85 md:w-110 flex flex-col dark:bg-card bg-primary-foreground rounded-xl p-3 gap-5"
                    >
                        <div className="h-10 flex items-center justify-between">
                          <h1 className="text-primary text-xl font-bold">
                              Update Category: {category.name}
                          </h1>
                          <Button
                              className="hover:text-destructive bg-transparent text-foreground"
                              onClick={() => setIsUpdateOpen(false)}
                          >
                              <HiX/>
                          </Button>
                        </div>
                        {INPUTBOXES.map((input) => (
                          <div key={input.id} className="flex flex-col gap-2">
                            <Label className="text-muted-foreground">
                              {input.text}
                            </Label>
                            <Input
                              id={input.id}
                              type={input.type}
                              name={input.id}
                              step={input.step}
                              min={input.min}
                              className="h-10"
                              defaultValue={input.defaultValue}
                              placeholder={input.placeholder}
                              required={input.required}
                              autoFocus
                            />
                          </div>
                        ))}
                        <div className="">
                            <Button type="button" className="h-10 w-30 text-lg text-white font-bold cursor-pointer hover:bg-destructive/90 transition-all duration-300 bg-destructive"
                                onClick={() => handleDelete(category.id)} disabled={isDeleting === category.id}
                            >
                                Delete Goal
                            </Button>
                        </div>
                        <div className="flex gap-3">
                            <Button type="button" variant="outline" className="flex-1 h-10 text-lg font-bold cursor-pointer" onClick={() => setIsUpdateOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" className="flex-1 h-10 text-lg font-bold cursor-pointer hover:bg-primary/90 transition-all duration-300 bg-primary">
                                Change
                            </Button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
}
