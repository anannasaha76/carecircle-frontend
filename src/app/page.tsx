
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  HeartHandshake,
  CalendarDays,
  MapPin,
  ArrowRight,
  ArrowUpRight,
  Tag,
  Users,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Globe2,
  PlusCircle,
  AlertCircle,
  RefreshCw,
  Camera,
  Mail,
} from "lucide-react";

import { useSession } from "@/lib/auth-client";

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
import { Input } from "@/components/ui/input";
import type { EventItem } from "@/app/upcoming-events/page";

/* ------------------------------------------------------------------ */
/* Static Data                                                         */
/* ------------------------------------------------------------------ */

const DEFAULT_EVENT_IMAGE =
  "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=800&q=80";

const FEATURES = [
  {
    icon: Globe2,
    title: "Community-Driven Organizing",
    description:
      "Anyone can spearhead a social initiative in their neighborhood — from winter clothes distribution to park cleanups and health camps.",
  },
  {
    icon: Users,
    title: "Easy Volunteer Joining",
    description:
      "Discover meaningful events and join instantly. Keep track of the activities you are attending through your personalized dashboard.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Event Management",
    description:
      "Organizers maintain responsibility for their causes, with the ability to update event details and manage registrations securely.",
  },
  {
    icon: TrendingUp,
    title: "Real Community Impact",
    description:
      "Every volunteer counts. Participant counters showcase the collective strength of neighbors helping neighbors.",
  },
];

const GALLERY_PHOTOS = [
  {
    title: "Blanket & Warm Clothes Distribution",
    location: "Mohammadpur, Dhaka",
    category: "Donation",
    image:
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Urban Tree Plantation Drive",
    location: "Rajshahi Sadar, Rajshahi",
    category: "Plantation",
    image:
      "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Neighborhood Cleanliness Campaign",
    location: "Dhanmondi Lake, Dhaka",
    category: "Cleanup",
    image:
      "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Nutritious Food Drive for Children",
    location: "Zindabazar, Sylhet",
    category: "Food Drive",
    image:
      "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Free Community Health & Medical Camp",
    location: "Sadar Road, Barishal",
    category: "Medical",
    image:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Weekend Youth Mentorship & Books",
    location: "Cox's Bazar Sadar, Cox's Bazar",
    category: "Education",
    image:
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80",
  },
];

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

/* ------------------------------------------------------------------ */
/* Home Page Component                                                 */
/* ------------------------------------------------------------------ */

export default function HomePage() {
  const { data: session } = useSession();

  const [recentEvents, setRecentEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Redirect users to login if they are not authenticated.
  const createEventHref = session?.user
    ? "/create-event"
    : "/login?redirect=%2Fcreate-event";

  /* Fetch recent upcoming events */
  const fetchRecentEvents = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${apiUrl}/events/recent`, {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(
          `Failed to load recent events (Status: ${res.status})`
        );
      }

      const data = await res.json();

      if (data.success && Array.isArray(data.data)) {
        setRecentEvents(data.data);
      } else {
        setRecentEvents([]);
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not reach the server."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    async function load() {
      setError(null);

      try {
        const res = await fetch(`${apiUrl}/events/recent`, {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(
            `Failed to load recent events (Status: ${res.status})`
          );
        }

        const data = await res.json();

        if (!ignore) {
          if (data.success && Array.isArray(data.data)) {
            setRecentEvents(data.data);
          } else {
            setRecentEvents([]);
          }
        }
      } catch (err: unknown) {
        if (!ignore) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not reach the server."
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, [apiUrl]);

  return (
    <div className="flex min-h-screen flex-col">

      {/* ========================================================== */}
      {/* 1. HERO / BANNER SECTION                                   */}
      {/* ========================================================== */}

      <section className="relative overflow-hidden border-b bg-gradient-to-b from-emerald-50/60 via-background to-background py-16 dark:from-emerald-950/20 dark:via-background dark:to-background sm:py-24">

        <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-100/40 blur-3xl dark:bg-emerald-950/20" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">

            {/* Left Column */}
            <div className="space-y-6 text-center lg:col-span-7 lg:text-left">

              <h1 className="text-4xl font-extrabold leading-[1.15] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Small Actions,{" "}
                <span className="text-emerald-700">
                  Big Impact
                </span>{" "}
                For Our Communities.
              </h1>

              <p className="mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg lg:mx-0">
                CareCircle brings communities together to make a
                meaningful difference through volunteerism and social
                action. Discover local initiatives, organize
                community-driven events, and join hands with people
                who care. Whether it&apos;s supporting underprivileged
                families, cleaning public spaces, or planting trees,
                every small effort helps build a better tomorrow.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col items-center justify-center gap-3.5 pt-2 sm:flex-row lg:justify-start">

                <Link href="/upcoming-events">
                  <Button className="h-12 w-full gap-2 bg-emerald-700 px-6 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800 sm:w-auto">
                    <CalendarDays className="h-4 w-4" />
                    Explore Upcoming Events
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>

                <Link href={createEventHref}>
                  <Button
                    variant="outline"
                    className="h-12 w-full gap-2 border-emerald-700/30 px-6 text-sm font-semibold text-emerald-800 transition-all hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/50 sm:w-auto"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Organize an Event
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </Link>

              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center justify-center gap-6 border-t border-border/60 pt-6 text-xs text-muted-foreground lg:justify-start">

                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    ✓
                  </div>
                  <span className="font-medium text-foreground">
                    100% Free & Open RSVP
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    ✓
                  </div>
                  <span className="font-medium text-foreground">
                    Verified Local Organizers
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    ✓
                  </div>
                  <span className="font-medium text-foreground">
                    Real-Time Attendee Tracking
                  </span>
                </div>

              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">

                <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-xl">

                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1000&q=80"
                    alt="Community volunteers distributing food and essentials"
                    className="h-80 w-full object-cover sm:h-96"
                  />

                  <div className="space-y-3 p-5">

                    <div className="flex items-center justify-between">
                      <Badge className="bg-emerald-100 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        Recent Milestone
                      </Badge>

                      <span className="text-xs text-muted-foreground">
                        Dhaka, Bangladesh
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-foreground">
                      Winter Clothes & Blanket Drive 2026
                    </h3>

                    <p className="text-xs leading-relaxed text-muted-foreground">
                      Over 350 warm blankets and winter garments
                      provided to underprivileged families across
                      Mirpur and Mohammadpur through grassroots
                      volunteer action.
                    </p>

                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================== */}
      {/* 2. FEATURES SECTION - REDESIGNED                            */}
      {/* ========================================================== */}

      <section className="relative overflow-hidden border-b bg-muted/20 py-24">

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* Section Heading */}
          <div className="mb-14 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

            <div className="max-w-2xl space-y-3">

              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                <Sparkles className="h-3.5 w-3.5" />
                Why CareCircle
              </span>

              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                Making Community Service{" "}
                <span className="text-emerald-700">
                  Simple and Meaningful.
                </span>
              </h2>

              <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
                Everything you need to bring people together,
                organize local initiatives, and turn small acts of
                kindness into lasting impact.
              </p>

            </div>


          </div>

          {/* Feature Cards */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

            {FEATURES.map((feat, idx) => {
              const Icon = feat.icon;

              return (
                <div
                  key={feat.title}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card p-6 transition-all duration-300 hover:-translate-y-2 hover:border-emerald-700/40 hover:shadow-xl"
                >

                  <div className="flex items-center justify-between">

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 transition-all duration-300 group-hover:bg-emerald-700 group-hover:text-white dark:bg-emerald-950 dark:text-emerald-300">
                      <Icon className="h-6 w-6" />
                    </div>

                    <span className="text-3xl font-black text-muted-foreground/20 transition-colors group-hover:text-emerald-700/30">
                      0{idx + 1}
                    </span>

                  </div>

                  <div className="mt-8 flex-1 space-y-3">

                    <h3 className="text-lg font-bold transition-colors group-hover:text-emerald-700">
                      {feat.title}
                    </h3>

                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {feat.description}
                    </p>

                  </div>

                  <div className="mt-6 h-1 w-10 rounded-full bg-emerald-700 transition-all duration-300 group-hover:w-full" />

                </div>
              );
            })}

          </div>
        </div>
      </section>


      {/* ========================================================== */}
      {/* RECENT UPCOMING EVENTS SECTION */}
      {/* ========================================================== */}

      <section className="border-b bg-muted/20 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* Section Heading */}
          <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-xl space-y-2">
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                Recent Upcoming Events
              </h2>

              <p className="text-sm text-muted-foreground">
                Hand-picked upcoming social causes created by our
                community members. Join in to make a difference.
              </p>
            </div>

            <Link href="/upcoming-events">
              <Button
                variant="outline"
                className="group h-11 gap-2 rounded-full border-emerald-700/30 px-5 text-sm font-semibold transition-all hover:border-emerald-700 hover:bg-emerald-700 hover:text-white"
              >
                View All Upcoming Events
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="mb-8 flex flex-col items-center justify-between gap-4 rounded-xl border border-destructive/30 bg-destructive/10 p-5 sm:flex-row">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />

                <div>
                  <p className="text-sm font-semibold text-destructive">
                    Could not fetch recent events
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {error}
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={fetchRecentEvents}
                className="shrink-0 gap-2 border-destructive/40 text-destructive hover:bg-destructive/10"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Retry
              </Button>
            </div>
          )}

          {/* Loading Skeletons */}
          {loading && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <Card
                  key={idx}
                  className="overflow-hidden rounded-2xl border-0 shadow-sm"
                >
                  <Skeleton className="h-52 w-full rounded-none" />

                  <CardHeader className="space-y-3 pb-2">
                    <Skeleton className="h-4 w-28 rounded-full" />
                    <Skeleton className="h-6 w-3/4 rounded" />
                  </CardHeader>

                  <CardContent className="space-y-2 pb-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>

                  <CardFooter>
                    <Skeleton className="h-11 w-full rounded-xl" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && recentEvents.length === 0 && (
            <div className="flex min-h-[30vh] flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card px-6 py-12 text-center">
              <CalendarDays className="mb-3 h-10 w-10 text-emerald-700" />

              <h3 className="text-base font-bold text-foreground">
                No Upcoming Events Right Now
              </h3>

              <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                Be the very first community organizer to schedule
                a social development event!
              </p>

              <div className="mt-4">
                <Link href={createEventHref}>
                  <Button className="gap-2 bg-emerald-700 text-xs font-semibold text-white hover:bg-emerald-800">
                    <PlusCircle className="h-4 w-4" />
                    Create An Event
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Event Cards */}
          {!loading && !error && recentEvents.length > 0 && (
            <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {recentEvents.map((event) => (
                <Card
                  key={event._id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-700/30 hover:shadow-xl"
                >
                  {/* Event Image */}
                  <div className="relative h-52 w-full overflow-hidden bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={event.thumbnailURL || DEFAULT_EVENT_IMAGE}
                      alt={event.title}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          DEFAULT_EVENT_IMAGE;
                      }}
                    />

                    {/* Image Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />

                    {/* Event Type */}
                    <div className="absolute left-4 top-4">
                      <Badge className="rounded-full border border-white/30 bg-white/95 px-3 py-1 text-[11px] font-bold capitalize text-emerald-800 shadow-sm backdrop-blur-md">
                        <Tag className="mr-1.5 h-3 w-3" />
                        {event.eventType}
                      </Badge>
                    </div>

                    {/* Joined Count */}
                    {event.joinedCount !== undefined &&
                      event.joinedCount > 0 && (
                        <div className="absolute bottom-4 right-4">
                          <Badge className="rounded-full border border-white/20 bg-emerald-700/95 px-3 py-1 text-[11px] font-semibold text-white shadow-md backdrop-blur-md">
                            <Users className="mr-1.5 h-3 w-3" />
                            {event.joinedCount} Joined
                          </Badge>
                        </div>
                      )}
                  </div>

                  {/* Event Information */}
                  <CardHeader className="space-y-3 px-5 pb-2 pt-5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/60">
                        <CalendarDays className="h-4 w-4" />
                      </span>

                      {formatEventDate(event.eventDate)}
                    </div>

                    <CardTitle className="line-clamp-1 text-lg font-bold tracking-tight transition-colors group-hover:text-emerald-700">
                      {event.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="flex-1 space-y-4 px-5 pb-5 pt-2">
                    <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                      {event.description}
                    </p>

                    <div className="flex items-center gap-2 border-t border-border/60 pt-4 text-xs text-muted-foreground">
                      <MapPin className="h-4 w-4 shrink-0 text-emerald-700" />
                      <span className="truncate">
                        {event.location}
                      </span>
                    </div>
                  </CardContent>

                  {/* View Event Button */}
                  <CardFooter className="px-5 pb-5 pt-0">
                    <Link
                      href={`/events/${event._id}`}
                      className="group/button flex w-full items-center justify-between rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition-all duration-300 hover:bg-emerald-800 hover:shadow-md"
                    >
                      <span>View Event</span>

                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 transition-transform duration-300 group-hover/button:translate-x-1">
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>


      {/* ========================================================== */}
      {/* 4. GALLERY SECTION                                         */}
      {/* ========================================================== */}

      <section className="border-b bg-background py-20">

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="mx-auto mb-14 max-w-2xl space-y-3 text-center">

            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700">
              <Camera className="h-4 w-4" />
              Community Moments
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Photographs From the Field
            </h2>

            <p className="text-sm leading-relaxed text-muted-foreground">
              Real snapshots of volunteers in action across tree
              plantations, winter clothing drives, health checks,
              and youth mentoring.
            </p>

          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {GALLERY_PHOTOS.map((photo, idx) => (
              <div
                key={idx}
                className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card shadow-xs transition-all duration-300 hover:shadow-xl"
              >

                <div className="relative h-64 w-full overflow-hidden bg-muted">

                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.image}
                    alt={photo.title}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-80 transition-opacity group-hover:opacity-90" />

                  {/* Category Badge */}
                  <div className="absolute left-3 top-3">
                    <Badge className="bg-white/90 text-[11px] font-semibold text-emerald-950 backdrop-blur-md">
                      {photo.category}
                    </Badge>
                  </div>

                  {/* Caption */}
                  <div className="absolute bottom-4 left-4 right-4 space-y-1 text-white">

                    <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-300">
                      <MapPin className="h-3 w-3" />
                      <span>{photo.location}</span>
                    </div>

                    <h3 className="text-sm font-bold leading-tight sm:text-base">
                      {photo.title}
                    </h3>

                  </div>
                </div>

              </div>
            ))}

          </div>
        </div>
      </section>

      {/* ========================================================== */}
      {/* 5. NEWSLETTER SECTION - REDESIGNED                         */}
      {/* ========================================================== */}

      <section className="border-b bg-background py-20">

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="relative overflow-hidden rounded-3xl border border-emerald-700/20 bg-card shadow-sm">

            <div className="grid lg:grid-cols-2">

              {/* Left Content */}
              <div className="relative z-10 flex flex-col justify-center p-8 sm:p-12 lg:p-14">

                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  <HeartHandshake className="h-6 w-6" />
                </div>

                <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">
                  Stay Connected
                </span>

                <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
                  Good Things Happen When We Come Together.
                </h2>

                <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">
                  Be part of a community that cares. Discover
                  upcoming events, volunteer opportunities, and
                  inspiring stories of people making a difference.
                </p>

                {/* Newsletter Form - Design Only */}
                <form
                  onSubmit={(e) => e.preventDefault()}
                  className="mt-8 flex flex-col gap-3 sm:flex-row"
                >

                  <div className="relative flex-1">

                    <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      className="h-12 rounded-xl border-border/80 bg-background pl-10"
                    />

                  </div>

                  <Button
                    type="button"
                    className="h-12 gap-2 rounded-xl bg-emerald-700 px-6 font-semibold text-white hover:bg-emerald-800"
                  >
                    Subscribe
                    <ArrowRight className="h-4 w-4" />
                  </Button>

                </form>

                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 text-emerald-700" />
                  Your inbox deserves respect. No spam, ever.
                </div>

              </div>

              {/* Right Visual */}
              <div className="relative hidden min-h-[420px] overflow-hidden bg-emerald-900 lg:flex lg:items-center lg:justify-center">

                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1000&q=85"
                  alt="Volunteers working together for their community"
                  className="absolute inset-0 h-full w-full object-cover opacity-65"
                />

                <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/50 via-emerald-900/30 to-emerald-950/80" />

                <div className="relative z-10 mx-10 max-w-sm text-center text-white">

                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/30 bg-white/15 backdrop-blur-md">
                    <HeartHandshake className="h-9 w-9" />
                  </div>

                  <h3 className="text-3xl font-extrabold leading-tight">
                    Together, We Can Make a Difference.
                  </h3>

                  <p className="mt-4 text-sm leading-relaxed text-emerald-50">
                    One event, one volunteer, and one small action
                    at a time.
                  </p>

                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
