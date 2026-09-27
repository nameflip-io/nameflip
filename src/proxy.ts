// NOTE: two deviations from the original spec, both required by this repo's
// Next.js 16 + `@supabase/auth-helpers-nextjs` versions (per AGENTS.md, this
// isn't the Next.js from training data):
// 1. Next.js 16 deprecated `middleware.ts` in favor of `proxy.ts` (same
//    behavior, renamed file + export). See node_modules/next/dist/docs/
//    01-app/03-api-reference/03-file-conventions/proxy.md.
// 2. The installed `@supabase/auth-helpers-nextjs` (0.15.0) no longer exports
//    `createMiddlewareClient` — it's been consolidated into `@supabase/ssr`
//    style `createServerClient` with getAll/setAll cookie adapters.
import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  if (!data.user && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (data.user && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
