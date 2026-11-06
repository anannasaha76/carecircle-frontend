
"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  CalendarDays,
  MapPin,
  Search,
  PlusCircle,
  Users,
  Sparkles,
  AlertCircle,
  RefreshCw,
  X,
  ArrowRight,
  SlidersHorizontal,
} from "lucide-react";

import { useSession } from "@/lib/auth-client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export interface EventItem {
  _id: string;
  title: string;
  description: string;
  eventType: string;
  thumbnailURL: string;
  location: string;
  eventDate: string;
  creatorEmail: string;
  creatorName?: string;
  creatorImage?: string | null;
  joinedCount?: number;
  createdAt?: string;
}

const categories = [
  { label: "All Events", value: "all" },
  { label: "Cleanup", value: "cleanup" },
  { label: "Plantation", value: "plantation" },
  { label: "Donation", value: "donation" },
  { label: "Food Drive", value: "food-drive" },
  { label: "Medical Camp", value: "medical-camp" },
  { label: "Education", value: "education" },
  { label: "Awareness", value: "awareness" },
  { label: "Fundraising", value: "fundraising" },
  { label: "Rescue", value: "rescue" },
  { label: "Other", value: "other" },
];

const emptySubscribe = () => () => { };

export default function UpcomingEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Better Auth session
  const { data: session } = useSession();

  // Redirect based on authentication status
  const createEventHref = session?.user
    ? "/create-event"
    : "/login?redirect=%2Fcreate-event";

  const todayDate = useSyncExternalStore(
    emptySubscribe,
    () => new Date().toISOString().split("T")[0],
    () => ""
  );

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${apiUrl}/events`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch events.");
      }

      const result = await response.json();

      if (result.success) {
        setEvents(result.data || []);
      } else {
        throw new Error(result.message || "Unable to load events.");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    queueMicrotask(() => {
      fetchEvents();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const isUpcoming = event.eventDate >= todayDate;

      const normalizedType = event.eventType
        ?.toLowerCase()
        .trim()
        .replace(/\s+/g, "-");

      const matchesCategory =
        selectedCategory === "all" ||
        normalizedType === selectedCategory;

      const search = searchTerm.toLowerCase().trim();

      const matchesSearch =
        event.title.toLowerCase().includes(search) ||
        event.location.toLowerCase().includes(search) ||
        event.description.toLowerCase().includes(search);

      return isUpcoming && matchesCategory && matchesSearch;
    });
  }, [events, todayDate, selectedCategory, searchTerm]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
  };

  const formatDate = (date: string) => {
    return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const defaultImage =
    "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=800&q=80";

  return (
    <section className="min-h-screen bg-muted/20 py-12 md:py-16">
      <div className="container mx-auto max-w-7xl px-4">

        {/* Page Header */}
        <div className="mb-10 flex flex-col gap-4 border-b border-border/60 pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-700/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700">
              <Sparkles className="h-3.5 w-3.5" />
              Make a Difference
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
              Upcoming <span className="text-emerald-700">Events</span>
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
              Discover meaningful community initiatives, connect with
              passionate people, and become part of positive change
              across Bangladesh.
            </p>
          </div>

          {!loading && !error && (
            <div className="flex w-fit items-center gap-2 rounded-xl border border-border/60 bg-card px-4 py-3 shadow-sm">
              <CalendarDays className="h-5 w-5 text-emerald-700" />
              <span className="text-sm font-semibold">
                {filteredEvents.length} Events Found
              </span>
            </div>
          )}
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[280px_1fr]">

          {/* Sidebar */}
          <aside className="space-y-6 lg:sticky lg:top-24">

            {/* Search and Category Filter */}
            <Card className="overflow-hidden rounded-2xl border-border/60 shadow-sm">
              <div className="border-b border-border/60 p-5">
                <div className="mb-4 flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5 text-emerald-700" />
                  <h2 className="font-bold">Search & Filters</h2>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search events..."
                    className="h-11 rounded-xl pl-9 pr-9"
                  />

                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                      aria-label="Clear search"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-bold">Event Categories</h3>

                  <Badge
                    variant="secondary"
                    className="rounded-full text-xs"
                  >
                    {selectedCategory === "all" ? "All" : "Filtered"}
                  </Badge>
                </div>

                <div className="space-y-1.5">
                  {categories.map((category) => (
                    <button
                      key={category.value}
                      onClick={() => setSelectedCategory(category.value)}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all ${selectedCategory === category.value
                        ? "bg-emerald-700 text-white shadow-sm"
                        : "text-muted-foreground hover:bg-emerald-700/10 hover:text-emerald-700"
                        }`}
                    >
                      <span>{category.label}</span>

                      {selectedCategory === category.value && (
                        <span className="h-1.5 w-1.5 rounded-full bg-white" />
                      )}
                    </button>
                  ))}
                </div>

                {(searchTerm || selectedCategory !== "all") && (
                  <Button
                    variant="ghost"
                    onClick={clearFilters}
                    className="mt-4 h-9 w-full rounded-lg text-xs font-semibold text-muted-foreground hover:text-emerald-700"
                  >
                    <X className="mr-2 h-3.5 w-3.5" />
                    Clear All Filters
                  </Button>
                )}
              </div>
            </Card>

            {/* Create Event Section */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-700 p-6 text-white shadow-lg">
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
              <div className="absolute -bottom-10 -left-8 h-32 w-32 rounded-full bg-white/10" />

              <div className="relative z-10">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
                  <PlusCircle className="h-6 w-6" />
                </div>

                <h3 className="text-xl font-extrabold">
                  Start Something Good
                </h3>

                <p className="mt-2 text-sm leading-6 text-emerald-50/90">
                  Have an idea to help your community? Create an event
                  and bring people together to make a difference.
                </p>

                <Link
                  href={createEventHref}
                  className="group mt-5 flex w-full items-center justify-between rounded-xl bg-white px-4 py-3 text-sm font-bold text-emerald-800 shadow-sm transition-all duration-300 hover:bg-emerald-50"
                >
                  <span>Create an Event</span>

                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </aside>

          {/* Events Content */}
          <div className="min-w-0">

            {/* Results Header */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold tracking-tight">
                  Explore Events
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Find an initiative that inspires you.
                </p>
              </div>

              {/* {!loading && !error && (
                <Badge
                  variant="outline"
                  className="rounded-full border-emerald-700/30 px-3 py-1.5 text-emerald-700"
                >
                  {filteredEvents.length} Results
                </Badge>
              )} */}
            </div>

            {/* Loading State */}
            {loading && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Card
                    key={index}
                    className="overflow-hidden rounded-2xl"
                  >
                    <Skeleton className="h-52 w-full" />

                    <CardContent className="space-y-4 p-5">
                      <Skeleton className="h-5 w-2/3" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-10 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Error State */}
            {!loading && error && (
              <div className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-dashed border-destructive/30 bg-card px-6 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
                  <AlertCircle className="h-7 w-7 text-destructive" />
                </div>

                <h3 className="text-lg font-bold">
                  Unable to Load Events
                </h3>

                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  {error}
                </p>

                <Button
                  onClick={fetchEvents}
                  className="mt-5 rounded-xl bg-emerald-700 hover:bg-emerald-800"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && filteredEvents.length === 0 && (
              <div className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-700/10">
                  <CalendarDays className="h-8 w-8 text-emerald-700" />
                </div>

                <h3 className="text-lg font-bold">
                  No Events Found
                </h3>

                <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                  We couldn&apos;t find any upcoming events matching your
                  search. Try another keyword or category.
                </p>

                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="mt-5 rounded-xl border-emerald-700/30 text-emerald-700 hover:bg-emerald-700/10"
                >
                  Clear Filters
                </Button>
              </div>
            )}

            {/* Event Cards */}
            {!loading && !error && filteredEvents.length > 0 && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {filteredEvents.map((event) => (
                  <Card
                    key={event._id}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-700/30 hover:shadow-xl"
                  >
                    {/* Image */}
                    <div className="relative h-52 overflow-hidden bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={event.thumbnailURL || defaultImage}
                        alt={event.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                      <Badge className="absolute left-4 top-4 rounded-full border-0 bg-white/95 px-3 py-1.5 text-xs font-bold capitalize text-emerald-800 shadow-sm">
                        {event.eventType.replace(/-/g, " ")}
                      </Badge>

                      <div className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                        <Users className="h-3.5 w-3.5" />
                        {event.joinedCount || 0} Joined
                      </div>
                    </div>

                    {/* Card Content */}
                    <CardContent className="flex flex-1 flex-col p-5">
                      <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-emerald-700">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-700/10">
                          <CalendarDays className="h-4 w-4" />
                        </span>

                        {formatDate(event.eventDate)}
                      </div>

                      <h3 className="line-clamp-1 text-lg font-bold transition-colors group-hover:text-emerald-700">
                        {event.title}
                      </h3>

                      <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-6 text-muted-foreground">
                        {event.description}
                      </p>

                      <div className="mt-4 flex items-center gap-2 border-t border-border/60 pt-4 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 shrink-0 text-emerald-700" />

                        <span className="line-clamp-1">
                          {event.location}
                        </span>
                      </div>
                    </CardContent>

                    {/* Card Button */}
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
        </div>
      </div>
    </section>
  );
}
