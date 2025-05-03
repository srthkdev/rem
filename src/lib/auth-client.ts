import { SignInInput, SignUpInput } from "./validator";

export type AuthResult = {
  success: boolean;
  error?: string;
};

export type User = {
  id: string;
  email: string;
  name?: string;
  image?: string | null;
  emailVerified?: Date | null;
};

export type Session = {
  user: User | null;
};

class AuthClient {
  async signInWithEmail(data: SignInInput): Promise<AuthResult> {
    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) return { success: false, error: result.error };
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to sign in",
      };
    }
  }

  async signUpWithEmail(data: SignUpInput): Promise<AuthResult> {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) return { success: false, error: result.error };
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create account",
      };
    }
  }

  async signInWithGoogle(): Promise<AuthResult> {
    try {
      if (typeof window !== "undefined") {
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        if (!clientId) {
          return {
            success: false,
            error:
              "Google client ID is not configured. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID in .env file.",
          };
        }
        const redirectUri =
          process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI ||
          `${window.location.origin}/api/auth/oauth/google/callback`;
        const scope = encodeURIComponent("profile email");
        const responseType = "code";
        const accessType = "offline";
        const prompt = "select_account";
        const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
          redirectUri,
        )}&response_type=${responseType}&scope=${scope}&access_type=${accessType}&prompt=${prompt}`;
        window.location.href = googleAuthUrl;
        return new Promise<AuthResult>(() => {});
      } else {
        return { success: false, error: "Cannot access browser window" };
      }
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to sign in with Google",
      };
    }
  }

  async signOut(): Promise<AuthResult> {
    try {
      const res = await fetch("/api/auth/signout", { method: "POST" });
      if (!res.ok) return { success: false, error: "Failed to sign out" };
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to sign out",
      };
    }
  }

  async getSession(): Promise<Session> {
    try {
      const res = await fetch("/api/auth/session");
      if (!res.ok) return { user: null };
      const data = await res.json();
      return { user: data.user };
    } catch {
      return { user: null };
    }
  }
}

export const authClient = new AuthClient();
export const signInWithEmail = (data: SignInInput) =>
  authClient.signInWithEmail(data);
export const signUpWithEmail = (data: SignUpInput) =>
  authClient.signUpWithEmail(data);
export const signInWithGoogle = () => authClient.signInWithGoogle();
export const signOut = () => authClient.signOut();
export type { SignInInput, SignUpInput } from "./validator";
