
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import {
  CalendarCheck,
  Home,
  Menu,
  Sun,
  Moon,
  CalendarPlus,
  BriefcaseBusiness,
  Users,
  LogOut,
  DoorOpen,
  User as UserIcon,
  UserPlus,
  UserPen,
  Loader2,
} from "lucide-react";
import { CareCircleLogo } from "@/components/shared/CareCircleLogo";

import { useTheme } from "next-themes";
import { useSession, signOut, updateUser } from "@/lib/auth-client";
import { notify } from "@/lib/notify";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const navLinks = [
  {
    name: "Home",
    href: "/",
    icon: Home,
  },
  {
    name: "Upcoming Events",
    href: "/upcoming-events",
    icon: CalendarCheck,
  },
];

const privateLinks = [
  {
    name: "Create Event",
    href: "/create-event",
    icon: CalendarPlus,
  },
  {
    name: "Manage Events",
    href: "/manage-events",
    icon: BriefcaseBusiness,
  },
  {
    name: "Joined Events",
    href: "/joined-events",
    icon: Users,
  },
];

const emptySubscribe = () => () => { };

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

  const { data: session, refetch } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Edit Profile Modal State
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhotoURL, setEditPhotoURL] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const isActive = (href: string) => pathname === href;

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleLogout = async () => {
    try {
      setMobileOpen(false);
      router.push("/");
      await signOut();
      notify.success("Logged Out", "You have been signed out successfully.");
      router.refresh();
    } catch (err: unknown) {
      notify.error(
        "Logout Error",
        err instanceof Error ? err.message : "Failed to log out."
      );
    }
  };

  const openEditProfile = () => {
    setEditName(session?.user?.name || "");

    const photo =
      session?.user?.image ||
      (session?.user as { photoURL?: string })?.photoURL ||
      "";

    setEditPhotoURL(photo);
    setEditProfileOpen(true);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editName.trim()) {
      notify.error("Validation Error", "Name cannot be empty.");
      return;
    }

    setIsUpdating(true);

    try {
      const trimmedPhoto = editPhotoURL.trim() || undefined;

      const res = await updateUser({
        name: editName.trim(),
        image: trimmedPhoto,
      });

      if (res?.error) {
        notify.error(
          "Update Failed",
          res.error.message || "Failed to update profile."
        );
        setIsUpdating(false);
        return;
      }

      notify.success(
        "Profile Updated",
        "Your profile details have been saved."
      );

      setEditProfileOpen(false);
      setIsUpdating(false);

      if (refetch) refetch();

      router.refresh();
    } catch (err: unknown) {
      notify.error(
        "Update Error",
        err instanceof Error ? err.message : "Failed to update profile."
      );

      setIsUpdating(false);
    }
  };

  const userInitial = session?.user?.name
    ? session.user.name.charAt(0).toUpperCase()
    : session?.user?.email?.charAt(0).toUpperCase() || "U";

  // Check both image and photoURL on the user session
  const userPhoto =
    session?.user?.image ||
    (session?.user as { photoURL?: string })?.photoURL ||
    null;

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-md">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-sm transition-transform group-hover:scale-105">
              <CareCircleLogo className="h-6 w-6" />
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
                  className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-emerald-700 ${active
                    ? "text-emerald-700 font-semibold"
                    : "text-muted-foreground"
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
                {/* Profile Avatar */}
                <TooltipProvider delay={200}>
                  <DropdownMenu>
                    <Tooltip>
                      <TooltipTrigger render={<span className="inline-flex" />}>
                        <DropdownMenuTrigger
                          render={
                            <button
                              type="button"
                              className="relative flex items-center justify-center rounded-full ring-2 ring-emerald-700/30 transition-all hover:ring-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700 cursor-pointer"
                              aria-label="User profile menu"
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
                        </DropdownMenuTrigger>
                      </TooltipTrigger>

                      <TooltipContent side="bottom" align="center">
                        <p className="font-medium">
                          {session.user.name || "My Account"}
                        </p>
                      </TooltipContent>
                    </Tooltip>

                    <DropdownMenuContent
                      align="end"
                      className="w-60 mt-2"
                    >
                      <DropdownMenuGroup>
                        <DropdownMenuLabel className="font-normal">
                          <div className="flex items-center gap-2.5 pb-1">
                            <UserAvatar
                              key={userPhoto || "menu-default"}
                              src={userPhoto}
                              alt={session.user.name || "User avatar"}
                              fallback={userInitial}
                              className="h-9 w-9"
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
                      </DropdownMenuGroup>

                      <DropdownMenuSeparator />

                      <DropdownMenuGroup>
                        <DropdownMenuItem
                          onClick={openEditProfile}
                          className="cursor-pointer flex items-center gap-2 font-medium text-emerald-700 focus:text-emerald-800"
                        >
                          <UserPen className="h-4 w-4" />
                          <span>Update Profile</span>
                        </DropdownMenuItem>
                      </DropdownMenuGroup>

                      <DropdownMenuSeparator />

                      <DropdownMenuGroup>
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
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TooltipProvider>

                {/* Redesigned Desktop Logout Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="group gap-2 rounded-full border-red-200 bg-red-50 px-4 font-semibold text-red-600 shadow-sm transition-all hover:border-red-300 hover:bg-red-100 hover:text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/60"
                >
                  <LogOut className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
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
                    <DoorOpen className="h-4 w-4" />
                    Login
                  </Button>
                </Link>

                <Link href="/register">
                  <Button
                    variant="outline"
                    size="sm"
                    className="font-medium border-emerald-700/30 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:hover:bg-emerald-950/40 gap-1.5"
                  >
                    <UserPlus className="h-4 w-4" />
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

              <SheetContent
                side="right"
                className="w-[300px] sm:w-[360px] p-6"
              >
                <SheetHeader className="sr-only">
                  <SheetTitle>Navigation Menu</SheetTitle>
                  <SheetDescription>
                    CareCircle navigation links
                  </SheetDescription>
                </SheetHeader>

                <div className="mt-4 flex flex-col gap-6">
                  {/* Mobile Logo */}
                  <Link
                    href="/"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-white">
                      <CareCircleLogo className="h-5 w-5" />
                    </div>

                    <span className="text-xl font-bold tracking-tight">
                      Care<span className="text-emerald-700">Circle</span>
                    </span>
                  </Link>

                  {/* Mobile User Profile Section */}
                  {session?.user ? (
                    <div className="rounded-xl border border-border/60 bg-muted/40 p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
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

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setMobileOpen(false);
                          openEditProfile();
                        }}
                        title="Update Profile"
                        className="text-emerald-700 hover:text-emerald-800"
                      >
                        <UserPen className="h-4 w-4" />
                      </Button>
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
                          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted ${active
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
                            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted ${active
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
                        className="group w-full justify-center gap-2 rounded-xl border-red-200 bg-red-50 py-5 font-semibold text-red-600 shadow-sm transition-all hover:border-red-300 hover:bg-red-100 hover:text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/60"
                      >
                        <LogOut className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        Log Out
                      </Button>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <Link
                          href="/login"
                          onClick={() => setMobileOpen(false)}
                        >
                          <Button className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-medium justify-center gap-2">
                            <DoorOpen className="h-4 w-4" />
                            Sign In
                          </Button>
                        </Link>

                        <Link
                          href="/register"
                          onClick={() => setMobileOpen(false)}
                        >
                          <Button
                            variant="outline"
                            className="w-full font-medium justify-center gap-2 border-emerald-700/30 text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                          >
                            <UserPlus className="h-4 w-4" />
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

      {/* Update Profile Dialog */}
      <Dialog
        open={editProfileOpen}
        onOpenChange={setEditProfileOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <UserPen className="h-5 w-5 text-emerald-700" />
              Update Profile
            </DialogTitle>

            <DialogDescription>
              Update your display name and profile picture URL.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateProfile} className="space-y-4 py-2">
            {/* Live Avatar Preview */}
            <div className="flex flex-col items-center justify-center gap-2 py-2">
              <UserAvatar
                src={editPhotoURL.trim() || null}
                alt={editName}
                fallback={
                  editName
                    ? editName.charAt(0).toUpperCase()
                    : userInitial
                }
                className="h-16 w-16"
              />

              <p className="text-xs text-muted-foreground">
                Photo Preview
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-name" className="text-sm font-medium">
                Full Name
              </Label>

              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Your Name"
                disabled={isUpdating}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-photo" className="text-sm font-medium">
                Profile Photo URL
              </Label>

              <Input
                id="edit-photo"
                type="url"
                value={editPhotoURL}
                onChange={(e) => setEditPhotoURL(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                disabled={isUpdating}
              />

              <p className="text-[11px] text-muted-foreground">
                Tip: Must be a direct image link (e.g.ending
                in .jpg/.png).
              </p>
            </div>

            <DialogFooter className="pt-2 sm:justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={isUpdating}
                onClick={() => setEditProfileOpen(false)}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={isUpdating}
                className="bg-emerald-700 hover:bg-emerald-800 text-white"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
