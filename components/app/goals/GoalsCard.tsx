'use client'

import { useState } from "react";  
import { SelectGoal } from "@/db/schema"

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

    return(
        <>
            <div className="bg-card flex flex-col p-3 md:p-4 gap-3 shadow-sm border-border transition-all cursor-pointer relative active:scale-[0.98] rounded-md">
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
        </>
    );
}