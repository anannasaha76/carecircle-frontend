"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import {
  HeartHandshake,
  CalendarDays,
  Home,
  Menu,
  Sun,
  Moon,
  PlusCircle,
  FolderKanban,
  CheckCircle2,
  LogOut,
  LogIn,
  User as UserIcon,
} from "lucide-react";

import { useTheme } from "next-themes";
import { useSession, signOut } from "@/lib/auth-client";
import { notify } from "@/lib/notify";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navLinks = [
  {
    name: "Home",
    href: "/",
    icon: Home,
  },
  {
    name: "Upcoming Events",
    href: "/upcoming-events",
    icon: CalendarDays,
  },
];

const privateLinks = [
  {
    name: "Create Event",
    href: "/create-event",
    icon: PlusCircle,
  },
  {
    name: "Manage Events",
    href: "/manage-events",
    icon: FolderKanban,
  },
  {
    name: "Joined Events",
    href: "/joined-events",
    icon: CheckCircle2,
  },
];

const emptySubscribe = () => () => {};

/**
 * Resilient UserAvatar component:
 * Directly renders native <img> with referrerPolicy="no-referrer" to prevent
 * CORS / hotlinking blocks from third-party image hosts.
 * Automatically falls back to user initials if the URL fails to load.
 */
function UserAvatar({
  src,
  alt,
  fallback,
  className = "h-9 w-9",
}: {
  src?: string | null;
  alt?: string;
  fallback: string;
  className?: string;
}) {
  const [hasError, setHasError] = useState(false);

  if (src && !hasError) {
    return (
      <div
        className={`relative ${className} shrink-0 overflow-hidden rounded-full border border-emerald-700/30 bg-muted shadow-sm`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt || "User profile photo"}
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
          onError={() => setHasError(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={`flex ${className} shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-semibold text-sm shadow-sm dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-700/20`}
    >
      {fallback}
    </div>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => pathname === href;

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleLogout = async () => {
    try {
      await signOut();
      notify.success("Logged Out", "You have been signed out successfully.");
      setMobileOpen(false);
      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      notify.error("Logout Error", err instanceof Error ? err.message : "Failed to log out.");
    }
  };

  const userInitial = session?.user?.name
    ? session.user.name.charAt(0).toUpperCase()
    : session?.user?.email?.charAt(0).toUpperCase() || "U";

  // Check both `image` and `photoURL` on the user session
  const userPhoto =
    session?.user?.image ||
    (session?.user as { photoURL?: string })?.photoURL ||
    null;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-sm transition-transform group-hover:scale-105">
            <HeartHandshake className="h-6 w-6" />
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tight">
              Care<span className="text-emerald-700">Circle</span>
            </h1>
            <p className="hidden text-[10px] text-muted-foreground sm:block leading-none">
              Small Actions, Big Impact
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-emerald-700 ${
                  active ? "text-emerald-700 font-semibold" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
          {/* Theme Toggler */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="text-muted-foreground hover:text-foreground"
          >
            {mounted && theme === "dark" ? (
              <Sun className="h-5 w-5 text-amber-400" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {/* Conditional Auth Rendering */}
          {session?.user ? (
            <div className="flex items-center gap-3">
              {/* Profile Avatar with Tooltip on Hover & Dropdown Menu */}
              <TooltipProvider delay={200}>
                <Tooltip>
                  <DropdownMenu>
                    <TooltipTrigger
                      render={
                        <DropdownMenuTrigger
                          render={
                            <button
                              type="button"
                              className="relative flex items-center justify-center rounded-full ring-2 ring-emerald-700/30 transition-all hover:ring-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700 cursor-pointer"
                              aria-label="User profile menu"
                            />
                          }
                        />
                      }
                    >
                      <UserAvatar
                        key={userPhoto || "default"}
                        src={userPhoto}
                        alt={session.user.name || "User avatar"}
                        fallback={userInitial}
                        className="h-9 w-9"
                      />
                    </TooltipTrigger>

                    <TooltipContent side="bottom" align="center">
                      <p className="font-medium">{session.user.name || "My Account"}</p>
                    </TooltipContent>

                    <DropdownMenuContent align="end" className="w-56 mt-2">
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex items-center gap-2.5 pb-1">
                          <UserAvatar
                            key={userPhoto || "menu-default"}
                            src={userPhoto}
                            alt={session.user.name || "User avatar"}
                            fallback={userInitial}
                            className="h-8 w-8"
                          />
                          <div className="flex flex-col min-w-0">
                            <p className="text-sm font-semibold leading-none truncate">
                              {session.user.name || "User"}
                            </p>
                            <p className="text-xs leading-none text-muted-foreground truncate mt-1">
                              {session.user.email}
                            </p>
                          </div>
                        </div>
                      </DropdownMenuLabel>

                      <DropdownMenuSeparator />

                      {privateLinks.map((item) => {
                        const Icon = item.icon;
                        return (
                          <DropdownMenuItem
                            key={item.href}
                            onClick={() => router.push(item.href)}
                            className="cursor-pointer flex items-center gap-2"
                          >
                            <Icon className="h-4 w-4 text-emerald-700" />
                            <span>{item.name}</span>
                          </DropdownMenuItem>
                        );
                      })}

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="cursor-pointer text-destructive focus:text-destructive flex items-center gap-2"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Log Out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </Tooltip>
              </TooltipProvider>

              {/* Explicit Desktop Logout Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="gap-1.5 text-xs font-medium border-border/80 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
              >
                <LogOut className="h-3.5 w-3.5" />
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button
                  size="sm"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-medium gap-1.5"
                >
                  <LogIn className="h-4 w-4" />
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  variant="outline"
                  size="sm"
                  className="font-medium border-border/80"
                >
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Navigation Drawer */}
        <div className="flex items-center gap-2 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {mounted && theme === "dark" ? (
              <Sun className="h-5 w-5 text-amber-400" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Open navigation menu"
                />
              }
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>

            <SheetContent side="right" className="w-[300px] sm:w-[360px] p-6">
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation Menu</SheetTitle>
                <SheetDescription>CareCircle navigation links</SheetDescription>
              </SheetHeader>

              <div className="mt-4 flex flex-col gap-6">
                {/* Mobile Logo */}
                <Link
                  href="/"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-white">
                    <HeartHandshake className="h-5 w-5" />
                  </div>
                  <span className="text-xl font-bold tracking-tight">
                    Care<span className="text-emerald-700">Circle</span>
                  </span>
                </Link>

                {/* Mobile User Profile Section */}
                {session?.user ? (
                  <div className="rounded-xl border border-border/60 bg-muted/40 p-3 flex items-center gap-3">
                    <UserAvatar
                      key={userPhoto || "mobile-default"}
                      src={userPhoto}
                      alt={session.user.name || "User"}
                      fallback={userInitial}
                      className="h-10 w-10"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate">
                        {session.user.name || "User"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {session.user.email}
                      </p>
                    </div>
                  </div>
                ) : null}

                {/* Public Links */}
                <div className="flex flex-col gap-1.5">
                  <p className="text-xs font-semibold text-muted-foreground px-3 uppercase tracking-wider">
                    Menu
                  </p>
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    const active = isActive(link.href);

                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted ${
                          active
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 font-semibold"
                            : "text-muted-foreground"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        {link.name}
                      </Link>
                    );
                  })}
                </div>

                {/* Private Links if Logged In */}
                {session?.user && (
                  <div className="flex flex-col gap-1.5">
                    <p className="text-xs font-semibold text-muted-foreground px-3 uppercase tracking-wider">
                      My Events
                    </p>
                    {privateLinks.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.href);

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted ${
                            active
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 font-semibold"
                              : "text-muted-foreground"
                          }`}
                        >
                          <Icon className="h-5 w-5 text-emerald-700" />
                          {item.name}
                        </Link>
                      );
                    })}
                  </div>
                )}

                {/* Mobile Auth Actions */}
                <div className="mt-auto pt-6 border-t border-border/60">
                  {session?.user ? (
                    <Button
                      variant="outline"
                      onClick={handleLogout}
                      className="w-full text-destructive border-destructive/20 hover:bg-destructive/10 justify-center gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      Log Out
                    </Button>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Link href="/login" onClick={() => setMobileOpen(false)}>
                        <Button className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-medium justify-center gap-2">
                          <LogIn className="h-4 w-4" />
                          Sign In
                        </Button>
                      </Link>
                      <Link href="/register" onClick={() => setMobileOpen(false)}>
                        <Button
                          variant="outline"
                          className="w-full font-medium justify-center gap-2"
                        >
                          <UserIcon className="h-4 w-4" />
                          Register
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
