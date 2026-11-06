
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Loader2,
  User,
  Mail,
  Image as ImageIcon,
  Lock,
  HeartHandshake,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

import { CareCircleLogo } from "@/components/shared/CareCircleLogo";
import { signUp } from "@/lib/auth-client";
import { notify } from "@/lib/notify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Password validation rules
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasMinLength = password.length >= 6;

  const isPasswordValid =
    hasUppercase && hasLowercase && hasMinLength;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name.trim()) {
      notify.error("Validation Error", "Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      notify.error(
        "Validation Error",
        "Please provide a valid email address."
      );
      return;
    }

    if (!photoURL.trim()) {
      notify.error(
        "Validation Error",
        "Please provide a profile photo URL."
      );
      return;
    }

    try {
      const parsedUrl = new URL(photoURL.trim());

      if (
        parsedUrl.protocol !== "http:" &&
        parsedUrl.protocol !== "https:"
      ) {
        notify.error(
          "Validation Error",
          "Profile photo URL must start with http:// or https://"
        );
        return;
      }
    } catch {
      notify.error(
        "Validation Error",
        "Please enter a valid URL for your profile photo."
      );
      return;
    }

    if (!hasUppercase) {
      notify.error(
        "Invalid Password",
        "Password must contain at least one uppercase letter (A-Z)."
      );
      return;
    }

    if (!hasLowercase) {
      notify.error(
        "Invalid Password",
        "Password must contain at least one lowercase letter (a-z)."
      );
      return;
    }

    if (!hasMinLength) {
      notify.error(
        "Invalid Password",
        "Password must be at least 6 characters in length."
      );
      return;
    }

    setIsLoading(true);

    try {
      const photo = photoURL.trim();

      const res = await signUp.email({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        image: photo,
        photoURL: photo,
      });

      if (res.error) {
        notify.error(
          "Registration Failed",
          res.error.message || "Failed to create account."
        );
        return;
      }

      notify.success(
        "Account Created!",
        "Welcome to CareCircle. You can now log in."
      );

      router.push("/login");
    } catch (err: unknown) {
      notify.error(
        "Registration Error",
        err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden bg-muted/30 px-4 py-12 sm:px-6 lg:px-8">

      {/* Background decoration */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl" />

      {/* Main container */}
      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl border border-border/60 bg-card shadow-2xl lg:grid-cols-2">

        {/* Left branding section */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-emerald-950 p-10 text-white lg:flex">

          {/* Decorative circles */}
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border border-white/10" />
          <div className="absolute -right-12 -top-12 h-56 w-56 rounded-full border border-white/10" />
          <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-emerald-500/20 blur-2xl" />

          {/* Brand */}
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

          {/* Branding content */}
          <div className="relative z-10 my-12">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-white/10 px-4 py-2 text-sm text-emerald-100">
              <HeartHandshake className="h-4 w-4" />
              Become part of something meaningful
            </div>

            <h1 className="max-w-md text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
              Make a Difference.
              <span className="mt-2 block text-emerald-300">
                Start With You.
              </span>
            </h1>

            <p className="mt-6 max-w-md text-base leading-7 text-emerald-100/75">
              Create your account, connect with passionate people,
              and discover opportunities to support your community.
              Every small action can create a meaningful impact.
            </p>

            {/* Community highlights */}
            <div className="mt-10 space-y-5">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
                  <HeartHandshake className="h-5 w-5 text-emerald-300" />
                </div>
                <div>
                  <p className="font-semibold">Join Community Initiatives</p>
                  <p className="mt-1 text-sm text-emerald-100/65">
                    Discover meaningful events happening around you.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
                  <User className="h-5 w-5 text-emerald-300" />
                </div>
                <div>
                  <p className="font-semibold">Connect With Volunteers</p>
                  <p className="mt-1 text-sm text-emerald-100/65">
                    Meet people who share your passion for helping others.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom tagline */}
          <div className="relative z-10 flex items-center gap-2 text-sm text-emerald-100/70">
            <ShieldCheck className="h-4 w-4" />
            Your journey toward positive change starts here.
          </div>
        </div>

        {/* Right registration section */}
        <div className="flex items-center justify-center bg-card p-6 sm:p-10 lg:p-12">

          {/* Width constrained wrapper */}
          <div className="mx-auto w-full max-w-[420px] px-3 sm:px-4">

            {/* Mobile branding */}
            <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-md">
                <CareCircleLogo className="h-7 w-7" />
              </div>

              <div>
                <h2 className="text-xl font-bold">CareCircle</h2>
                <p className="text-xs text-muted-foreground">
                  Together, We Make a Difference
                </p>
              </div>
            </div>

            {/* Inner registration card */}
            <div className="w-full rounded-2xl border border-border/70 bg-card p-6 shadow-sm sm:p-8">

              {/* Heading */}
              <div className="mb-7 space-y-3 text-center lg:text-left">


                <h2 className="text-3xl font-bold tracking-tight">
                  Create an Account
                </h2>

                <p className="text-sm leading-6 text-muted-foreground">
                  Join{" "}
                  <span className="font-semibold text-emerald-700">
                    CareCircle
                  </span>{" "}
                  and start making a difference in your community.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="w-full space-y-4">

                {/* Full Name */}
                <div className="w-full space-y-2">
                  <Label
                    htmlFor="name"
                    className="flex items-center gap-1.5 text-sm font-semibold"
                  >
                    <User className="h-4 w-4 text-emerald-700" />
                    Full Name
                  </Label>

                  <Input
                    id="name"
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="e.g. John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                    className="h-12 w-full rounded-xl border-border/70 bg-background focus-visible:border-emerald-600 focus-visible:ring-emerald-600/20"
                  />
                </div>

                {/* Email */}
                <div className="w-full space-y-2">
                  <Label
                    htmlFor="email"
                    className="flex items-center gap-1.5 text-sm font-semibold"
                  >
                    <Mail className="h-4 w-4 text-emerald-700" />
                    Email Address
                  </Label>

                  <Input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="h-12 w-full rounded-xl border-border/70 bg-background focus-visible:border-emerald-600 focus-visible:ring-emerald-600/20"
                  />
                </div>

                {/* Profile Photo URL */}
                <div className="w-full space-y-2">
                  <Label
                    htmlFor="photoURL"
                    className="flex items-center gap-1.5 text-sm font-semibold"
                  >
                    <ImageIcon className="h-4 w-4 text-emerald-700" />
                    Profile Photo URL
                  </Label>

                  <Input
                    id="photoURL"
                    type="url"
                    required
                    placeholder="https://example.com/photo.jpg"
                    value={photoURL}
                    onChange={(e) => setPhotoURL(e.target.value)}
                    disabled={isLoading}
                    className="h-12 w-full rounded-xl border-border/70 bg-background focus-visible:border-emerald-600 focus-visible:ring-emerald-600/20"
                  />

                  <p className="text-xs text-muted-foreground">
                    Enter a publicly accessible image URL.
                  </p>
                </div>

                {/* Password */}
                <div className="w-full space-y-2">
                  <Label
                    htmlFor="password"
                    className="flex items-center gap-1.5 text-sm font-semibold"
                  >
                    <Lock className="h-4 w-4 text-emerald-700" />
                    Password
                  </Label>

                  <div className="relative w-full">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="new-password"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      className="h-12 w-full rounded-xl border-border/70 bg-background pr-11 focus-visible:border-emerald-600 focus-visible:ring-emerald-600/20"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {/* Password requirements */}
                  {password.length > 0 && (
                    <div className="mt-2 space-y-2 rounded-xl border border-border/60 bg-muted/30 p-3 text-xs">
                      <p className="font-semibold text-muted-foreground">
                        Password Requirements
                      </p>

                      <div className="flex items-center gap-2">
                        {hasUppercase ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                        ) : (
                          <XCircle className="h-4 w-4 shrink-0 text-rose-500" />
                        )}

                        <span
                          className={
                            hasUppercase
                              ? "text-emerald-700 dark:text-emerald-400"
                              : "text-muted-foreground"
                          }
                        >
                          At least one uppercase letter (A-Z)
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {hasLowercase ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                        ) : (
                          <XCircle className="h-4 w-4 shrink-0 text-rose-500" />
                        )}

                        <span
                          className={
                            hasLowercase
                              ? "text-emerald-700 dark:text-emerald-400"
                              : "text-muted-foreground"
                          }
                        >
                          At least one lowercase letter (a-z)
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {hasMinLength ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                        ) : (
                          <XCircle className="h-4 w-4 shrink-0 text-rose-500" />
                        )}

                        <span
                          className={
                            hasMinLength
                              ? "text-emerald-700 dark:text-emerald-400"
                              : "text-muted-foreground"
                          }
                        >
                          Minimum 6 characters long
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Register button */}
                <Button
                  type="submit"
                  disabled={isLoading || !isPasswordValid}
                  className="h-12 w-full rounded-xl bg-emerald-700 text-sm font-semibold text-white shadow-md shadow-emerald-700/15 transition-all hover:bg-emerald-800"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>

                {/* Login link */}
                <p className="pt-2 text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-bold text-emerald-700 transition-colors hover:text-emerald-800 hover:underline"
                  >
                    Sign In
                  </Link>
                </p>

                {/* Security note */}
                <div className="flex items-center justify-center gap-2 pt-1 text-xs text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 text-emerald-700" />
                  Your information is securely protected.
                </div>

              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
