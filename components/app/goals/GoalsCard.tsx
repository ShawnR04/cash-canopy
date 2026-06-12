'use client'

import { useState } from "react";  
import { SelectGoal } from "@/db/schema"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HiX } from "react-icons/hi";
import { toast } from "sonner";
import { updateGoals, deleteGoals } from "@/app/actions/goals";

export default function GoalsCard({goal}: {goal: SelectGoal}){
    const progress = Math.min((goal.saved_amount / goal.target_amount) * 100 ,100)

    //Formatting the Data
    let dateObject = null;
    let daysLeftDisplay = "N/A";

    if (goal.target_date) {
        const rawDate = new Date(goal.target_date);

        if (!isNaN(rawDate.getTime())) {
            // Extract the EXACT calendar day stored in Turso, ignoring your local timezone
            const targetYear = rawDate.getUTCFullYear();
            const targetMonth = rawDate.getUTCMonth();
            const targetDate = rawDate.getUTCDate();

            // Create a local date object matching those exact calendar numbers
            dateObject = new Date(targetYear, targetMonth, targetDate);

            // Get today's local date (midnight)
            const today = new Date();
            const current = new Date(today.getFullYear(), today.getMonth(), today.getDate());

            // Calculate the difference cleanly
            const diffInMs = dateObject.getTime() - current.getTime();
            const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));

            if (diffInDays > 0) {
                daysLeftDisplay = `${diffInDays} days left`;
            } else if (diffInDays === 0) {
                daysLeftDisplay = "Today";
            } else {
                daysLeftDisplay = "Overdue";
            }
        }
    }

    const formattedDate = dateObject && !isNaN(dateObject.getTime())
        ? dateObject.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "N/A";

    const [isUpdateOpen, setIsUpdateOpen] = useState(false);

    const INPUTBOXES = [
        { id: "name", text: "Goal Name", type: "text",placeholder:"",defaultValue:goal.name, required: false },
        {
          id: "change_amount",
          text: "Change Amount ($)",
          type: "number",
          placeholder:"",
          defaultValue:goal.target_amount,
          required: false,
        },
        {
          id: "add_amount",
          text: "Amount to add ($)",
          type: "number",
          placeholder:"e.g. $50",
          required: false,
        },
    ];

    const handleUpdate = async (formData: FormData) => {
        const name = formData.get("name")?.toString();
        const change_amount = formData.get("change_amount")?.toString();
        const add_amount = formData.get("add_amount")?.toString();

        const toastId = toast.loading("Updating goal...")

        const res = await updateGoals(goal.id, Number(add_amount),Number(change_amount), name!);

        if (res?.success) {
            toast.success("Progress updated!", { id: toastId });
            setIsUpdateOpen(false);
        } else {
            toast.error("Failed to update.", { id: toastId });
        }
    }

    const [isDeleting, setIsDeleting] = useState<number | null>(null);
    const handleDelete = async (id: number) => {
      setIsDeleting(id);
      const toastId = toast.loading("Deleting goal...");
      const res = await deleteGoals(id);
      if (res.success) {
        toast.success("Goal deleted!", { id: toastId });
      } else {
        toast.error("Failed to delete goal.", { id: toastId });
      }
      setIsDeleting(null);
    }

    return(
        <>
            <div onClick={() => setIsUpdateOpen(true)} className="bg-card flex flex-col p-3 md:p-4 gap-3 shadow-sm border-border transition-all cursor-pointer relative active:scale-[0.98] rounded-md">
                <div className="flex gap-2">
                    <div className="w-1/2">
                        <h1 className="text-lg font-bold capitalize">
                            {goal.name}
                        </h1>
                        <p className="text-[12px] text-muted-foreground">
                            Target: ${goal.target_amount.toFixed(2)}
                        </p>
                    </div>
                    <h1 className={`w-1/2 text-lg font-medium flex items-center justify-end ${daysLeftDisplay === "Overdue" || daysLeftDisplay === "N/A"  ? "text-destructive" : `${daysLeftDisplay === "Today" ? "text-primary": "text-success"}`}`}>
                        {daysLeftDisplay}
                    </h1>
                </div>
                <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                    <div className="bg-primary h-full transition-all duration-300 ease-out" style={{width:`${progress}%`}}/>
                </div>
                <div className="flex gap-2">
                    <div className="w-1/2">
                        <h1 className="font-medium">
                            Saved: ${goal.saved_amount.toFixed(2)}
                        </h1>
                        <h1 className="text-[15px] text-muted-foreground">
                            ({progress.toFixed(0)}%)
                        </h1>
                    </div>
                    <h1 className="w-1/2 text-[15px] text-muted-foreground flex items-end justify-end">
                        {formattedDate}
                    </h1>
                </div>
            </div>

            {isUpdateOpen && (
                <div className="h-full w-full flex justify-center items-center absolute top-0 left-0 z-60 bg-black/60 backdrop-blur-xs">
                    <form action={handleUpdate}
                        className="w-85 md:w-110 flex flex-col dark:bg-card bg-primary-foreground rounded-xl p-3 gap-5"
                    >
                        <div className="h-10 flex justify-between items-center">
                            <h1 className="text-primary text-xl font-bold">
                              Update Progress : {goal?.name}
                            </h1>
                            <button
                              type="button"
                              aria-label="Close Modal"
                              onClick={() => setIsUpdateOpen(false)}
                              className=""
                            >
                              <HiX className="w-6 h-6" />
                            </button>
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
                                onClick={() => handleDelete(goal.id)} disabled={isDeleting === goal.id}
                            >
                                Delete Goal
                            </Button>
                        </div>
                        <div className="">
                            <p className="">
                                Current Savings: <span className="font-bold text-primary">${goal?.saved_amount}</span>
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button type="button" variant="outline" className="flex-1 h-10 text-lg font-bold cursor-pointer" onClick={() => setIsUpdateOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" className="flex-1 h-10 text-lg font-bold cursor-pointer hover:bg-primary/90 transition-all duration-300 bg-primary">
                                Add Amount
                            </Button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
}