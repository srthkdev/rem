import { SignInInput, SignUpInput } from "./validator";

type AuthResult = {
  success: boolean;
  error?: string;
};

type User = {
  id: string;
  email: string;
  name?: string;
  image?: string | null;
  emailVerified?: Date | null;
};

type Session = {
  user: User | null;
};

// For demo purposes, mock auth implementation - replace with your actual auth service
class AuthClient {
  private user: User | null = null;

  constructor() {
    // Check for existing session in localStorage
    this.loadSession();
  }

  private loadSession(): void {
    if (typeof window !== "undefined") {
      try {
        console.log("Auth client: Loading session from localStorage");
        const session = localStorage.getItem("user-session");
        
        if (session) {
          console.log("Auth client: Found session data");
          const data = JSON.parse(session);
          
          if (data && data.isAuthenticated) {
            console.log("Auth client: Valid authenticated session");
            this.user = {
              id: data.id || "user-1",
              email: data.email,
              name: data.name,
              image: data.image,
            };
            console.log("Auth client: User loaded:", this.user);
          } else {
            console.log("Auth client: Session exists but not authenticated");
            this.user = null;
          }
        } else {
          console.log("Auth client: No session found in localStorage");
          this.user = null;
        }
      } catch (error) {
        console.error("Auth client: Failed to parse session:", error);
        this.user = null;
      }
    }
  }

  private saveSession(user: User): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "user-session",
        JSON.stringify({
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          isAuthenticated: true,
        })
      );
      this.user = user;
    }
  }

  async signInWithEmail(data: SignInInput): Promise<AuthResult> {
    try {
      // In a real app, this would be an API call to your auth service
      // Simulate async operation
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Simple mock for demo
      const user: User = {
        id: "user-1",
        email: data.email,
        name: data.email.split("@")[0],
      };

      this.saveSession(user);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to sign in" 
      };
    }
  }

  async signUpWithEmail(data: SignUpInput): Promise<AuthResult> {
    try {
      // In a real app, this would be an API call to your auth service
      // Simulate async operation
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Simple mock for demo
      const user: User = {
        id: "user-" + Date.now(),
        email: data.email,
        name: data.username,
      };

      this.saveSession(user);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to create account" 
      };
    }
  }

  async signInWithGoogle(): Promise<AuthResult> {
    try {
      // Redirect to Google OAuth authentication URL
      if (typeof window !== "undefined") {
        // Ensure we have the client ID from environment
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        if (!clientId) {
          return { 
            success: false, 
            error: "Google client ID is not configured. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID in .env file." 
          };
        }

        // Set up Google OAuth parameters
        const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || `${window.location.origin}/api/auth/oauth/google/callback`;
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
        
        // Define the OAuth 2.0 parameters
        const scope = encodeURIComponent('profile email');
        const responseType = 'code';
        const accessType = 'offline';
        const prompt = 'select_account';
        
        // Construct the authorization URL
        const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${responseType}&scope=${scope}&access_type=${accessType}&prompt=${prompt}`;
        
        // Redirect to Google's OAuth page
        window.location.href = googleAuthUrl;
        
        // Since we're redirecting, the function will not return immediately
        // We return a pending promise that will be resolved after redirection and callback
        return new Promise<AuthResult>(() => {
          // This code will not run as we're redirecting
        });
      } else {
        return { 
          success: false, 
          error: "Cannot access browser window" 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to sign in with Google" 
      };
    }
  }

  async signOut(): Promise<AuthResult> {
    try {
      // In a real app, this would be an API call to your auth service
      // Simulate async operation
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (typeof window !== "undefined") {
        localStorage.removeItem("user-session");
      }
      this.user = null;
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to sign out" 
      };
    }
  }

  async getSession(): Promise<Session> {
    // In a real app, this would verify the session with your auth service
    // For demo, we'll just return the user from local storage
    this.loadSession();
    return { user: this.user };
  }
}

export const authClient = new AuthClient();

// Export authentication functions for ease of use
export const signInWithEmail = (data: SignInInput) => authClient.signInWithEmail(data);
export const signUpWithEmail = (data: SignUpInput) => authClient.signUpWithEmail(data);
export const signInWithGoogle = () => authClient.signInWithGoogle();
export const signOut = () => authClient.signOut();

// Re-export types
export type { AuthResult, User, Session };
export { type SignInInput, type SignUpInput } from "./validator";
