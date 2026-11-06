"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  MapPin,
  Tag,
  PlusCircle,
  Pencil,
  Trash2,
  Users,
  Loader2,
  AlertCircle,
  FolderKanban,
  RefreshCw,
  Check,
  HeartHandshake,
  CalendarCheck,
  Clock3,
  Image as ImageIcon,
  Sparkles,
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

interface MyEventItem {
  _id: string;
  title: string;
  description: string;
  eventType: string | null;
  thumbnailURL: string | null;
  location: string;
  eventDate: string | null;
  creatorEmail: string;
  creatorName?: string | null;
  joinedCount?: number;
  createdAt?: string;
}

interface EditFormState {
  title: string;
  description: string;
  eventType: string;
  thumbnailURL: string;
  location: string;
  eventDate: string;
}

const EVENT_TYPES = [
  { value: "cleanup", label: "🧹 Cleanup" },
  { value: "plantation", label: "🌱 Plantation" },
  { value: "donation", label: "🎁 Donation" },
  { value: "food-drive", label: "🍱 Food Drive" },
  { value: "medical-camp", label: "🏥 Medical Camp" },
  { value: "education", label: "📚 Education" },
  { value: "awareness", label: "📢 Awareness Campaign" },
  { value: "fundraising", label: "💰 Fundraising" },
  { value: "rescue", label: "🚑 Rescue & Relief" },
  { value: "other", label: "✨ Other" },
];

const DEFAULT_EVENT_IMAGE =
  "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=800&q=80";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getTomorrowString(): string {
  const date = new Date();
  date.setDate(date.getDate() + 1);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// Safely parse a "YYYY-MM-DD" string (nullable) into a local Date.
function parseEventDate(dateString: string | null | undefined): Date | null {
  if (!dateString) return null;

  const [year, month, day] = dateString.split("-").map(Number);

  if (!year || !month || !day) return null;

  const date = new Date(year, month - 1, day);

  if (Number.isNaN(date.getTime())) return null;

  return date;
}

// Safely format nullable event dates.
function formatEventDate(dateString: string | null | undefined): string {
  if (!dateString) return "Date not available";

  const date = parseEventDate(dateString);

  if (!date) return dateString;

  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Safely handle nullable event types.
function getEventTypeLabel(type: string | null | undefined): string {
  if (!type) return "Community Event";

  const normalizedType: string = type;

  return (
    EVENT_TYPES.find((eventType) => eventType.value === normalizedType)
      ?.label || normalizedType.replaceAll("-", " ")
  );
}

// Safely determine whether an event is upcoming.
function isUpcomingEvent(dateString: string | null | undefined): boolean {
  const eventDate = parseEventDate(dateString);

  if (!eventDate) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return eventDate >= today;
}

// Build auth headers; the token can be null, so never pass it to a string-only API directly.
async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await getTokenFromClient();

  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function ManageEventsPage() {
  const router = useRouter();
  const { data: session, isPending, refetch } = useSession();

  // Normalize the (possibly nullable/undefined) email once.
  const userEmail: string | null = session?.user?.email ?? null;

  const [myEvents, setMyEvents] = useState<MyEventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<MyEventItem | null>(null);

  const [isUpdating, setIsUpdating] = useState(false);

  const [minDate, setMinDate] = useState("");
  const [thumbnailPreviewError, setThumbnailPreviewError] = useState(false);

  const [editForm, setEditForm] = useState<EditFormState>({
    title: "",
    description: "",
    eventType: "",
    thumbnailURL: "",
    location: "",
    eventDate: "",
  });

  // Set the minimum date after hydration.
  useEffect(() => {
    setMinDate(getTomorrowString());
  }, []);

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
          "Please sign in to manage your events."
        );

        router.push("/login?callbackUrl=/manage-events");
      }
    };

    redirectUser();

    return () => {
      active = false;
    };
  }, [session, isPending, router, refetch]);

  // Fetch the current user's events.
  const fetchMyEvents = useCallback(async () => {
    if (!userEmail) return;

    setLoading(true);
    setError(null);

    try {
      const headers = await getAuthHeaders();

      const res = await fetch(
        `${API_URL}/my-events?email=${encodeURIComponent(userEmail)}`,
        {
          cache: "no-store",
          headers,
        }
      );

      if (!res.ok) {
        throw new Error(`Failed to load your events (Status: ${res.status})`);
      }

      const data = await res.json();

      if (data.success && Array.isArray(data.data)) {
        setMyEvents(data.data as MyEventItem[]);
      } else {
        setMyEvents([]);
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
  }, [userEmail]);

  useEffect(() => {
    if (userEmail) {
      fetchMyEvents();
    }
  }, [userEmail, fetchMyEvents]);

  // Open the edit dialog.
  const handleOpenEdit = (event: MyEventItem) => {
    setEditingEvent(event);
    setThumbnailPreviewError(false);

    setEditForm({
      title: event.title ?? "",
      description: event.description ?? "",
      eventType: event.eventType ?? "",
      thumbnailURL: event.thumbnailURL ?? "",
      location: event.location ?? "",
      eventDate: event.eventDate ?? "",
    });
  };

  // Close the edit dialog.
  const handleCloseEdit = () => {
    if (isUpdating) return;

    setEditingEvent(null);
    setThumbnailPreviewError(false);
  };

  // Validate the update form.
  const validateUpdateForm = (): string | null => {
    if (!editForm.title.trim()) {
      return "Title is required.";
    }

    if (editForm.title.trim().length < 5) {
      return "Title must be at least 5 characters.";
    }

    if (!editForm.description.trim()) {
      return "Description is required.";
    }

    if (editForm.description.trim().length < 20) {
      return "Description must be at least 20 characters.";
    }

    if (!editForm.eventType) {
      return "Please select an event type.";
    }

    if (!editForm.location.trim()) {
      return "Location is required.";
    }

    if (!editForm.eventDate) {
      return "Event date is required.";
    }

    const selected = new Date(`${editForm.eventDate}T00:00:00`);
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    if (Number.isNaN(selected.getTime()) || selected <= today) {
      return "Event date must be in the future.";
    }

    if (!editForm.thumbnailURL.trim()) {
      return "Thumbnail image URL is required.";
    }

    try {
      const url = new URL(editForm.thumbnailURL.trim());

      if (url.protocol !== "https:" && url.protocol !== "http:") {
        return "Please provide a valid image URL.";
      }
    } catch {
      return "Please provide a valid image URL.";
    }

    return null;
  };

  // Update event.
  const handleUpdateEvent = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!editingEvent || !userEmail) return;

    const validationError = validateUpdateForm();

    if (validationError) {
      notify.error("Validation Error", validationError);
      return;
    }

    setIsUpdating(true);

    const payload = {
      title: editForm.title.trim(),
      description: editForm.description.trim(),
      eventType: editForm.eventType,
      thumbnailURL: editForm.thumbnailURL.trim(),
      location: editForm.location.trim(),
      eventDate: editForm.eventDate,
      creatorEmail: userEmail,
    };

    const eventId = editingEvent._id;

    try {
      const authHeaders = await getAuthHeaders();

      const res = await fetch(`${API_URL}/events/${eventId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        notify.error(
          "Update Failed",
          data?.message || "Could not update event."
        );
        return;
      }

      setMyEvents((prev) =>
        prev.map((event) =>
          event._id === eventId ? { ...event, ...payload } : event
        )
      );

      notify.success("Event Updated", `"${payload.title}" has been updated.`);

      setEditingEvent(null);
    } catch (err: unknown) {
      notify.error(
        "Network Error",
        err instanceof Error ? err.message : "Failed to update event."
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete event.
  const handleDeleteEvent = async (event: MyEventItem) => {
    if (!userEmail) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${event.title}"?\n\nThis will permanently remove the event and all participant registrations. This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId(event._id);

    try {
      const headers = await getAuthHeaders();

      const res = await fetch(
        `${API_URL}/events/${event._id}?email=${encodeURIComponent(userEmail)}`,
        {
          method: "DELETE",
          headers,
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        notify.error(
          "Delete Failed",
          data?.message || "Could not delete event."
        );
        return;
      }

      setMyEvents((prev) => prev.filter((item) => item._id !== event._id));

      notify.success("Event Deleted", `"${event.title}" has been deleted.`);
    } catch (err: unknown) {
      notify.error(
        "Network Error",
        err instanceof Error ? err.message : "Failed to delete event."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // Dashboard statistics.
  const stats = useMemo(() => {
    const total = myEvents.length;

    const totalVolunteers = myEvents.reduce(
      (sum, event) => sum + (event.joinedCount ?? 0),
      0
    );

    const upcoming = myEvents.filter((event) =>
      isUpcomingEvent(event.eventDate)
    ).length;

    return { total, totalVolunteers, upcoming };
  }, [myEvents]);

  const updateField = (field: keyof EditFormState, value: string) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (field === "thumbnailURL") {
      setThumbnailPreviewError(false);
    }
  };

  if (isPending) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950">
            <Loader2 className="h-7 w-7 animate-spin text-emerald-700 dark:text-emerald-400" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20 dark:bg-background">
      {/* Dashboard Hero */}
      <section className="relative isolate overflow-hidden bg-[#073B2B] text-white">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -right-24 -top-36 h-[420px] w-[420px] rounded-full border border-emerald-300/10" />
          <div className="absolute -right-12 -top-24 h-[320px] w-[320px] rounded-full border border-emerald-300/10" />
          <div className="absolute -bottom-48 left-[35%] h-[420px] w-[420px] rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(16,185,129,0.18),transparent_35%)]" />
        </div>

        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-100 backdrop-blur-sm">
                <FolderKanban className="h-3.5 w-3.5" />
                ORGANIZER DASHBOARD
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                Manage Your
                <span className="mt-1 block text-emerald-300">
                  Community Events.
                </span>
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-7 text-emerald-50/75 sm:text-base">
                Keep your initiatives organized, connect with volunteers, and
                make every community event count. Your next positive impact
                starts here.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link href="/create-event">
                  <Button className="h-11 gap-2 rounded-xl bg-emerald-400 px-5 font-semibold text-emerald-950 shadow-lg shadow-emerald-950/20 hover:bg-emerald-300">
                    <PlusCircle className="h-4 w-4" />
                    Create New Event
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </Link>

                <Link href="/upcoming-events">
                  <Button
                    variant="outline"
                    className="h-11 rounded-xl border-white/20 bg-white/5 px-5 text-white hover:bg-white/10 hover:text-white"
                  >
                    Explore Events
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid w-full max-w-xl grid-cols-3 gap-2 sm:gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.08] p-3 backdrop-blur-md sm:p-5">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-300">
                  <CalendarDays className="h-4 w-4" />
                </div>
                <p className="text-[10px] font-medium text-emerald-100/70 sm:text-xs">
                  Events Created
                </p>
                <p className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                  {stats.total}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.08] p-3 backdrop-blur-md sm:p-5">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-300">
                  <Users className="h-4 w-4" />
                </div>
                <p className="text-[10px] font-medium text-emerald-100/70 sm:text-xs">
                  Volunteers
                </p>
                <p className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                  {stats.totalVolunteers}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.08] p-3 backdrop-blur-md sm:p-5">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-300">
                  <CalendarCheck className="h-4 w-4" />
                </div>
                <p className="text-[10px] font-medium text-emerald-100/70 sm:text-xs">
                  Upcoming
                </p>
                <p className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                  {stats.upcoming}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Page Heading */}
        <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-400">
              <Sparkles className="h-3.5 w-3.5" />
              Your activities
            </div>

            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              My Events
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              All the events you have created in one place.
            </p>
          </div>
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
                  Could not load your events
                </p>
                <p className="mt-1 text-sm text-red-700/70 dark:text-red-300/70">
                  {error}
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchMyEvents}
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
                  <Skeleton className="h-9 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && myEvents.length === 0 && (
          <div className="relative overflow-hidden rounded-3xl border border-dashed border-emerald-300/60 bg-white px-5 py-16 text-center shadow-sm dark:border-emerald-900/60 dark:bg-card sm:px-10">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-100/70 blur-3xl dark:bg-emerald-950/40" />
            <div className="absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-emerald-100/70 blur-3xl dark:bg-emerald-950/40" />

            <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <HeartHandshake className="h-10 w-10" />
            </div>

            <div className="relative mt-6">
              <Badge className="border-0 bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300">
                Your journey starts here
              </Badge>

              <h3 className="mt-4 text-xl font-bold tracking-tight sm:text-2xl">
                No Events Created Yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                You haven&apos;t organized a community event yet. Start
                something meaningful, bring people together, and make a
                positive difference in your community.
              </p>

              <Link href="/create-event" className="mt-7 inline-flex">
                <Button className="h-11 gap-2 rounded-xl bg-emerald-700 px-5 text-white hover:bg-emerald-800">
                  <PlusCircle className="h-4 w-4" />
                  Create Your First Event
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Event Cards */}
        {!loading && !error && myEvents.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {myEvents.map((event) => {
              const isDeletingThis = deletingId === event._id;
              const upcoming = isUpcomingEvent(event.eventDate);

              return (
                <Card
                  key={event._id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card py-0 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-600/40 hover:shadow-xl hover:shadow-emerald-950/5"
                >
                  {/* Event Image */}
                  <div className="relative h-52 overflow-hidden bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={event.thumbnailURL || DEFAULT_EVENT_IMAGE}
                      alt={event.title}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => {
                        const image = e.currentTarget;

                        if (!image.src.includes("photo-1559027615")) {
                          image.src = DEFAULT_EVENT_IMAGE;
                        }
                      }}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-black/20" />

                    <div className="absolute left-4 top-4">
                      <Badge className="border border-white/30 bg-white/90 text-xs font-semibold text-slate-800 shadow-sm backdrop-blur-md hover:bg-white/90">
                        <Tag className="mr-1.5 h-3 w-3 text-emerald-700" />
                        <span className="capitalize">
                          {getEventTypeLabel(event.eventType)}
                        </span>
                      </Badge>
                    </div>

                    <div className="absolute right-4 top-4">
                      <Badge
                        className={
                          upcoming
                            ? "border border-emerald-300/30 bg-emerald-500/90 text-white shadow-sm backdrop-blur-md hover:bg-emerald-500/90"
                            : "border border-white/20 bg-slate-800/80 text-white shadow-sm backdrop-blur-md hover:bg-slate-800/80"
                        }
                      >
                        {upcoming ? (
                          <CalendarCheck className="mr-1 h-3 w-3" />
                        ) : (
                          <Clock3 className="mr-1 h-3 w-3" />
                        )}
                        {upcoming ? "Upcoming" : "Completed"}
                      </Badge>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3 text-white">
                      <div className="min-w-0">
                        <p className="text-[11px] font-medium uppercase tracking-wider text-white/70">
                          Event date
                        </p>
                        <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold">
                          <CalendarDays className="h-4 w-4 shrink-0" />
                          <span>{formatEventDate(event.eventDate)}</span>
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/20 bg-black/25 px-3 py-1.5 text-xs font-semibold backdrop-blur-md">
                        <Users className="h-3.5 w-3.5" />
                        {event.joinedCount ?? 0} Joined
                      </div>
                    </div>
                  </div>

                  {/* Event Information */}
                  <CardHeader className="space-y-2 px-5 pb-2 pt-5">
                    <CardTitle className="line-clamp-1 text-lg font-bold tracking-tight transition-colors group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                      {event.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="flex flex-1 flex-col px-5 pb-4">
                    <p className="line-clamp-2 min-h-10 text-sm leading-5 text-muted-foreground">
                      {event.description}
                    </p>

                    <div className="mt-4 flex items-center gap-2 border-t border-border/60 pt-3 text-xs text-muted-foreground">
                      <MapPin className="h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-400" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  </CardContent>

                  {/* Card Actions */}
                  <CardFooter className="grid grid-cols-3 items-center gap-2 border-t border-border/60 bg-muted/30 p-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(event)}
                      className="h-9 w-full gap-1.5 rounded-lg border-border bg-background text-xs font-semibold transition-colors hover:border-emerald-600/40 hover:bg-emerald-50 hover:text-emerald-800 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit Event
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isDeletingThis}
                      onClick={() => handleDeleteEvent(event)}
                      className="h-9 w-full gap-1.5 rounded-lg border-red-200 bg-background px-3 text-xs font-semibold text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
                    >
                      {isDeletingThis ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                      Delete
                    </Button>

                    <Link href={`/events/${event._id}`} className="block">
                      <Button
                        size="sm"
                        className="h-9 w-full gap-1.5 rounded-lg bg-emerald-700 px-3 text-xs font-semibold text-white shadow-sm transition-all hover:bg-emerald-800"
                      >
                        View Details
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Update Event Dialog */}
      <Dialog
        open={Boolean(editingEvent)}
        onOpenChange={(open) => {
          if (!open) handleCloseEdit();
        }}
      >
        <DialogContent className="max-h-[92vh] overflow-y-auto rounded-2xl border-border/70 p-0 sm:max-w-2xl">
          {/* Dialog Header */}
          <div className="border-b border-border/60 bg-emerald-50/70 px-6 py-5 dark:bg-emerald-950/20 sm:px-7">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
                  <Pencil className="h-5 w-5" />
                </div>

                <div>
                  <DialogTitle className="text-xl font-bold tracking-tight">
                    Update Event
                  </DialogTitle>
                  <DialogDescription className="mt-1 text-sm">
                    Make changes to your community event details.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <form
            onSubmit={handleUpdateEvent}
            className="space-y-6 px-6 py-6 sm:px-7"
          >
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-100 text-xs font-bold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                  01
                </span>
                <h3 className="text-sm font-bold">Basic Information</h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-title" className="text-sm font-semibold">
                  Event Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-title"
                  value={editForm.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="e.g. Community Tree Plantation"
                  disabled={isUpdating}
                  maxLength={120}
                  required
                  className="h-11 rounded-xl bg-background"
                />
                <p className="text-right text-[11px] text-muted-foreground">
                  {editForm.title.length}/120 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="edit-description"
                  className="text-sm font-semibold"
                >
                  Event Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="edit-description"
                  value={editForm.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Describe the purpose of your event, activities, and how people can participate..."
                  disabled={isUpdating}
                  rows={4}
                  maxLength={2000}
                  required
                  className="resize-none rounded-xl bg-background leading-6"
                />
                <p className="text-right text-[11px] text-muted-foreground">
                  {editForm.description.length}/2000 characters
                </p>
              </div>
            </div>

            <div className="border-t border-border/60" />

            {/* Event Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-100 text-xs font-bold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                  02
                </span>
                <h3 className="text-sm font-bold">Event Details</h3>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">
                    Event Category <span className="text-destructive">*</span>
                  </Label>

                  <Select
                    value={editForm.eventType}
                    onValueChange={(value) => updateField("eventType", value)}
                    disabled={isUpdating}
                  >
                    <SelectTrigger className="h-11 w-full rounded-xl bg-background">
                      <SelectValue placeholder="Select category..." />
                    </SelectTrigger>

                    <SelectContent>
                      {EVENT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="edit-location"
                    className="text-sm font-semibold"
                  >
                    Event Location <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="edit-location"
                      value={editForm.location}
                      onChange={(e) => updateField("location", e.target.value)}
                      placeholder="e.g. Mirpur 10, Dhaka"
                      disabled={isUpdating}
                      required
                      className="h-11 rounded-xl bg-background pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="edit-date" className="text-sm font-semibold">
                    Event Date <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="edit-date"
                      type="date"
                      value={editForm.eventDate}
                      onChange={(e) => updateField("eventDate", e.target.value)}
                      min={minDate || undefined}
                      disabled={isUpdating}
                      required
                      className="h-11 rounded-xl bg-background pl-9"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Choose a future date for your event.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-border/60" />

            {/* Event Image */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-100 text-xs font-bold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                  03
                </span>
                <h3 className="text-sm font-bold">Event Thumbnail</h3>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="edit-thumbnail"
                  className="text-sm font-semibold"
                >
                  Thumbnail Image URL{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <ImageIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="edit-thumbnail"
                    type="url"
                    value={editForm.thumbnailURL}
                    onChange={(e) => updateField("thumbnailURL", e.target.value)}
                    placeholder="https://example.com/event-image.jpg"
                    disabled={isUpdating}
                    required
                    className="h-11 rounded-xl bg-background pl-9"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Use a direct image URL starting with http:// or https://.
                </p>
              </div>

              {editForm.thumbnailURL.trim() && (
                <div className="relative overflow-hidden rounded-xl border border-border/70 bg-muted/30">
                  {!thumbnailPreviewError ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={editForm.thumbnailURL.trim()}
                        alt="Event thumbnail preview"
                        referrerPolicy="no-referrer"
                        className="h-44 w-full object-cover"
                        onError={() => setThumbnailPreviewError(true)}
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-4 pb-3 pt-8">
                        <p className="text-xs font-medium text-white">
                          Image Preview
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="flex min-h-32 flex-col items-center justify-center gap-2 p-5 text-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm font-semibold">
                        Unable to load image
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Check the URL or try another image.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Dialog Actions */}
            <DialogFooter className="flex-col-reverse gap-2 border-t border-border/60 pt-5 sm:flex-row sm:justify-between">
              <Button
                type="button"
                variant="ghost"
                disabled={isUpdating}
                onClick={handleCloseEdit}
                className="h-11 rounded-xl"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={isUpdating}
                className="h-11 gap-2 rounded-xl bg-emerald-700 px-6 font-semibold text-white shadow-sm hover:bg-emerald-800"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}