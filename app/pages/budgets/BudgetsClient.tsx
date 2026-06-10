'use client'

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { HiX } from "react-icons/hi";

export default function BudgetsClient(){
    const [isOpen, setIsOpen] = useState(true);
    return(
        <>
            <div className="h-full overflow-y-auto no-scrollbar">
                <div className="sticky top-0 flex h-15 w-full items-center justify-between p-2">
                    <h1 className="text-primary text-2xl font-bold md:text-3xl">
                        Budgets
                    </h1>
                    <Button
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex h-10 items-center gap-2 font-semibold"
                    >
                        <span className="text-2xl font-bold">+</span> Add Budget
                    </Button>
                </div>

                {!isOpen && (
                    <div 
                        onClick={() => setIsOpen(!isOpen)}
                        className="w-full h-full absolute top-0 left-0 bg-card/50 backdrop-blur-[2px] flex items-center justify-center md:pl-60"
                    >
                        <form 
                            action="" 
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