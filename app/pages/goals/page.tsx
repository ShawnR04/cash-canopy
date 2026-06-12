import GoalsClient from "./GoalsClient";
import { getUserGoals } from "@/lib/getUserData"

export default async function Goals(){
    const goals = await getUserGoals();
    return(
        <>
            <GoalsClient goals={goals}/>
        </>
    );
}