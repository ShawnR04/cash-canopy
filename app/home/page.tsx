import HomeClient from "./HomeClient";
import { getUserProfile } from "@/lib/getUserProfile"

export default async function Home(){
    const {username,email} = await getUserProfile();
    console.log(username,email);
    return(
        <>
            <HomeClient
                username={username}
                email={email}
            />
        </>
    );
}