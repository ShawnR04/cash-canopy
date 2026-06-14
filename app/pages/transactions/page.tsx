import TransactionsClient from "./TransactionsClient";
import { getUserBudgets } from "@/lib/getUserData";

export default async function Transactions(){
    const categories = await getUserBudgets();

    return(
        <>
            <TransactionsClient categories={categories}/>
        </>
    );
}
