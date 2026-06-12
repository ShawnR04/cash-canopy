'use client'

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { HiX } from "react-icons/hi";
//
import { toast } from "sonner";
import { createGoal } from "@/app/actions/goals";
import GoalsCard from "@/components/app/goals/GoalsCard";
//
import { SelectGoal } from "@/db/schema"

interface GoalsClientProps{
    goals: SelectGoal[];
}

export default function GoalsClient({goals}:GoalsClientProps){
    const [isOpen, setIsOpen] = useState(false);

    const INPUTBOXES = [
      { 
        id: "name", 
        text: "Goal Name", 
        type: "text", 
        required: false
      },
      {
        id: "target_amount",
        text: "Target Amount ($)",
        type: "number",
        required: true,
      },
      {
        id: "saved_amount",
        text: "Amount Saved ($)",
        type: "number",
        required: true,
      },
      { id: "target_date", text: "Target Date", type: "date", required: true },
    ];

    const handleAction = async (formData: FormData) => {
      const goalName = formData.get("name")?.toString() || "Goal";
      const toastId = toast.loading(`Adding ${goalName}...`);

      const res = await createGoal(formData);

      if (res?.success) {
        setIsOpen(false);
        toast.success(`${goalName} added successfully!`, { id: toastId });
      } else {
        toast.error(res?.error || `Failed to add ${goalName}.`, { id: toastId });
      }
    };

    return(
        <>
            <div className="h-full overflow-y-auto no-scrollbar p-4">
                <div className="sticky top-0 flex h-15 w-full items-center justify-between p-2 bg-background z-10">
                    <h1 className="text-primary text-2xl font-bold md:text-3xl">
                        Savings Goals
                    </h1>
                    <Button
                        type="button"
                        onClick={() => setIsOpen(true)}
                        className="flex h-10 items-center gap-2 font-semibold"
                    >
                        <span className="text-2xl font-bold">+</span> Add Goal
                    </Button>
                </div>

                {/* --- RENDER GOALS HERE --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 flex-1 gap-4 overflow-y-auto no-scrollbar content-start">
                    {goals && goals.length > 0 ? (
                        goals.map((goal) => (
                            <GoalsCard key={goal.id} goal={goal} />
                        ))
                    ) : (
                        <div className=" h-30 flex items-center justify-center col-span-3 text-center text-muted-foreground">
                            <p className="bg-card h-2/3 w-1/2 flex items-center justify-center rounded-xl shadow-sm transition-all">
                                No goals found.
                            </p>
                        </div>
                    )}
                </div>

                {isOpen && (
                    <div 
                        className="w-full h-full absolute top-0 left-0 bg-card/50 backdrop-blur-[2px] flex items-center justify-center md:pl-60 z-50"
                    >
                        <form 
                            action={handleAction}
                            className="bg-card w-90 md:w-110 p-3 gap-5 flex flex-col rounded-md shadow-lg"
                        >
                            <div className="h-10 flex items-center justify-between">
                                <h1 className="text-primary text-2xl font-bold">
                                    Add Goal
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
                                    <Label htmlFor={input.id} className="text-muted-foreground text-lg">
                                        {input.text}
                                    </Label>
                                    <Input
                                        id={input.id}
                                        type={input.type}
                                        name={input.id}
                                        required={input.required}
                                        className="h-10 transition-all duration-300"
                                    />
                                </div>
                            ))}

                            <div className="flex justify-center items-center">
                                <button 
                                    type="submit" 
                                    className="bg-primary text-primary-foreground w-1/2 p-2 text-lg font-bold hover:bg-primary/80 transition-all duration-300 rounded-md cursor-pointer"
                                >
                                    Save Goal
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </>
    );
}