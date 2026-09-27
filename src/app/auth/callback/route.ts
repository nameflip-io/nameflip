// NOTE: the spec calls for `createRouteHandlerClient` from
// `@supabase/auth-helpers-nextjs`, but the installed version of that package
// (0.15.0) has been gutted in favor of `@supabase/ssr` — it no longer exports
// `createRouteHandlerClient` or `createMiddlewareClient` at all, only the
// modern `createServerClient`/`createBrowserClient` (getAll/setAll cookie
// adapters). Using the modern API here since the spec's literal import would
// fail to compile against what's actually installed.
import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${origin}/dashboard`);
}
