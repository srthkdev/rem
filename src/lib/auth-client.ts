import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({})

export const signInWithEmail = async (email: string, password: string) => {
    try {
        const result = await authClient.signIn.email({
            email,
            password,
        });
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error };
    }
}

export const signUpWithEmail = async (email: string, password: string, name: string = email.split('@')[0]) => {
    try {
        const result = await authClient.signUp.email({
            email,
            password,
            name
        });
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error };
    }
}

export const signInWithGoogle = async () => {
    return await authClient.signIn.social({
        provider: "google"
    })
}

export const signInWithGoogleIdToken = async (idToken: string, accessToken?: string) => {
    return await authClient.signIn.social({
        provider: "google",
        idToken: {
            token: idToken,
            accessToken: accessToken
        }
    })
}

export const signOut = async () => {
    return await authClient.signOut();
}
