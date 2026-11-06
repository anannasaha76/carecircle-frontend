
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Mail,
  Phone,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { CareCircleLogo } from "@/components/shared/CareCircleLogo";

/** X (formerly Twitter) brand SVG icon */
function XIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-label="X (formerly Twitter)"
    >
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
  );
}

/** GitHub brand SVG icon */
function GithubIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-label="GitHub"
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
    </svg>
  );
}

/** LinkedIn brand SVG icon */
function LinkedinIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-label="LinkedIn"
    >
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  );
}

/** Facebook brand SVG icon */
function FacebookIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-label="Facebook"
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

export default function Footer() {
  // Avoid calling new Date() during prerendering.
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const { data: session } = useSession();

  // Redirect unauthenticated users to login with their intended destination.
  const getProtectedHref = (path: string) => {
    if (session?.user) {
      return path;
    }

    return `/login?redirect=${encodeURIComponent(path)}`;
  };

  return (
    <footer className="border-t bg-muted/30 dark:bg-muted/10 text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">

          {/* Brand Section - Left */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group w-fit">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-sm transition-transform group-hover:scale-105">
                <CareCircleLogo className="h-6 w-6" />
              </div>

              <div>
                <span className="text-xl font-bold tracking-tight">
                  Care<span className="text-emerald-700">Circle</span>
                </span>

                <p className="text-[10px] text-muted-foreground leading-none">
                  Small Actions, Big Impact
                </p>
              </div>
            </Link>

            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              CareCircle is a community-driven event management platform where
              citizens create, discover, and join grassroots social service
              activities in their local neighborhoods.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                aria-label="X (Twitter)"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/80 bg-background text-muted-foreground hover:bg-emerald-700 hover:text-white hover:border-emerald-700 transition-all shadow-xs"
              >
                <XIcon className="h-4 w-4" />
              </a>

              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/80 bg-background text-muted-foreground hover:bg-emerald-700 hover:text-white hover:border-emerald-700 transition-all shadow-xs"
              >
                <GithubIcon className="h-4 w-4" />
              </a>

              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/80 bg-background text-muted-foreground hover:bg-emerald-700 hover:text-white hover:border-emerald-700 transition-all shadow-xs"
              >
                <LinkedinIcon className="h-4 w-4" />
              </a>

              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/80 bg-background text-muted-foreground hover:bg-emerald-700 hover:text-white hover:border-emerald-700 transition-all shadow-xs"
              >
                <FacebookIcon className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Explore Section - Middle */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-foreground">
              Explore
            </p>

            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/"
                  className="hover:text-emerald-700 transition-colors"
                >
                  Home
                </Link>
              </li>

              <li>
                <Link
                  href="/upcoming-events"
                  className="hover:text-emerald-700 transition-colors"
                >
                  Upcoming Events
                </Link>
              </li>

              <li>
                <Link
                  href={getProtectedHref("/create-event")}
                  className="hover:text-emerald-700 transition-colors"
                >
                  Create an Event
                </Link>
              </li>

              <li>
                <Link
                  href={getProtectedHref("/joined-events")}
                  className="hover:text-emerald-700 transition-colors"
                >
                  Joined Events
                </Link>
              </li>

              <li>
                <Link
                  href={getProtectedHref("/manage-events")}
                  className="hover:text-emerald-700 transition-colors"
                >
                  Manage My Events
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Section - Right */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-foreground">
              Contact
            </p>

            <ul className="space-y-2.5 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-emerald-700 mt-0.5" />
                <span>Mirpur, Dhaka, Bangladesh</span>
              </li>

              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-emerald-700" />
                <span>support@carecircle.org</span>
              </li>

              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-emerald-700" />
                <span>+880 1700-000000</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-6 sm:flex-row text-xs text-muted-foreground">
          <p>
            © {currentYear ?? "2026"} CareCircle. All rights reserved.
          </p>

          <p className="flex items-center gap-1">
            Built for social development & community action by CareCirle.
          </p>
        </div>
      </div>
    </footer>
  );
}
