import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database/db";
import { users, accounts, sessions } from "@/database/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    // Get code from query params
    const url = new URL(request.url);
    const code = url.searchParams.get("code");

    if (!code) {
      return NextResponse.redirect(
        new URL("/auth/sign-in?error=missing_code", request.url),
      );
    }

    // Exchange authorization code for tokens
    const tokenEndpoint = "https://oauth2.googleapis.com/token";
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri =
      process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI ||
      `${new URL(request.url).origin}/api/auth/oauth/google/callback`;

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
      return NextResponse.redirect(
        new URL("/auth/sign-in?error=token_exchange", request.url),
      );
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
      return NextResponse.redirect(
        new URL("/auth/sign-in?error=user_profile", request.url),
      );
    }

    // Get a high-quality profile image
    let profileImage = userData.picture;
    if (profileImage) {
      // Remove any size limitations in the URL to get the highest quality
      profileImage = profileImage.replace(/=s\d+-c/, "=s400-c");
    }

    // Upsert user
    const userId = `google-${userData.id}`;
    const now = new Date();
    const userRows = await db.select().from(users).where(eq(users.id, userId));
    if (userRows.length === 0) {
      await db.insert(users).values({
        id: userId,
        name: userData.name,
        email: userData.email,
        emailVerified: now,
        image: profileImage,
        createdAt: now,
        updatedAt: now,
      });
    } else {
      await db
        .update(users)
        .set({
          name: userData.name,
          email: userData.email,
          emailVerified: now,
          image: profileImage,
          updatedAt: now,
        })
        .where(eq(users.id, userId));
    }
    // Upsert account
    const accountRows = await db
      .select()
      .from(accounts)
      .where(eq(accounts.userId, userId));
    if (accountRows.length === 0) {
      await db.insert(accounts).values({
        id: `acc-${Date.now()}`,
        accountId: userData.id,
        providerId: "google",
        userId,
        createdAt: now,
        updatedAt: now,
      });
    } else {
      await db
        .update(accounts)
        .set({
          accountId: userData.id,
          providerId: "google",
          updatedAt: now,
        })
        .where(eq(accounts.userId, userId));
    }
    // Create session
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days
    await db.insert(sessions).values({
      id: `sess-${Date.now()}`,
      expiresAt,
      token: sessionToken,
      createdAt: now,
      updatedAt: now,
      userId,
    });
    // Set cookie and redirect
    const isProd = process.env.NODE_ENV === "production";
    const response = NextResponse.redirect(
      new URL("/project/new", request.url),
    );
    response.cookies.set("session-token", sessionToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });
    return response;
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    return NextResponse.redirect(
      new URL("/auth/sign-in?error=unknown", request.url),
    );
  }
}
