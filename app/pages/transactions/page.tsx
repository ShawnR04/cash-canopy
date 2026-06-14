import TransactionsClient from "./TransactionsClient";
import { getUserBudgets,getAuthUserId } from "@/lib/getUserData";
import { getTransactions } from "@/lib/getTransactions"

export default async function Transactions(){
    const categories = await getUserBudgets();
    const transactions = await getTransactions();

    const userId = await getAuthUserId();

    if(!userId){
        return(
            <div className=" h-30 flex items-center justify-center col-span-3 text-center text-muted-foreground">
                <p className="bg-card h-2/3 w-1/2 flex items-center justify-center rounded-xl shadow-sm transition-all">
                    Please log in to view your transaction history.
                </p>
            </div>
        );
    }

    return(
        <>
            <TransactionsClient categories={categories} transactions={transactions}/>
        </>
    );
}
