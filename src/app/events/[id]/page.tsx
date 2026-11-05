"use client";
import { useEffect, useState, use, useSyncExternalStore, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  MapPin,
  Tag,
  ArrowLeft,
  Users,
  CheckCircle2,
  HeartHandshake,
  Clock,
  Mail,
  Loader2,
  Share2,
  AlertCircle,
} from "lucide-react";

import { useSession } from "@/lib/auth-client";
import { notify } from "@/lib/notify";
import { getTokenFromClient } from "@/lib/getTokenFromClient";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { EventItem } from "@/app/upcoming-events/page";

const DEFAULT_EVENT_IMAGE =
  "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1200&q=80";

function formatFullDate(dateString: string) {
  try {
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

const emptySubscribe = () => () => {};

function EventDetailsSkeleton() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <Skeleton className="h-8 w-36 mb-6" />
      <Skeleton className="h-96 w-full rounded-2xl mb-8" />
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-32 w-full" />
        </div>
        <div>
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function EventDetailsContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const eventId = resolvedParams.id;

  const { data: session } = useSession();

  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [hasJoined, setHasJoined] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const todayDate = useSyncExternalStore(
    emptySubscribe,
    () => new Date().toISOString().split("T")[0],
    () => ""
  );

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    let ignore = false;

    async function loadEvent() {
      setError(null);
      try {
        const res = await fetch(`${apiUrl}/events/${eventId}`, {
          cache: "no-store",
        });
        if (!res.ok) {
          if (res.status === 404) throw new Error("Event not found.");
          throw new Error("Failed to load event details.");
        }
        const data = await res.json();
        if (!ignore) {
          if (data.success && data.data) {
            setEvent(data.data);
          } else {
            throw new Error("Event not found.");
          }
        }
      } catch (err: unknown) {
        if (!ignore) {
          setError(
            err instanceof Error ? err.message : "Could not fetch event."
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    if (eventId) {
      loadEvent();
    }

    return () => {
      ignore = true;
    };
  }, [eventId, apiUrl]);

  useEffect(() => {
    async function checkJoinStatus() {
      if (!session?.user?.email || !eventId) return;
      try {
        const res = await fetch(
          `${apiUrl}/events/${eventId}/join-status?email=${encodeURIComponent(
            session.user.email
          )}`
        );
        const data = await res.json();
        if (data.success && data.joined) {
          setHasJoined(true);
        }
      } catch {
      }
    }

    checkJoinStatus();
  }, [session, eventId, apiUrl]);

  const handleJoinEvent = async () => {
    if (!session?.user) {
      notify.warning(
        "Sign In Required",
        "Please sign in with your account to join this community event."
      );
      router.push("/login");
      return;
    }

    if (hasJoined) return;

    setIsJoining(true);
    try {
      const token = await getTokenFromClient();
      const res = await fetch(`${apiUrl}/events/${eventId}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          userEmail: session.user.email,
          userName: session.user.name || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        notify.error("Could Not Join", data?.message || "Failed to join event.");
        setIsJoining(false);
        return;
      }

      setHasJoined(true);
      if (event) {
        setEvent({
          ...event,
          joinedCount: (event.joinedCount || 0) + 1,
        });
      }

      notify.success(
        "Joined Successfully! 🎉",
        "You are now registered for this event. You can see it in 'Joined Events'."
      );
    } catch (err: unknown) {
      notify.error(
        "Network Error",
        err instanceof Error ? err.message : "Failed to join the event."
      );
    } finally {
      setIsJoining(false);
    }
  };

  const handleShare = async () => {
    if (typeof window !== "undefined") {
      try {
        await navigator.clipboard.writeText(window.location.href);
        notify.success("Link Copied!", "Event link copied to your clipboard.");
      } catch {
        notify.info("Share URL", window.location.href);
      }
    }
  };

  if (loading) {
    return <EventDetailsSkeleton />;
  }

  if (error || !event) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-destructive/10 text-destructive mb-4">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Event Not Found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {error || "The event you are looking for does not exist or may have been removed."}
        </p>
        <div className="mt-6">
          <Link href="/upcoming-events">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Upcoming Events
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isPastEvent = Boolean(todayDate && event.eventDate < todayDate);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/30 via-background to-background dark:from-emerald-950/15 dark:via-background dark:to-background pb-20">
      <div className="border-b bg-background/80 backdrop-blur-md sticky top-16 z-30">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link
            href="/upcoming-events"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-emerald-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Upcoming Events
          </Link>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <Share2 className="h-3.5 w-3.5" />
            Share Event
          </Button>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="relative h-72 sm:h-96 md:h-[420px] w-full overflow-hidden rounded-2xl bg-muted border border-border/80 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={event.thumbnailURL || DEFAULT_EVENT_IMAGE}
            alt={event.title}
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = DEFAULT_EVENT_IMAGE;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <Badge className="bg-white/90 text-emerald-950 backdrop-blur-md font-bold uppercase tracking-wider text-xs px-3 py-1 shadow-md">
              <Tag className="h-3 w-3 mr-1 text-emerald-700" />
              {event.eventType}
            </Badge>

            {hasJoined && (
              <Badge className="bg-emerald-600 text-white font-semibold text-xs px-3 py-1 shadow-md gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                You&apos;re Attending
              </Badge>
            )}
          </div>

          <div className="absolute bottom-6 left-6 right-6 text-white">
            <div className="inline-flex items-center gap-2 text-emerald-300 text-sm font-semibold mb-2">
              <CalendarDays className="h-4 w-4" />
              {formatFullDate(event.eventDate)}
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight drop-shadow-sm">
              {event.title}
            </h1>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-card p-4 shadow-xs">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Date</p>
                  <p className="text-sm font-bold text-foreground mt-0.5">
                    {formatFullDate(event.eventDate)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-card p-4 shadow-xs">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Location</p>
                  <p className="text-sm font-bold text-foreground mt-0.5">
                    {event.location}
                  </p>
                </div>
              </div>
            </div>

            <Card className="border-border/70 shadow-xs">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <HeartHandshake className="h-5 w-5 text-emerald-700" />
                  About This Event
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground whitespace-pre-line">
                  {event.description}
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/70 shadow-xs">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Mail className="h-4 w-4 text-emerald-700" />
                  Event Organizer
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-bold text-lg dark:bg-emerald-950 dark:text-emerald-300">
                  {event.creatorName
                    ? event.creatorName.charAt(0).toUpperCase()
                    : event.creatorEmail.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold">
                    {event.creatorName || "Community Member"}
                  </p>
                  <p className="text-xs text-muted-foreground">{event.creatorEmail}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-32 space-y-4">
              <Card className="border-border/80 shadow-md overflow-hidden">
                <div className="h-2 bg-emerald-700 w-full" />
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      Volunteers
                    </span>
                    <Badge variant="outline" className="gap-1 text-xs font-semibold">
                      <Users className="h-3 w-3 text-emerald-700" />
                      {event.joinedCount || 0} Joined
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-bold mt-2">
                    Join This Social Cause
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4 pb-6">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Make a real difference in your community. Log in to join this event
                    and connect with fellow volunteers.
                  </p>

                  {isPastEvent ? (
                    <div className="rounded-lg bg-muted p-3 text-center">
                      <p className="text-xs font-semibold text-muted-foreground flex items-center justify-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        This event date has already passed.
                      </p>
                    </div>
                  ) : hasJoined ? (
                    <div className="space-y-2">
                      <Button
                        disabled
                        className="w-full bg-emerald-700 text-white gap-2 font-semibold"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        You Have Joined This Event
                      </Button>
                      <p className="text-[11px] text-center text-muted-foreground">
                        You can track this event in your{" "}
                        <Link
                          href="/joined-events"
                          className="text-emerald-700 hover:underline font-medium"
                        >
                          Joined Events
                        </Link>{" "}
                        page.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Button
                        onClick={handleJoinEvent}
                        disabled={isJoining}
                        className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold gap-2 h-11 text-sm shadow-sm"
                      >
                        {isJoining ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Joining Event...
                          </>
                        ) : (
                          <>
                            <HeartHandshake className="h-4 w-4" />
                            Join Event
                          </>
                        )}
                      </Button>

                      {!session?.user && (
                        <p className="text-[11px] text-center text-muted-foreground">
                          Login is required to register as an attendee.
                        </p>
                      )}
                    </div>
                  )}

                  <div className="pt-3 border-t border-border/60 text-[11px] text-muted-foreground space-y-1.5">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                      <span>Free participation for all community members</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                      <span>Direct coordination with the organizer</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function EventDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<EventDetailsSkeleton />}>
      <EventDetailsContent params={params} />
    </Suspense>
  );
}

