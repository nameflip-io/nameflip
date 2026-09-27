"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.81Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.92l-3.88-3c-1.08.72-2.46 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.1A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.27a7.2 7.2 0 0 1 0-4.54v-3.1H1.27a12 12 0 0 0 0 10.74l4-3.1Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.27 6.63l4 3.1C6.22 6.86 8.87 4.75 12 4.75Z"
      />
    </svg>
  );
}

type Tab = "login" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("login");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupError, setSignupError] = useState<string | null>(null);
  const [signupLoading, setSignupLoading] = useState(false);

  const [googleLoading, setGoogleLoading] = useState(false);

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setLoginError(null);
    setLoginLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });
    setLoginLoading(false);
    if (error) {
      setLoginError(error.message);
      return;
    }
    router.push("/dashboard");
  };

  const handleSignup = async (event: FormEvent) => {
    event.preventDefault();
    setSignupError(null);
    if (signupPassword.length < 8) {
      setSignupError("Password must be at least 8 characters.");
      return;
    }
    setSignupLoading(true);
    const { error } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
      options: { data: { name: signupName } },
    });
    setSignupLoading(false);
    if (error) {
      setSignupError(error.message);
      return;
    }
    router.push("/dashboard");
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setGoogleLoading(false);
      setLoginError(error.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-[440px]">
        <div className="flex justify-center">
          <Link href="/">
            <Logo />
          </Link>
        </div>

        <div className="mt-8 rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex rounded-lg border border-[#E2E8F0] bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => setTab("login")}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                tab === "login"
                  ? "bg-white text-foreground shadow-sm"
                  : "text-slate-500 hover:text-foreground"
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => setTab("signup")}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                tab === "signup"
                  ? "bg-white text-foreground shadow-sm"
                  : "text-slate-500 hover:text-foreground"
              }`}
            >
              Sign Up
            </button>
          </div>

          {tab === "login" ? (
            <form onSubmit={handleLogin} className="mt-6 flex flex-col gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-foreground">
                  Email
                </span>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(event) => setLoginEmail(event.target.value)}
                  placeholder="you@company.com"
                  className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    Password
                  </span>
                  <a
                    href="#"
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(event) => setLoginPassword(event.target.value)}
                  placeholder="••••••••"
                  className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </label>

              {loginError && (
                <p className="text-sm text-red-600">{loginError}</p>
              )}

              <Button type="submit" size="lg" className="w-full" disabled={loginLoading}>
                {loginLoading && <Loader2 className="size-4 animate-spin" />}
                Log In
              </Button>

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-[#E2E8F0]" />
                or
                <span className="h-px flex-1 bg-[#E2E8F0]" />
              </div>

              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full gap-2"
                onClick={handleGoogle}
                disabled={googleLoading}
              >
                {googleLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <GoogleIcon />
                )}
                Continue with Google
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => setTab("signup")}
                  className="font-semibold text-primary hover:underline"
                >
                  Sign up →
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="mt-6 flex flex-col gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-foreground">
                  Name
                </span>
                <input
                  type="text"
                  required
                  value={signupName}
                  onChange={(event) => setSignupName(event.target.value)}
                  placeholder="Jane Cooper"
                  className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-foreground">
                  Email
                </span>
                <input
                  type="email"
                  required
                  value={signupEmail}
                  onChange={(event) => setSignupEmail(event.target.value)}
                  placeholder="you@company.com"
                  className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-foreground">
                  Password{" "}
                  <span className="font-normal text-muted-foreground">
                    (min 8 chars)
                  </span>
                </span>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={signupPassword}
                  onChange={(event) => setSignupPassword(event.target.value)}
                  placeholder="••••••••"
                  className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </label>

              {signupError && (
                <p className="text-sm text-red-600">{signupError}</p>
              )}

              <Button type="submit" size="lg" className="w-full" disabled={signupLoading}>
                {signupLoading && <Loader2 className="size-4 animate-spin" />}
                Create Account
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                By signing up, you agree to our Terms and Privacy Policy
              </p>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setTab("login")}
                  className="font-semibold text-primary hover:underline"
                >
                  Log in →
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
