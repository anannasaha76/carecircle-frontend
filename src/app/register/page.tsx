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
} from "lucide-react";
import { CareCircleLogo } from "@/components/shared/CareCircleLogo";

import { signUp } from "@/lib/auth-client";
import { notify } from "@/lib/notify";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  const isPasswordValid = hasUppercase && hasLowercase && hasMinLength;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      notify.error("Validation Error", "Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      notify.error("Validation Error", "Please provide a valid email address.");
      return;
    }

    if (!photoURL.trim()) {
      notify.error("Validation Error", "Please provide a profile photo URL.");
      return;
    }

    try {
      const parsedUrl = new URL(photoURL.trim());
      if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        notify.error("Validation Error", "Profile photo URL must start with http:// or https://");
        return;
      }
    } catch {
      notify.error("Validation Error", "Please enter a valid URL for your profile photo.");
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
        notify.error("Registration Failed", res.error.message || "Failed to create account.");
        setIsLoading(false);
        return;
      }

      notify.success("Account Created!", "Welcome to CareCircle. You can now log in.");
      setIsLoading(false);
      router.push("/login");
    } catch (err: unknown) {
      notify.error(
        "Registration Error",
        err instanceof Error ? err.message : "An unexpected error occurred. Please try again."
      );
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-lg border-border/60">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-md">
            <CareCircleLogo className="h-7 w-7" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Create an Account
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Join <span className="font-semibold text-emerald-700">CareCircle</span> to organize and volunteer in community events.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* Name Field */}
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm font-medium flex items-center gap-1.5">
                <User className="h-4 w-4 text-emerald-700" /> Full Name
              </Label>
              <Input
                id="name"
                type="text"
                required
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                className="h-10"
              />
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium flex items-center gap-1.5">
                <Mail className="h-4 w-4 text-emerald-700" /> Email Address
              </Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="h-10"
              />
            </div>

            {/* photoURL Field */}
            <div className="space-y-1.5">
              <Label htmlFor="photoURL" className="text-sm font-medium flex items-center gap-1.5">
                <ImageIcon className="h-4 w-4 text-emerald-700" /> Profile Photo URL
              </Label>
              <Input
                id="photoURL"
                type="url"
                required
                placeholder="https://images.unsplash.com/photo-..."
                value={photoURL}
                onChange={(e) => setPhotoURL(e.target.value)}
                disabled={isLoading}
                className="h-10"
              />
              <p className="text-[11px] text-muted-foreground">
                Enter a valid image URL (e.g. from cloud storage).
              </p>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium flex items-center gap-1.5">
                <Lock className="h-4 w-4 text-emerald-700" /> Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="h-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Password Requirements Real-Time Checklist */}
              {password.length > 0 && (
                <div className="mt-2 space-y-1 rounded-lg border border-border/50 bg-muted/30 p-2.5 text-xs">
                  <p className="font-semibold text-muted-foreground">Password Requirements:</p>
                  <div className="flex items-center gap-1.5">
                    {hasUppercase ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-rose-500" />
                    )}
                    <span className={hasUppercase ? "text-emerald-700 dark:text-emerald-400" : "text-muted-foreground"}>
                      At least one uppercase letter (A-Z)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {hasLowercase ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-rose-500" />
                    )}
                    <span className={hasLowercase ? "text-emerald-700 dark:text-emerald-400" : "text-muted-foreground"}>
                      At least one lowercase letter (a-z)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {hasMinLength ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-rose-500" />
                    )}
                    <span className={hasMinLength ? "text-emerald-700 dark:text-emerald-400" : "text-muted-foreground"}>
                      Minimum 6 characters long
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 pt-2">
            <Button
              type="submit"
              disabled={isLoading || (password.length > 0 && !isPasswordValid)}
              className="w-full h-10 bg-emerald-700 hover:bg-emerald-800 text-white font-medium"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Register"
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-emerald-700 hover:underline hover:text-emerald-800"
              >
                Sign In
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
