import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Get code from query params
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    
    if (!code) {
      return NextResponse.redirect(new URL("/auth/sign-in?error=missing_code", request.url));
    }

    // Exchange authorization code for tokens
    const tokenEndpoint = "https://oauth2.googleapis.com/token";
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || `${new URL(request.url).origin}/api/auth/oauth/google/callback`;
    
    const tokenResponse = await fetch(tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: clientId as string,
        client_secret: clientSecret as string,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();
    
    if (!tokenResponse.ok) {
      console.error("Token exchange error:", tokenData);
      return NextResponse.redirect(new URL("/auth/sign-in?error=token_exchange", request.url));
    }

    // Get user profile with access token
    const userInfoEndpoint = "https://www.googleapis.com/oauth2/v2/userinfo";
    const userResponse = await fetch(userInfoEndpoint, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const userData = await userResponse.json();
    
    if (!userResponse.ok) {
      console.error("Failed to get user profile:", userData);
      return NextResponse.redirect(new URL("/auth/sign-in?error=user_profile", request.url));
    }

    // Get a high-quality profile image
    let profileImage = userData.picture;
    if (profileImage) {
      // Remove any size limitations in the URL to get the highest quality
      profileImage = profileImage.replace(/=s\d+-c/, "=s400-c");
    }

    // Create or update user session in your system
    const user = {
      id: `google-${userData.id}`,
      email: userData.email,
      name: userData.name,
      image: profileImage,
      isAuthenticated: true,
    };

    // Create a session cookie
    const cookieExpiresIn = 60 * 60 * 24 * 7; // 7 days
    const cookieValue = JSON.stringify(user);

    // Log the user data for debugging
    console.log("Google auth successful:", {
      id: user.id,
      email: user.email,
      name: user.name,
      image: !!user.image, // Just log if image exists, not the full URL
    });

    // Create an HTML page that will set localStorage and then redirect
    const htmlResponse = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Authentication Success</title>
          <script>
            // Store user data in localStorage
            localStorage.setItem("user-session", ${JSON.stringify(cookieValue)});
            // Update auth store if possible
            if (window.authStore && window.authStore.setUser) {
              window.authStore.setUser(${JSON.stringify(user)});
            }
            // Redirect to project/new instead of dashboard
            window.location.href = "/project/new";
          </script>
        </head>
        <body>
          <h1 style="font-family: system-ui, sans-serif; text-align: center; margin-top: 40px;">Authentication successful</h1>
          <p style="font-family: system-ui, sans-serif; text-align: center;">Redirecting to your project page...</p>
          <div style="display: flex; justify-content: center; margin-top: 20px;">
            <div style="width: 40px; height: 40px; border: 4px solid rgba(0, 0, 0, 0.1); border-radius: 50%; border-top: 4px solid #C96442; animation: spin 1s linear infinite;"></div>
          </div>
          <style>
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          </style>
        </body>
      </html>
    `;

    // Return HTML response with the script
    return new NextResponse(htmlResponse, {
      status: 200,
      headers: {
        "Content-Type": "text/html",
        // Also set the cookie as a backup
        "Set-Cookie": `user-session=${encodeURIComponent(cookieValue)}; Max-Age=${cookieExpiresIn}; Path=/; SameSite=Lax`,
      },
    });
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    return NextResponse.redirect(new URL("/auth/sign-in?error=unknown", request.url));
  }
} 