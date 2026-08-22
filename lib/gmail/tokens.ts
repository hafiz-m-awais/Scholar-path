interface TokenResult {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export async function refreshAccessToken(
  refreshToken: string
): Promise<TokenResult> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token refresh failed: ${err}`);
  }
  return res.json() as Promise<TokenResult>;
}

export function isTokenExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return true;
  // Refresh 5 minutes before actual expiry
  return new Date(expiresAt).getTime() < Date.now() + 5 * 60 * 1000;
}
