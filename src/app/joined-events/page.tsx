
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  MapPin,
  Tag,
  ArrowRight,
  CheckCircle2,
  Trash2,
  Loader2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Clock,
  HeartHandshake,
  CalendarClock,
  TicketCheck,
  ArrowUpRight,
} from "lucide-react";

import { useSession } from "@/lib/auth-client";
import { notify } from "@/lib/notify";
import { getTokenFromClient } from "@/lib/getTokenFromClient";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface JoinedEventItem {
  _id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventType: string;
  location: string;
  thumbnailURL: string | null;
  userEmail: string;
  userName?: string | null;
  joinedAt?: string;
}

const DEFAULT_EVENT_IMAGE =
  "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=800&q=80";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const emptySubscribe = () => () => { };

function getTodayString() {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatEventDate(dateString: string) {
  if (!dateString) return "Date not available";

  const [year, month, day] = dateString.split("-").map(Number);

  if (!year || !month || !day) return dateString;

  const date = new Date(year, month - 1, day);

  if (Number.isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatJoinedDate(isoString?: string) {
  if (!isoString) return null;

  const date = new Date(isoString);

  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatEventType(type: string) {
  if (!type) return "Community Event";

  return type
    .replaceAll("-", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function JoinedEventsPage() {
  const router = useRouter();
  const { data: session, isPending, refetch } = useSession();

  const [joinedEvents, setJoinedEvents] = useState<JoinedEventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"all" | "upcoming" | "past">(
    "all"
  );

  const todayDate = useSyncExternalStore(
    emptySubscribe,
    getTodayString,
    () => ""
  );

  // Redirect unauthenticated users.
  useEffect(() => {
    if (isPending || session) return;

    let active = true;

    const redirectUser = async () => {
      try {
        await refetch?.();
      } catch {
        // Continue to login if session refresh fails.
      }

      if (active) {
        notify.error(
          "Authentication Required",
          "Please sign in to view your joined events."
        );

        router.push("/login?callbackUrl=/joined-events");
      }
    };

    redirectUser();

    return () => {
      active = false;
    };
  }, [session, isPending, router, refetch]);

  // Fetch joined events.
  const fetchJoinedEvents = useCallback(async () => {
    if (!session?.user?.email) return;

    setLoading(true);
    setError(null);

    try {
      const token = await getTokenFromClient();

      const res = await fetch(
        `${API_URL}/joined-events?email=${encodeURIComponent(
          session.user.email
        )}`,
        {
          cache: "no-store",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (!res.ok) {
        throw new Error(
          `Failed to load joined events (Status: ${res.status})`
        );
      }

      const data = await res.json();

      if (data.success && Array.isArray(data.data)) {
        setJoinedEvents(data.data);
      } else {
        setJoinedEvents([]);
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not connect to the backend server."
      );
    } finally {
      setLoading(false);
    }
  }, [session?.user?.email]);

  useEffect(() => {
    if (session?.user?.email) {
      fetchJoinedEvents();
    }
  }, [session?.user?.email, fetchJoinedEvents]);

  // Cancel event registration.
  const handleCancelAttendance = async (item: JoinedEventItem) => {
    if (!session?.user?.email) return;

    const confirmed = window.confirm(
      `Are you sure you want to cancel your registration for "${item.eventTitle}"?`
    );

    if (!confirmed) return;

    setCancellingId(item._id);

    try {
      const token = await getTokenFromClient();

      const res = await fetch(
        `${API_URL}/joined-events/${item._id}?email=${encodeURIComponent(
          session.user.email
        )}`,
        {
          method: "DELETE",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        notify.error(
          "Cancellation Failed",
          data?.message || "Could not cancel attendance."
        );
        return;
      }

      setJoinedEvents((prev) =>
        prev.filter((event) => event._id !== item._id)
      );

      notify.success(
        "Attendance Cancelled",
        `You have left "${item.eventTitle}".`
      );
    } catch (err: unknown) {
      notify.error(
        "Network Error",
        err instanceof Error
          ? err.message
          : "Failed to cancel attendance."
      );
    } finally {
      setCancellingId(null);
    }
  };

  // Filter events based on selected tab.
  const filteredEvents = useMemo(() => {
    return joinedEvents.filter((event) => {
      if (!todayDate) return true;

      const isPast = event.eventDate < todayDate;

      if (activeTab === "upcoming") return !isPast;
      if (activeTab === "past") return isPast;

      return true;
    });
  }, [joinedEvents, activeTab, todayDate]);

  // Dashboard statistics.
  const stats = useMemo(() => {
    const total = joinedEvents.length;

    let upcoming = 0;
    let past = 0;

    if (todayDate) {
      joinedEvents.forEach((event) => {
        if (event.eventDate >= todayDate) {
          upcoming++;
        } else {
          past++;
        }
      });
    } else {
      upcoming = total;
    }

    return { total, upcoming, past };
  }, [joinedEvents, todayDate]);

  if (isPending) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950">
            <Loader2 className="h-7 w-7 animate-spin text-emerald-700 dark:text-emerald-400" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            Loading your events...
          </p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20 dark:bg-background">
      {/* Hero Section */}
      <section className="relative isolate overflow-hidden bg-[#073B2B] text-white">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -right-24 -top-36 h-[420px] w-[420px] rounded-full border border-emerald-300/10" />
          <div className="absolute -right-12 -top-24 h-[320px] w-[320px] rounded-full border border-emerald-300/10" />
          <div className="absolute -bottom-48 left-[35%] h-[420px] w-[420px] rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(16,185,129,0.18),transparent_35%)]" />
        </div>

        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="flex flex-col justify-between gap-10 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-100 backdrop-blur-sm">
                <HeartHandshake className="h-3.5 w-3.5" />
                VOLUNTEER DASHBOARD
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                Your Community
                <span className="mt-1 block text-emerald-300">
                  Journey Starts Here.
                </span>
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-7 text-emerald-50/75 sm:text-base">
                Keep track of the causes you support, manage your
                registrations, and stay connected with the community.
                Every little contribution makes a difference.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link href="/upcoming-events">
                  <Button className="h-11 gap-2 rounded-xl bg-emerald-400 px-5 font-semibold text-emerald-950 shadow-lg shadow-emerald-950/20 hover:bg-emerald-300">
                    <Sparkles className="h-4 w-4" />
                    Discover Events
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </Link>

                <Link href="/">
                  <Button
                    variant="outline"
                    className="h-11 rounded-xl border-white/20 bg-white/5 px-5 text-white hover:bg-white/10 hover:text-white"
                  >
                    Back to Home
                  </Button>
                </Link>
              </div>
            </div>

            {/* Hero Statistics */}
            <div className="grid w-full max-w-xl grid-cols-3 gap-2 sm:gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.08] p-3 backdrop-blur-md sm:p-5">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-300">
                  <TicketCheck className="h-4 w-4" />
                </div>
                <p className="text-[10px] font-medium text-emerald-100/70 sm:text-xs">
                  Total Joined
                </p>
                <p className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                  {stats.total}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.08] p-3 backdrop-blur-md sm:p-5">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-300">
                  <CalendarClock className="h-4 w-4" />
                </div>
                <p className="text-[10px] font-medium text-emerald-100/70 sm:text-xs">
                  Upcoming
                </p>
                <p className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                  {stats.upcoming}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.08] p-3 backdrop-blur-md sm:p-5">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <p className="text-[10px] font-medium text-emerald-100/70 sm:text-xs">
                  Completed
                </p>
                <p className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                  {stats.past}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-400">
              <Sparkles className="h-3.5 w-3.5" />
              Your participation
            </div>

            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              My Joined Events
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              All the community initiatives you have signed up for.
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-8 flex flex-wrap items-center gap-2 rounded-2xl border border-border/60 bg-card p-2 shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all sm:text-sm ${activeTab === "all"
                ? "bg-emerald-700 text-white shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
          >
            <TicketCheck className="h-4 w-4" />
            All Events
            <span
              className={`rounded-md px-1.5 py-0.5 text-[10px] ${activeTab === "all"
                  ? "bg-white/15 text-white"
                  : "bg-muted text-muted-foreground"
                }`}
            >
              {stats.total}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("upcoming")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all sm:text-sm ${activeTab === "upcoming"
                ? "bg-emerald-700 text-white shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
          >
            <CalendarClock className="h-4 w-4" />
            Upcoming
            <span
              className={`rounded-md px-1.5 py-0.5 text-[10px] ${activeTab === "upcoming"
                  ? "bg-white/15 text-white"
                  : "bg-muted text-muted-foreground"
                }`}
            >
              {stats.upcoming}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("past")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all sm:text-sm ${activeTab === "past"
                ? "bg-emerald-700 text-white shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            Completed
            <span
              className={`rounded-md px-1.5 py-0.5 text-[10px] ${activeTab === "past"
                  ? "bg-white/15 text-white"
                  : "bg-muted text-muted-foreground"
                }`}
            >
              {stats.past}
            </span>
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 flex flex-col justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-900/50 dark:bg-red-950/20 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300">
                <AlertCircle className="h-5 w-5" />
              </div>

              <div>
                <p className="font-semibold text-red-700 dark:text-red-300">
                  Could not load your joined events
                </p>
                <p className="mt-1 text-sm text-red-700/70 dark:text-red-300/70">
                  {error}
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchJoinedEvents}
              disabled={loading}
              className="shrink-0 gap-2 border-red-300 bg-white text-red-700 hover:bg-red-100 dark:border-red-900 dark:bg-transparent dark:text-red-300"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Try Again
            </Button>
          </div>
        )}

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card
                key={index}
                className="overflow-hidden rounded-2xl border-border/60"
              >
                <Skeleton className="h-52 w-full rounded-none" />

                <CardHeader className="space-y-3 p-5">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-6 w-4/5" />
                </CardHeader>

                <CardContent className="space-y-3 px-5 pb-5">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-9 w-full rounded-xl" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredEvents.length === 0 && (
          <div className="relative overflow-hidden rounded-3xl border border-dashed border-emerald-300/60 bg-white px-5 py-16 text-center shadow-sm dark:border-emerald-900/60 dark:bg-card sm:px-10">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-100/70 blur-3xl dark:bg-emerald-950/40" />
            <div className="absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-emerald-100/70 blur-3xl dark:bg-emerald-950/40" />

            <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              {activeTab === "past" ? (
                <CheckCircle2 className="h-10 w-10" />
              ) : (
                <HeartHandshake className="h-10 w-10" />
              )}
            </div>

            <div className="relative mt-6">
              <Badge className="border-0 bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300">
                {activeTab === "past"
                  ? "Your completed activities"
                  : "Your journey starts here"}
              </Badge>

              <h3 className="mt-4 text-xl font-bold tracking-tight sm:text-2xl">
                {activeTab === "upcoming"
                  ? "No Upcoming Events"
                  : activeTab === "past"
                    ? "No Completed Events Yet"
                    : "You Haven't Joined Any Events"}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                {activeTab === "upcoming"
                  ? "You don't have any upcoming events. Discover new opportunities and get involved in your community."
                  : activeTab === "past"
                    ? "Your completed event history will appear here after you participate in community initiatives."
                    : "Find meaningful community initiatives, connect with volunteers, and become part of something positive."}
              </p>

              <Link href="/upcoming-events" className="mt-7 inline-flex">
                <Button className="h-11 gap-2 rounded-xl bg-emerald-700 px-5 text-white hover:bg-emerald-800">
                  <Sparkles className="h-4 w-4" />
                  Explore Upcoming Events
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Joined Event Cards */}
        {!loading && !error && filteredEvents.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((item) => {
              const isPast = Boolean(
                todayDate && item.eventDate < todayDate
              );

              const isCancelling = cancellingId === item._id;

              return (
                <Card
                  key={item._id}
                  className={`group flex flex-col overflow-hidden rounded-2xl border bg-card py-0 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-950/5 ${isPast
                      ? "border-border/60"
                      : "border-border/70 hover:border-emerald-600/40"
                    }`}
                >
                  {/* Event Image */}
                  <div className="relative h-52 overflow-hidden bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.thumbnailURL || DEFAULT_EVENT_IMAGE}
                      alt={item.eventTitle}
                      referrerPolicy="no-referrer"
                      className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 ${isPast ? "grayscale-[25%]" : ""
                        }`}
                      onError={(e) => {
                        const image = e.currentTarget;

                        if (!image.src.includes("photo-1559027615")) {
                          image.src = DEFAULT_EVENT_IMAGE;
                        }
                      }}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-black/20" />

                    {/* Event Category */}
                    <div className="absolute left-4 top-4">
                      <Badge className="border border-white/30 bg-white/90 text-xs font-semibold text-slate-800 shadow-sm backdrop-blur-md hover:bg-white/90">
                        <Tag className="mr-1.5 h-3 w-3 text-emerald-700" />
                        {formatEventType(item.eventType)}
                      </Badge>
                    </div>

                    {/* Event Status */}
                    <div className="absolute right-4 top-4">
                      <Badge
                        className={
                          isPast
                            ? "border border-white/20 bg-slate-800/80 text-white shadow-sm backdrop-blur-md hover:bg-slate-800/80"
                            : "border border-emerald-300/30 bg-emerald-500/90 text-white shadow-sm backdrop-blur-md hover:bg-emerald-500/90"
                        }
                      >
                        {isPast ? (
                          <Clock className="mr-1 h-3 w-3" />
                        ) : (
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                        )}
                        {isPast ? "Completed" : "Attending"}
                      </Badge>
                    </div>

                    {/* Event Date */}
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-white/70">
                        Event date
                      </p>

                      <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold">
                        <CalendarDays className="h-4 w-4 shrink-0" />
                        <span>{formatEventDate(item.eventDate)}</span>
                      </p>
                    </div>
                  </div>

                  {/* Event Information */}
                  <CardHeader className="space-y-2 px-5 pb-2 pt-5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Registration Confirmed
                    </div>

                    <CardTitle className="line-clamp-1 text-lg font-bold tracking-tight transition-colors group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                      {item.eventTitle}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="flex flex-1 flex-col px-5 pb-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-400" />
                      <span className="truncate">{item.location}</span>
                    </div>

                    {item.joinedAt && (
                      <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs">
                        <span className="text-muted-foreground">
                          Registered on
                        </span>

                        <span className="font-medium text-foreground">
                          {formatJoinedDate(item.joinedAt)}
                        </span>
                      </div>
                    )}
                  </CardContent>

                  {/* Card Actions */}
                  <CardFooter className="flex items-center gap-2.5 border-t border-border/60 bg-muted/20 p-4">
                    <Link
                      href={`/events/${item.eventId}`}
                      className="min-w-0 flex-1"
                    >
                      <Button className="group/btn h-11 w-full justify-between rounded-xl bg-gradient-to-r from-emerald-700 to-emerald-600 px-4 text-sm font-semibold text-white shadow-md shadow-emerald-900/10 transition-all duration-300 hover:-translate-y-0.5 hover:from-emerald-800 hover:to-emerald-700 hover:shadow-lg hover:shadow-emerald-900/20">
                        <span>View Details</span>

                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15 transition-all duration-300 group-hover/btn:translate-x-1 group-hover/btn:bg-white/25">
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      </Button>
                    </Link>

                    {!isPast && (
                      <Button
                        variant="outline"
                        size="icon"
                        title="Cancel Attendance"
                        aria-label={`Cancel registration for ${item.eventTitle}`}
                        disabled={isCancelling}
                        onClick={() => handleCancelAttendance(item)}
                        className="h-11 w-11 shrink-0 rounded-xl border-red-200 bg-background text-red-600 transition-all duration-200 hover:border-red-300 hover:bg-red-50 hover:text-red-700 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
                      >
                        {isCancelling ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
