import ResetPasswordClient from "./ResetPasswordClient";

export default async function ResetPassword({
    searchParams,
}: {
    searchParams: Promise<{token?: string }>
}){
    const { token } = await searchParams;
    return(
        <ResetPasswordClient token={token}/>
    );
}
 