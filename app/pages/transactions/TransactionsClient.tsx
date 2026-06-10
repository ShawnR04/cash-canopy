'use client'

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function TransactionsClient(){
    return(
        <>
            <div className="h-full overflow-y-auto no-scrollbar">
                <div className="sticky top-0 flex h-15 w-full items-center justify-between p-2">
                    <h1 className="text-primary text-2xl font-bold md:text-3xl">
                        Transactions
                    </h1>
                    <Button
                        type="button"
                        className="flex h-10 items-center gap-2 font-semibold"
                    >
                        <span className="text-2xl font-bold">+</span> Add Transaction
                    </Button>
                </div>
            </div>
        </>
    );
}