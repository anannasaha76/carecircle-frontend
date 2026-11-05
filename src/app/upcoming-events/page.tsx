"use client";
import { useEffect, useState, useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  CalendarDays,
  MapPin,
  Tag,
  ArrowRight,
  Search,
  Filter,
  PlusCircle,
  Users,
  Sparkles,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";


export interface EventItem {
  _id: string;
  title: string;
  description: string;
  eventType: string;
  thumbnailURL: string | null;
  location: string;
  eventDate: string; // YYYY-MM-DD
  creatorEmail: string;
  creatorName?: string | null;
  joinedCount?: number;
  createdAt?: string;
}

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "cleanup", label: "🧹 Cleanup" },
  { value: "plantation", label: "🌱 Plantation" },
  { value: "donation", label: "🎁 Donation" },
  { value: "food-drive", label: "🍱 Food Drive" },
  { value: "medical-camp", label: "🏥 Medical" },
  { value: "education", label: "📚 Education" },
  { value: "awareness", label: "📢 Awareness" },
  { value: "fundraising", label: "💰 Fundraising" },
  { value: "rescue", label: "🚑 Relief" },
  { value: "other", label: "✨ Other" },
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

const DEFAULT_EVENT_IMAGE =
  "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=800&q=80";



const emptySubscribe = () => () => {};

export default function UpcomingEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const todayDate = useSyncExternalStore(
    emptySubscribe,
    () => new Date().toISOString().split("T")[0],
    () => ""
  );

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const handleRefresh = () => {
    setLoading(true);
    setError(null);
    fetch(`${apiUrl}/events`, { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch events (Status: ${res.status})`);
        return res.json();
      })
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setEvents(data.data);
        } else {
          setEvents([]);
        }
      })
      .catch((err: unknown) => {
        setError(
          err instanceof Error ? err.message : "Could not connect to the backend server."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    let ignore = false;

    async function load() {
      setError(null);
      try {
        const res = await fetch(`${apiUrl}/events`, { cache: "no-store" });
        if (!res.ok) {
          throw new Error(`Failed to fetch events (Status: ${res.status})`);
        }
        const data = await res.json();
        if (!ignore) {
          if (data.success && Array.isArray(data.data)) {
            setEvents(data.data);
          } else {
            setEvents([]);
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

    load();
    return () => {
      ignore = true;
    };
  }, [apiUrl]);

  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      if (todayDate && ev.eventDate < todayDate) return false;

      if (
        selectedCategory !== "all" &&
        ev.eventType.toLowerCase() !== selectedCategory.toLowerCase()
      ) {
        return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = ev.title.toLowerCase().includes(query);
        const matchesLocation = ev.location.toLowerCase().includes(query);
        const matchesDesc = ev.description.toLowerCase().includes(query);
        return matchesTitle || matchesLocation || matchesDesc;
      }

      return true;
    });
  }, [events, selectedCategory, searchQuery, todayDate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/40 via-background to-background dark:from-emerald-950/15 dark:via-background dark:to-background pb-16">
      <section className="border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 mb-3">
                <Sparkles className="h-3.5 w-3.5" />
                Community Impact
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
                Upcoming Social Events
              </h1>
              <p className="mt-2 text-sm sm:text-base text-muted-foreground leading-relaxed">
                Discover meaningful community service opportunities near you. Join hands
                with local volunteers to build a kinder, cleaner, and better society.
              </p>
            </div>

            <Link href="/create-event">
              <Button className="bg-emerald-700 hover:bg-emerald-800 text-white font-medium gap-2 shadow-sm shrink-0">
                <PlusCircle className="h-4 w-4" />
                Create New Event
              </Button>
            </Link>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-6 border-t border-border/60">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by event title, city or neighborhood..."
                className="pl-9 h-10 bg-background"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <Filter className="h-4 w-4 text-muted-foreground shrink-0 mr-1 hidden lg:block" />
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.value;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                      isSelected
                        ? "bg-emerald-700 text-white shadow-sm"
                        : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
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
                  Could not load events
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{error}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="gap-2 border-destructive/40 text-destructive hover:bg-destructive/10 shrink-0"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Try Again
            </Button>
          </div>
        )}

        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <Card key={idx} className="overflow-hidden border border-border/60">
                <Skeleton className="h-48 w-full rounded-none" />
                <CardHeader className="space-y-2 pb-2">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-20 rounded-full" />
                    <Skeleton className="h-4 w-24 rounded-full" />
                  </div>
                  <Skeleton className="h-6 w-3/4 rounded" />
                </CardHeader>
                <CardContent className="space-y-2 pb-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
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
              <CalendarDays className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold tracking-tight">No Upcoming Events Found</h3>
            <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
              {searchQuery || selectedCategory !== "all"
                ? "No events matched your current search or category filter. Try clearing filters."
                : "There are currently no upcoming events scheduled. Be the first to organise one!"}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {(searchQuery || selectedCategory !== "all") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                  className="text-xs"
                >
                  Clear Filters
                </Button>
              )}
              <Link href="/create-event">
                <Button className="bg-emerald-700 hover:bg-emerald-800 text-white gap-2 text-xs">
                  <PlusCircle className="h-4 w-4" />
                  Create an Event
                </Button>
              </Link>
            </div>
          </div>
        )}

        {!loading && !error && filteredEvents.length > 0 && (
          <>
            <div className="mb-4 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Showing <strong className="text-foreground">{filteredEvents.length}</strong> upcoming {filteredEvents.length === 1 ? "event" : "events"}
              </span>
              <span>Sorted by earliest date</span>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map((event) => (
                <Card
                  key={event._id}
                  className="group flex flex-col overflow-hidden border border-border/70 hover:border-emerald-700/40 hover:shadow-lg transition-all duration-300"
                >
                  {/* Event Thumbnail */}
                  <div className="relative h-48 w-full overflow-hidden bg-muted">
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
                          {event.joinedCount} {event.joinedCount === 1 ? "Joined" : "Joined"}
                        </Badge>
                      </div>
                    )}
                  </div>

                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                      <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                      <span>{formatEventDate(event.eventDate)}</span>
                    </div>

                    <CardTitle className="text-lg font-bold line-clamp-1 group-hover:text-emerald-700 transition-colors">
                      {event.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-3 flex-1 pb-4">
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
                        className="w-full justify-between font-medium group-hover:bg-emerald-700 group-hover:text-white group-hover:border-emerald-700 transition-all text-xs"
                      >
                        <span>View Event</span>
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

