"use client";
import { useEffect, useState, useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  MapPin,
  Tag,
  ArrowRight,
  CheckCircle2,
  CalendarCheck2,
  Trash2,
  Loader2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Clock,
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
  _id: string; // Registration document ID
  eventId: string; // Associated event MongoDB ID
  eventTitle: string;
  eventDate: string; // YYYY-MM-DD
  eventType: string;
  location: string;
  thumbnailURL: string | null;
  userEmail: string;
  userName?: string | null;
  joinedAt?: string;
}

const DEFAULT_EVENT_IMAGE =
  "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=800&q=80";

const emptySubscribe = () => () => {};

function formatEventDate(dateString: string) {
  try {
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

function formatJoinedDate(isoString?: string) {
  if (!isoString) return null;
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return null;
  }
}
export default function JoinedEventsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [joinedEvents, setJoinedEvents] = useState<JoinedEventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"all" | "upcoming" | "past">("all");

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const todayDate = useSyncExternalStore(
    emptySubscribe,
    () => new Date().toISOString().split("T")[0],
    () => ""
  );

  useEffect(() => {
    if (!isPending && !session) {
      notify.error("Authentication Required", "Please sign in to view your joined events.");
      router.push("/login");
    }
  }, [session, isPending, router]);

  const fetchJoinedEvents = async () => {
    if (!session?.user?.email) return;
    setLoading(true);
    setError(null);
    try {
      const token = await getTokenFromClient();
      const res = await fetch(
        `${apiUrl}/joined-events?email=${encodeURIComponent(session.user.email)}`,
        {
          cache: "no-store",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      if (!res.ok) {
        throw new Error(`Failed to load joined events (Status: ${res.status})`);
      }
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setJoinedEvents(data.data);
      } else {
        setJoinedEvents([]);
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Could not connect to the backend server."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    async function load() {
      if (!session?.user?.email) return;
      setError(null);
      try {
        const token = await getTokenFromClient();
        const res = await fetch(
          `${apiUrl}/joined-events?email=${encodeURIComponent(session.user.email)}`,
          {
            cache: "no-store",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );
        if (!res.ok) {
          throw new Error(`Failed to load joined events (Status: ${res.status})`);
        }
        const data = await res.json();
        if (!ignore) {
          if (data.success && Array.isArray(data.data)) {
            setJoinedEvents(data.data);
          } else {
            setJoinedEvents([]);
          }
        }
      } catch (err: unknown) {
        if (!ignore) {
          setError(
            err instanceof Error ? err.message : "Could not connect to the backend server."
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    if (session?.user?.email) {
      load();
    }

    return () => {
      ignore = true;
    };
  }, [session, apiUrl]);

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
        `${apiUrl}/joined-events/${item._id}?email=${encodeURIComponent(
          session.user.email
        )}`,
        {
          method: "DELETE",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      const data = await res.json();

      if (!res.ok) {
        notify.error("Cancellation Failed", data?.message || "Could not cancel attendance.");
        setCancellingId(null);
        return;
      }

      setJoinedEvents((prev) => prev.filter((ev) => ev._id !== item._id));
      notify.success(
        "Attendance Cancelled",
        `You have left "${item.eventTitle}".`
      );
    } catch (err: unknown) {
      notify.error(
        "Network Error",
        err instanceof Error ? err.message : "Failed to cancel attendance."
      );
    } finally {
      setCancellingId(null);
    }
  };

  const filteredEvents = useMemo(() => {
    return joinedEvents.filter((ev) => {
      if (!todayDate) return true;
      const isPast = ev.eventDate < todayDate;
      if (activeTab === "upcoming") return !isPast;
      if (activeTab === "past") return isPast;
      return true;
    });
  }, [joinedEvents, activeTab, todayDate]);

  const stats = useMemo(() => {
    const total = joinedEvents.length;
    let upcoming = 0;
    let past = 0;
    if (todayDate) {
      joinedEvents.forEach((ev) => {
        if (ev.eventDate >= todayDate) upcoming++;
        else past++;
      });
    } else {
      upcoming = total;
    }
    return { total, upcoming, past };
  }, [joinedEvents, todayDate]);

  if (isPending) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-700" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/40 via-background to-background dark:from-emerald-950/15 dark:via-background dark:to-background pb-20">
      <section className="border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 mb-3">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Volunteer Hub
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                My Joined Events
              </h1>
              <p className="mt-1.5 text-sm sm:text-base text-muted-foreground">
                All community events you have registered to attend, sorted chronologically by date.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/upcoming-events">
                <Button className="bg-emerald-700 hover:bg-emerald-800 text-white font-medium gap-2 shadow-sm text-xs sm:text-sm">
                  <Sparkles className="h-4 w-4" />
                  Explore More Events
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-4 max-w-2xl">
            <div className="rounded-xl border border-border/70 bg-card p-3 sm:p-4 text-center">
              <p className="text-xs text-muted-foreground font-medium">Total Joined</p>
              <p className="text-xl sm:text-2xl font-extrabold text-foreground mt-1">
                {stats.total}
              </p>
            </div>
            <div className="rounded-xl border border-emerald-700/20 bg-emerald-50/50 dark:bg-emerald-950/30 p-3 sm:p-4 text-center">
              <p className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                Upcoming
              </p>
              <p className="text-xl sm:text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-1">
                {stats.upcoming}
              </p>
            </div>
            <div className="rounded-xl border border-border/70 bg-card p-3 sm:p-4 text-center">
              <p className="text-xs text-muted-foreground font-medium">Completed</p>
              <p className="text-xl sm:text-2xl font-extrabold text-foreground mt-1">
                {stats.past}
              </p>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-2 border-t border-border/60 pt-4">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                activeTab === "all"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              All Events ({stats.total})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("upcoming")}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                activeTab === "upcoming"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              Upcoming ({stats.upcoming})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("past")}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                activeTab === "past"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              Past ({stats.past})
            </button>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-8 rounded-xl border border-destructive/30 bg-destructive/10 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
              <div>
                <p className="text-sm font-semibold text-destructive">
                  Could not load your joined events
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{error}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchJoinedEvents}
              className="gap-2 border-destructive/40 text-destructive hover:bg-destructive/10 shrink-0"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </Button>
          </div>
        )}

        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <Card key={idx} className="overflow-hidden border border-border/60">
                <Skeleton className="h-44 w-full rounded-none" />
                <CardHeader className="space-y-2 pb-2">
                  <Skeleton className="h-4 w-28 rounded-full" />
                  <Skeleton className="h-6 w-3/4 rounded" />
                </CardHeader>
                <CardContent className="space-y-2 pb-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
                <CardFooter className="pt-2">
                  <Skeleton className="h-9 w-full rounded-md" />
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
        {!loading && !error && filteredEvents.length === 0 && (
          <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/20 px-6 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 mb-4">
              <CalendarCheck2 className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold tracking-tight">No Events Found</h3>
            <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
              {activeTab === "upcoming"
                ? "You do not have any upcoming joined events scheduled."
                : activeTab === "past"
                ? "No completed events yet."
                : "You haven't joined any social development events yet. Discover causes in your community and sign up to participate!"}
            </p>
            <div className="mt-6 flex gap-3">
              <Link href="/upcoming-events">
                <Button className="bg-emerald-700 hover:bg-emerald-800 text-white gap-2 text-xs">
                  <Sparkles className="h-4 w-4" />
                  Browse Upcoming Events
                </Button>
              </Link>
            </div>
          </div>
        )}

        {!loading && !error && filteredEvents.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((item) => {
              const isPast = Boolean(todayDate && item.eventDate < todayDate);
              const isCancelling = cancellingId === item._id;

              return (
                <Card
                  key={item._id}
                  className={`group flex flex-col overflow-hidden border transition-all duration-300 hover:shadow-md ${
                    isPast
                      ? "border-border/50 bg-muted/20 opacity-80"
                      : "border-border/70 hover:border-emerald-700/40"
                  }`}
                >
                  <div className="relative h-44 w-full overflow-hidden bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.thumbnailURL || DEFAULT_EVENT_IMAGE}
                      alt={item.eventTitle}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = DEFAULT_EVENT_IMAGE;
                      }}
                    />

                    <div className="absolute top-3 left-3">
                      <Badge className="bg-background/90 text-foreground backdrop-blur-md border border-border/40 font-semibold capitalize text-[11px] shadow-sm">
                        <Tag className="h-3 w-3 mr-1 text-emerald-700" />
                        {item.eventType}
                      </Badge>
                    </div>

                    <div className="absolute top-3 right-3">
                      {isPast ? (
                        <Badge
                          variant="secondary"
                          className="bg-muted text-muted-foreground text-[10px] gap-1"
                        >
                          <Clock className="h-3 w-3" />
                          Completed
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-700 text-white text-[10px] gap-1 shadow-sm">
                          <CheckCircle2 className="h-3 w-3" />
                          Attending
                        </Badge>
                      )}
                    </div>
                  </div>

                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                      <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                      <span>{formatEventDate(item.eventDate)}</span>
                    </div>

                    <CardTitle className="text-base font-bold line-clamp-1 group-hover:text-emerald-700 transition-colors">
                      {item.eventTitle}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-2.5 flex-1 pb-4">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-700" />
                      <span className="truncate">{item.location}</span>
                    </div>

                    {item.joinedAt && (
                      <p className="text-[11px] text-muted-foreground/80 pt-1 border-t border-border/40">
                        Registered on {formatJoinedDate(item.joinedAt)}
                      </p>
                    )}
                  </CardContent>

                  <CardFooter className="flex items-center gap-2 pt-0">
                    <Link
                      href={`/events/${item.eventId}`}
                      className="flex-1"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-between text-xs font-medium group-hover:bg-emerald-700 group-hover:text-white group-hover:border-emerald-700 transition-all"
                      >
                        <span>View Details</span>
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>

                    {!isPast && (
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Cancel Attendance"
                        disabled={isCancelling}
                        onClick={() => handleCancelAttendance(item)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                      >
                        {isCancelling ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
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
