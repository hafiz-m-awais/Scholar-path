import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { exchangeCodeForTokens } from "@/lib/gmail/oauth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(
      new URL("/settings/email?error=gmail_denied", request.url)
    );
  }

  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

    // Get email address via Google userinfo
    const infoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const info = await infoRes.json();
    const emailAddress = info.email ?? "unknown@gmail.com";

    // Upsert email account (store as plain text — encrypted version requires pgcrypto RPC)
    await supabase.from("email_accounts").upsert(
      {
        user_id: user.id,
        email_address: emailAddress,
        provider: "gmail",
        access_token_plain: tokens.access_token,
        refresh_token_plain: tokens.refresh_token,
        token_expires_at: expiresAt,
        scopes: tokens.scope ? tokens.scope.split(" ") : ["https://www.googleapis.com/auth/gmail.send"],
        is_connected: true,
        connected_at: new Date().toISOString(),
        last_used_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    return NextResponse.redirect(new URL("/settings/email?connected=true", request.url));
  } catch (e) {
    console.error("Gmail OAuth callback error:", e);
    return NextResponse.redirect(
      new URL("/settings/email?error=token_exchange", request.url)
    );
  }
}
