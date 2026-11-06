"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  HeartHandshake,
  CalendarDays,
  MapPin,
  ArrowRight,
  Tag,
  Users,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Globe2,
  Send,
  PlusCircle,
  AlertCircle,
  RefreshCw,
  Camera,
} from "lucide-react";

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
/* Static Data for Gallery & Features                                 */
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
    title: "1-Click Volunteer Join",
    description:
      "Join events instantly with your account. Keep track of all events you are attending in your personalized volunteer dashboard.",
  },
  {
    icon: ShieldCheck,
    title: "Verified Event Ownership",
    description:
      "Organizers maintain direct responsibility for their causes, with complete freedom to update details or manage registrations securely.",
  },
  {
    icon: TrendingUp,
    title: "Transparent Social Impact",
    description:
      "Every attendee counts. Real-time participant counters showcase the collective strength of neighbors helping neighbors.",
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
    location: "Mirpur 10, Dhaka",
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
    location: "Tejgaon, Dhaka",
    category: "Food Drive",
    image:
      "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Free Community Health & Medical Camp",
    location: "Uttara Sector 7, Dhaka",
    category: "Medical",
    image:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Weekend Youth Mentorship & Books",
    location: "Badda, Dhaka",
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
/* Home Page Component                                                */
/* ------------------------------------------------------------------ */

export default function HomePage() {
  const [recentEvents, setRecentEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  /* Fetch 6 recent upcoming events using backend .limit(6) endpoint */
  const fetchRecentEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/events/recent`, { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`Failed to load recent events (Status: ${res.status})`);
      }
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setRecentEvents(data.data);
      } else {
        setRecentEvents([]);
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Could not reach the server."
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
        const res = await fetch(`${apiUrl}/events/recent`, { cache: "no-store" });
        if (!res.ok) {
          throw new Error(`Failed to load recent events (Status: ${res.status})`);
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
            err instanceof Error ? err.message : "Could not reach the server."
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
    <div className="flex flex-col min-h-screen">
      {/* ========================================================== */}
      {/* 1. HERO / BANNER SECTION                                   */}
      {/* ========================================================== */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-emerald-50/60 via-background to-background dark:from-emerald-950/20 dark:via-background dark:to-background py-16 sm:py-24">
        {/* Subtle decorative background circles */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-[700px] h-[700px] rounded-full bg-emerald-100/40 dark:bg-emerald-950/20 blur-3xl pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            {/* Left Column: Heading and CTAs */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">


              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-foreground leading-[1.15]">
                Small Actions,{" "}
                <span className="text-emerald-700">Big Impact</span> For Our
                Communities.
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                CareCircle connects passionate citizens to create, discover, and join
                social service events right in their neighborhoods. From blanket
                distributions in Mirpur to tree plantations in Mohammadpur, every
                initiative matters.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link href="/upcoming-events">
                  <Button className="w-full sm:w-auto h-12 px-6 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold gap-2 shadow-sm text-sm">
                    <CalendarDays className="h-4 w-4" />
                    Explore Upcoming Events
                  </Button>
                </Link>

                <Link href="/create-event">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto h-12 px-6 font-semibold gap-2 border-border/80 text-sm hover:bg-muted"
                  >
                    <PlusCircle className="h-4 w-4 text-emerald-700" />
                    Organize an Event
                  </Button>
                </Link>
              </div>

              {/* Trust & Metric Badges */}
              <div className="pt-6 border-t border-border/60 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    ✓
                  </div>
                  <span className="font-medium text-foreground">100% Free & Open RSVP</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    ✓
                  </div>
                  <span className="font-medium text-foreground">Verified Local Organizers</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    ✓
                  </div>
                  <span className="font-medium text-foreground">Real-Time Attendee Tracking</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Showcase */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1000&q=80"
                    alt="Community volunteers distributing food and essentials"
                    className="h-80 w-full object-cover sm:h-96"
                  />
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold text-xs">
                        Recent Milestone
                      </Badge>
                      <span className="text-xs text-muted-foreground">Dhaka, Bangladesh</span>
                    </div>
                    <h3 className="text-base font-bold text-foreground">
                      Winter Clothes & Blanket Drive 2026
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Over 350 warm blankets and winter garments provided to underprivileged
                      families across Mirpur and Mohammadpur through grassroots volunteer action.
                    </p>
                  </div>
                </div>


              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================== */}
      {/* 2. FEATURES SECTION                                        */}
      {/* ========================================================== */}
      <section className="py-20 border-b bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Why CareCircle
            </h2>
            <p className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
              Built for Real Community Impact
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every tool in CareCircle is tailored to remove friction from neighborhood
              social service and volunteer engagement.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-border/70 bg-card p-6 shadow-xs hover:border-emerald-700/40 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {feat.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================== */}
      {/* 3. RECENT UPCOMING EVENTS SECTION (Dynamic with .limit(6)) */}
      {/* ========================================================== */}
      <section className="py-20 border-b bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-12">
            <div className="max-w-xl space-y-2">
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
                Recent Upcoming Events
              </h2>
              <p className="text-sm text-muted-foreground">
                Hand-picked upcoming social causes created by our community members. Join in to make a difference.
              </p>
            </div>

            <Link href="/upcoming-events">
              <Button
                variant="outline"
                className="gap-2 font-semibold text-xs sm:text-sm shrink-0 border-border/80 hover:bg-emerald-700 hover:text-white hover:border-emerald-700 transition-all"
              >
                <span>View All Upcoming Events</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Error notice */}
          {error && (
            <div className="mb-8 rounded-xl border border-destructive/30 bg-destructive/10 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-destructive">
                    Could not fetch recent events
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{error}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchRecentEvents}
                className="gap-2 border-destructive/40 text-destructive hover:bg-destructive/10 shrink-0"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Retry
              </Button>
            </div>
          )}

          {/* Skeletons while loading */}
          {loading && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, idx) => (
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

          {/* Empty State */}
          {!loading && !error && recentEvents.length === 0 && (
            <div className="flex min-h-[30vh] flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card px-6 py-12 text-center">
              <CalendarDays className="h-10 w-10 text-emerald-700 mb-3" />
              <h3 className="text-base font-bold text-foreground">
                No Upcoming Events Right Now
              </h3>
              <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                Be the very first community organizer to schedule a social development event!
              </p>
              <div className="mt-4">
                <Link href="/create-event">
                  <Button className="bg-emerald-700 hover:bg-emerald-800 text-white gap-2 text-xs font-semibold">
                    <PlusCircle className="h-4 w-4" />
                    Create An Event
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* 6 Recent Events Grid (2 or 3 columns) */}
          {!loading && !error && recentEvents.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recentEvents.map((event) => (
                <Card
                  key={event._id}
                  className="group flex flex-col overflow-hidden border border-border/70 hover:border-emerald-700/40 hover:shadow-lg transition-all duration-300"
                >
                  <div className="relative h-44 w-full overflow-hidden bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={event.thumbnailURL || DEFAULT_EVENT_IMAGE}
                      alt={event.title}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = DEFAULT_EVENT_IMAGE;
                      }}
                    />
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-background/90 text-foreground backdrop-blur-md border border-border/40 font-semibold capitalize text-[11px] shadow-sm">
                        <Tag className="h-3 w-3 mr-1 text-emerald-700" />
                        {event.eventType}
                      </Badge>
                    </div>

                    {event.joinedCount !== undefined && event.joinedCount > 0 && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-emerald-700/90 text-white backdrop-blur-md text-[11px] font-medium shadow-sm">
                          <Users className="h-3 w-3 mr-1" />
                          {event.joinedCount} Joined
                        </Badge>
                      </div>
                    )}
                  </div>

                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                      <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                      <span>{formatEventDate(event.eventDate)}</span>
                    </div>

                    <CardTitle className="text-base font-bold line-clamp-1 group-hover:text-emerald-700 transition-colors">
                      {event.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-2.5 flex-1 pb-4">
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {event.description}
                    </p>

                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1 border-t border-border/50">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-700" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-0">
                    <Link href={`/events/${event._id}`} className="w-full">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-between text-xs font-medium group-hover:bg-emerald-700 group-hover:text-white group-hover:border-emerald-700 transition-all"
                      >
                        <span>View Event</span>
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ========================================================== */}
      {/* 4. GALLERY SECTION (Static photographs)                   */}
      {/* ========================================================== */}
      <section className="py-20 border-b bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700">
              <Camera className="h-4 w-4" />
              Community Moments
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
              Photographs From the Field
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Real snapshots of volunteers in action across tree plantations, winter clothing
              drives, health checks, and youth mentoring.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                  {/* Top Badge */}
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-white/90 text-emerald-950 backdrop-blur-md text-[11px] font-semibold">
                      {photo.category}
                    </Badge>
                  </div>

                  {/* Caption Overlay */}
                  <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
                    <div className="flex items-center gap-1 text-[11px] text-emerald-300 font-medium">
                      <MapPin className="h-3 w-3" />
                      <span>{photo.location}</span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold leading-tight">
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
      {/* 5. NEWSLETTER SECTION (Design Only - No Functionality Req) */}
      {/* ========================================================== */}
      <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-emerald-700/20 bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 p-8 sm:p-14 text-white shadow-xl text-center">
            {/* Background design glow */}
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-emerald-950/40 blur-2xl pointer-events-none" />

            <div className="relative z-10 max-w-xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-xs font-semibold backdrop-blur-md">
                <Send className="h-3.5 w-3.5" />
                <span>Stay Informed</span>
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
                Never Miss a Cause Near You
              </h2>

              <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed max-w-md mx-auto">
                Subscribe to our weekly digest of upcoming community service initiatives,
                volunteer callouts, and local grassroots stories.
              </p>

              {/* Newsletter Form UI */}
              <form
                onSubmit={(e) => e.preventDefault()}
                className="mt-6 flex flex-col sm:flex-row items-center gap-2.5 max-w-md mx-auto"
              >
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  className="h-11 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus-visible:ring-white/40 focus-visible:border-white/50 text-sm"
                />
                <Button
                  type="button"
                  className="w-full sm:w-auto h-11 px-6 bg-white text-emerald-900 hover:bg-emerald-50 font-bold text-sm shrink-0 shadow-sm"
                >
                  Subscribe
                </Button>
              </form>

              <p className="text-[11px] text-emerald-200/80 pt-2">
                We respect your inbox. No spam, ever. Unsubscribe with one click anytime.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
