"use client";

import { useEffect } from "react";

import { useSession } from "@/lib/auth-client";
import { notify } from "@/lib/notify";

export const SOCIAL_LOGIN_KEY = "carecircle:social-login-provider";

export default function SocialLoginToast() {
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (isPending || typeof window === "undefined") return;

    const provider = window.sessionStorage.getItem(SOCIAL_LOGIN_KEY);
    if (!provider) return;

    window.sessionStorage.removeItem(SOCIAL_LOGIN_KEY);

    if (session?.user) {
      const label = provider === "google" ? "Google" : provider;

      notify.success(
        `Signed in with ${label}`,
        session.user.name
          ? `Welcome back, ${session.user.name}!`
          : "You have successfully signed in."
      );
    }
  }, [isPending, session]);

  return null;
}
