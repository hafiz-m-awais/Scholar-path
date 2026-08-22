import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  // Guard: if Supabase env vars are not configured, pass through without crashing
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            supabaseResponse = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { pathname } = request.nextUrl;

    // Public routes that don't require auth
    const publicRoutes = ["/login", "/register"];
    const isPublicRoute = publicRoutes.some((route) =>
      pathname.startsWith(route)
    );
    const isApiRoute = pathname.startsWith("/api/");

    if (!user && !isPublicRoute && !isApiRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      const redirectResponse = NextResponse.redirect(url);
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value);
      });
      return redirectResponse;
    }

    if (user && pathname === "/login") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      const redirectResponse = NextResponse.redirect(url);
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value);
      });
      return redirectResponse;
    }

    if (pathname === "/") {
      const url = request.nextUrl.clone();
      url.pathname = user ? "/dashboard" : "/login";
      const redirectResponse = NextResponse.redirect(url);
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value);
      });
      return redirectResponse;
    }
  } catch (error) {
    // If Supabase throws an error (e.g. invalid URL, fetch failed), catch it
    // and fail gracefully so the middleware doesn't crash the entire app.
    console.error("Middleware Supabase Error:", error);
    // You could redirect to a friendly error page here, but for now we'll just pass through
  }

  return supabaseResponse;
}
