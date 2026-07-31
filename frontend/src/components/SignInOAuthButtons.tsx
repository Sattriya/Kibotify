import { useSignIn } from "@clerk/react/legacy";
// import { useSignIn } from "@clerk/react";
import { Button } from "./ui/button";

const SignInOAuthButtons = () => {
    const { signIn, fetchStatus } = useSignIn();

    // if (fetchStatus !== "fetching") {
    //     return;
    // }

    const signInWithGoogle = async () => {
        // const { error } = await signIn.sso({
        //     strategy: "oauth_google",
        //     redirectUrl: "/auth-callback",
        //     redirectCallbackUrl: "/sso-callback",
        // });

        await signIn?.authenticateWithRedirect({
            strategy: "oauth_google",
            redirectUrl: "/sso-callback",
            redirectUrlComplete: "/auth-callback",
        });

        // if (error) {
        //     console.error(error);
        // }
    };

    return (
        <Button onClick={signInWithGoogle} variant={"secondary"} className='w-full text-white border-zinc-200 h-11'>
            <img src='/google.png' alt='Google' className='size-5' />
            Continue with Google
        </Button>
    );
};

export default SignInOAuthButtons;