import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
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

  const url = request.nextUrl.clone();
  const publicRoutes = ["/"];

  // 1) If no user → block access to protected routes
  if (
    !user &&
    !request.nextUrl.pathname.startsWith("/auth") &&
    !request.nextUrl.pathname.startsWith("/api/auth/callback") &&
    !request.nextUrl.pathname.startsWith("/api/") &&
    !request.nextUrl.pathname.startsWith("/error") &&
    !publicRoutes.includes(request.nextUrl.pathname)
  ) {
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // 2) If user is logged in → block access to /auth/*
  if (user && request.nextUrl.pathname.startsWith("/auth")) {
    url.pathname = "/"; // or dashboard, or wherever you want logged-in users to land
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
