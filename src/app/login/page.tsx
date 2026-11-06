"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useSyncExternalStore } from "react";
import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Lock,
  ArrowRight,
  HeartHandshake,
  ShieldCheck,
} from "lucide-react";

import { CareCircleLogo } from "@/components/shared/CareCircleLogo";
import { SOCIAL_LOGIN_KEY } from "@/components/providers/SocialLoginToast";
import { signIn, useSession } from "@/lib/auth-client";
import { notify } from "@/lib/notify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const subscribeToNothing = () => () => {};

function getRegisterHref() {
  const raw = new URLSearchParams(window.location.search).get("callbackUrl");
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) {
    return `/register?callbackUrl=${encodeURIComponent(raw)}`;
  }
  return "/register";
}

function getRegisterHrefServer() {
  return "/register";
}

export default function LoginPage() {
  const router = useRouter();
  const { data: session, isPending, refetch } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState<string | null>(null);
  const registerHref = useSyncExternalStore(
    subscribeToNothing,
    getRegisterHref,
    getRegisterHrefServer
  );

  const getCallbackUrl = () => {
    if (typeof window === "undefined") return "/";

    const params = new URLSearchParams(window.location.search);
    const callbackUrl =
      params.get("callbackUrl") || params.get("redirect") || "/";

    if (!callbackUrl.startsWith("/") || callbackUrl.startsWith("//")) {
      return "/";
    }

    return callbackUrl;
  };

  useEffect(() => {
    if (!isPending && session?.user) {
      router.replace(getCallbackUrl());
    }
  }, [session, isPending, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      notify.error("Missing Fields", "Please enter both email and password.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await signIn.email({
        email: email.trim().toLowerCase(),
        password,
      });

      if (res?.error) {
        notify.error(
          "Sign In Failed",
          res.error.message || "Invalid email or password."
        );
        return;
      }

      notify.success("Welcome Back!", "You have successfully signed in.");

      setEmail("");
      setPassword("");

      if (refetch) {
        await refetch();
      }

      router.push(getCallbackUrl());
      router.refresh();
    } catch (err: unknown) {
      notify.error(
        "Authentication Error",
        err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: "google") => {
    setIsSocialLoading(provider);

    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(SOCIAL_LOGIN_KEY, provider);
    }

    try {
      const res = await signIn.social({
        provider,
        callbackURL: getCallbackUrl(),
      });

      if (res?.error) {
        if (typeof window !== "undefined") {
          window.sessionStorage.removeItem(SOCIAL_LOGIN_KEY);
        }

        notify.error(
          "Social Login Failed",
          res.error.message || `Failed to sign in with ${provider}.`
        );
      }
    } catch (err: unknown) {
      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem(SOCIAL_LOGIN_KEY);
      }

      notify.error(
        "Social Login Error",
        err instanceof Error
          ? err.message
          : `Unable to initiate ${provider} authentication.`
      );
    } finally {
      setIsSocialLoading(null);
    }
  };

  const isBusy = isLoading || isSocialLoading !== null;

  return (
    <main className="relative flex min-h-[calc(100dvh-4rem)] items-center justify-center overflow-hidden bg-muted/30 px-3 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-12">

      {/* Background decoration */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-60 w-60 rounded-full bg-emerald-500/10 blur-3xl sm:h-80 sm:w-80" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-72 w-72 rounded-full bg-teal-500/10 blur-3xl sm:h-96 sm:w-96" />

      {/* Main container */}
      <div className="relative grid w-full max-w-md overflow-hidden rounded-2xl border border-border/60 bg-card shadow-xl sm:max-w-lg sm:rounded-3xl sm:shadow-2xl lg:max-w-5xl lg:grid-cols-2">

        {/* Left branding section (desktop only) */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-emerald-950 p-10 text-white lg:flex">

          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border border-white/10" />
          <div className="absolute -right-12 -top-12 h-56 w-56 rounded-full border border-white/10" />
          <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-emerald-500/20 blur-2xl" />

          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
              <CareCircleLogo className="h-7 w-7" />
            </div>

            <div>
              <h2 className="text-xl font-bold tracking-tight">
                CareCircle
              </h2>
              <p className="text-xs text-emerald-100/70">
                Together, We Make a Difference
              </p>
            </div>
          </div>

          <div className="relative z-10 my-12">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-white/10 px-4 py-2 text-sm text-emerald-100">
              <HeartHandshake className="h-4 w-4" />
              Community starts with you
            </div>

            <h1 className="max-w-md text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
              Small Actions.
              <span className="mt-2 block text-emerald-300">
                Meaningful Impact.
              </span>
            </h1>

            <p className="mt-6 max-w-md text-base leading-7 text-emerald-100/75">
              Join a community of passionate people, discover meaningful
              initiatives, and make a positive difference in the lives
              around you.
            </p>

            <div className="mt-10 flex items-center gap-3">
              <div className="flex -space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-emerald-950 bg-emerald-300 text-sm font-bold text-emerald-950">
                  C
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-emerald-950 bg-teal-300 text-sm font-bold text-teal-950">
                  A
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-emerald-950 bg-lime-300 text-sm font-bold text-lime-950">
                  V
                </div>
              </div>

              <p className="text-sm text-emerald-100/80">
                Connect. Volunteer. Make an impact.
              </p>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-2 text-sm text-emerald-100/70">
            <ShieldCheck className="h-4 w-4" />
            Your community journey starts here.
          </div>
        </div>

        {/* Right login section */}
        <div className="flex items-center justify-center bg-card px-5 py-8 sm:px-10 sm:py-10 lg:p-12">

          <div className="mx-auto w-full max-w-[400px]">

            {/* Mobile / tablet branding */}
            <div className="mb-6 flex items-center justify-center gap-3 sm:mb-8 lg:hidden">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-md sm:h-12 sm:w-12">
                <CareCircleLogo className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>

              <div className="min-w-0">
                <h2 className="text-lg font-bold sm:text-xl">CareCircle</h2>
                <p className="text-xs text-muted-foreground">
                  Together, We Make a Difference
                </p>
              </div>
            </div>

            {/* Form wrapper: flat on mobile, card from sm up (flat again inside desktop split) */}
            <div className="w-full sm:rounded-2xl sm:border sm:border-border/70 sm:bg-card sm:p-8 sm:shadow-sm lg:border-0 lg:p-0 lg:shadow-none">

              {/* Heading */}
              <div className="mb-6 space-y-2 text-center sm:mb-7 sm:space-y-3 lg:text-left">
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Welcome back!
                </h2>

                <p className="text-sm leading-6 text-muted-foreground">
                  Sign in to continue your journey and make a difference
                  with CareCircle.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="w-full space-y-4 sm:space-y-5">

                {/* Email */}
                <div className="w-full space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold">
                    Email Address
                  </Label>

                  <div className="relative w-full">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                    <Input
                      id="email"
                      type="email"
                      inputMode="email"
                      required
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isBusy}
                      className="h-12 w-full rounded-xl border-border/70 bg-background pl-10 text-base focus-visible:border-emerald-600 focus-visible:ring-emerald-600/20 sm:text-sm"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="w-full space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold">
                    Password
                  </Label>

                  <div className="relative w-full">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isBusy}
                      className="h-12 w-full rounded-xl border-border/70 bg-background pl-10 pr-12 text-base focus-visible:border-emerald-600 focus-visible:ring-emerald-600/20 sm:text-sm"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isBusy}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Sign In */}
                <Button
                  type="submit"
                  disabled={isBusy}
                  className="h-12 w-full rounded-xl bg-emerald-700 text-sm font-semibold text-white shadow-md shadow-emerald-700/15 transition-all hover:bg-emerald-800"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>

                {/* Divider */}
                <div className="flex w-full items-center gap-3">
                  <div className="h-px flex-1 bg-border" />

                  <span className="shrink-0 text-[11px] font-medium text-muted-foreground sm:text-xs">
                    OR CONTINUE WITH
                  </span>

                  <div className="h-px flex-1 bg-border" />
                </div>

                {/* Google login */}
                <Button
                  type="button"
                  variant="outline"
                  disabled={isBusy}
                  onClick={() => handleSocialSignIn("google")}
                  className="h-12 w-full rounded-xl border-border/70 bg-background font-semibold transition-all hover:border-emerald-600/40 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                >
                  {isSocialLoading === "google" ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <svg
                      className="mr-2 h-5 w-5"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        fill="#EA4335"
                        d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                      />
                      <path
                        fill="#4285F4"
                        d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5.1 3.7-8.8z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.6 14.8c-.3-.8-.4-1.8-.4-2.8s.2-1.9.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
                      />
                    </svg>
                  )}

                  {isSocialLoading === "google"
                    ? "Connecting..."
                    : "Continue with Google"}
                </Button>

                {/* Register */}
                <p className="pt-1 text-center text-sm text-muted-foreground sm:pt-2">
                  Don&apos;t have an account?{" "}
                  <Link
                    href={registerHref}
                    className="inline-block py-1 font-bold text-emerald-700 transition-colors hover:text-emerald-800 hover:underline"
                  >
                    Create an account
                  </Link>
                </p>

                {/* Security */}
                <div className="flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-700" />
                  Secure authentication powered by CareCircle
                </div>

              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}