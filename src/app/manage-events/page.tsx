
"use client";

import { useEffect, useState, useMemo, useSyncExternalStore } from "react";
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
  ExternalLink,
  RefreshCw,
  Check,
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
  eventType: string;
  thumbnailURL: string | null;
  location: string;
  eventDate: string;
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

const emptySubscribe = () => () => { };

function getTomorrowString() {
  const d = new Date();
  d.setDate(d.getDate() + 1);

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
}

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

export default function ManageEventsPage() {
  const router = useRouter();
  const { data: session, isPending, refetch } = useSession();

  const [myEvents, setMyEvents] = useState<MyEventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingEvent, setEditingEvent] = useState<MyEventItem | null>(null);

  const [editForm, setEditForm] = useState<EditFormState>({
    title: "",
    description: "",
    eventType: "",
    thumbnailURL: "",
    location: "",
    eventDate: "",
  });

  const [isUpdating, setIsUpdating] = useState(false);

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const minDate = useSyncExternalStore(
    emptySubscribe,
    getTomorrowString,
    () => ""
  );

  useEffect(() => {
    if (!isPending && !session) {
      if (refetch) {
        refetch().catch(() => { });
      }

      const timeout = setTimeout(() => {
        if (!session) {
          notify.error(
            "Authentication Required",
            "Please sign in to manage your events."
          );
          router.push("/login?callbackUrl=/manage-events");
        }
      }, 400);

      return () => clearTimeout(timeout);
    }
  }, [session, isPending, router, refetch]);

  const fetchMyEvents = async () => {
    if (!session?.user?.email) return;

    setLoading(true);
    setError(null);

    try {
      const token = await getTokenFromClient();

      const res = await fetch(
        `${apiUrl}/my-events?email=${encodeURIComponent(session.user.email)}`,
        {
          cache: "no-store",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (!res.ok) {
        throw new Error(
          `Failed to load your events (Status: ${res.status})`
        );
      }

      const data = await res.json();

      if (data.success && Array.isArray(data.data)) {
        setMyEvents(data.data);
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
  };

  useEffect(() => {
    let ignore = false;

    async function load() {
      if (!session?.user?.email) return;

      setError(null);

      try {
        const token = await getTokenFromClient();

        const res = await fetch(
          `${apiUrl}/my-events?email=${encodeURIComponent(session.user.email)}`,
          {
            cache: "no-store",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );

        if (!res.ok) {
          throw new Error(
            `Failed to load your events (Status: ${res.status})`
          );
        }

        const data = await res.json();

        if (!ignore) {
          if (data.success && Array.isArray(data.data)) {
            setMyEvents(data.data);
          } else {
            setMyEvents([]);
          }
        }
      } catch (err: unknown) {
        if (!ignore) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not connect to the backend server."
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

  const handleOpenEdit = (event: MyEventItem) => {
    setEditingEvent(event);

    setEditForm({
      title: event.title,
      description: event.description,
      eventType: event.eventType,
      thumbnailURL: event.thumbnailURL || "",
      location: event.location,
      eventDate: event.eventDate,
    });
  };

  // Validate all update form fields.
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

    const selected = new Date(editForm.eventDate);
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    if (selected <= today) {
      return "Event date must be in the future.";
    }

    // Thumbnail URL is now required.
    if (!editForm.thumbnailURL.trim()) {
      return "Thumbnail image URL is required.";
    }

    // Validate thumbnail URL and protocol.
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

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingEvent || !session?.user?.email) return;

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
      // Always send the required thumbnail URL.
      thumbnailURL: editForm.thumbnailURL.trim(),
      location: editForm.location.trim(),
      eventDate: editForm.eventDate,
      creatorEmail: session.user.email,
    };

    try {
      const token = await getTokenFromClient();

      const res = await fetch(`${apiUrl}/events/${editingEvent._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        notify.error(
          "Update Failed",
          data?.message || "Could not update event."
        );

        setIsUpdating(false);
        return;
      }

      setMyEvents((prev) =>
        prev.map((ev) =>
          ev._id === editingEvent._id
            ? { ...ev, ...payload, updatedAt: new Date().toISOString() }
            : ev
        )
      );

      notify.success(
        "Event Updated",
        `"${payload.title}" has been updated.`
      );

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

  const handleDeleteEvent = async (event: MyEventItem) => {
    if (!session?.user?.email) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${event.title}"?\n\nThis will permanently remove the event and all participant registrations. This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId(event._id);
    setIsDeleting(true);

    try {
      const token = await getTokenFromClient();

      const res = await fetch(
        `${apiUrl}/events/${event._id}?email=${encodeURIComponent(
          session.user.email
        )}`,
        {
          method: "DELETE",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      const data = await res.json();

      if (!res.ok) {
        notify.error(
          "Delete Failed",
          data?.message || "Could not delete event."
        );

        setIsDeleting(false);
        setDeletingId(null);
        return;
      }

      setMyEvents((prev) =>
        prev.filter((ev) => ev._id !== event._id)
      );

      notify.success(
        "Event Deleted",
        `"${event.title}" has been deleted.`
      );
    } catch (err: unknown) {
      notify.error(
        "Network Error",
        err instanceof Error ? err.message : "Failed to delete event."
      );
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  const stats = useMemo(() => {
    const total = myEvents.length;
    let totalVolunteers = 0;

    myEvents.forEach((ev) => {
      totalVolunteers += ev.joinedCount || 0;
    });

    return { total, totalVolunteers };
  }, [myEvents]);

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
                <FolderKanban className="h-3.5 w-3.5" />
                Organiser Dashboard
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                Manage My Events
              </h1>

              <p className="mt-1.5 text-sm sm:text-base text-muted-foreground">
                Review, update, or remove social events you have organized in your community.
              </p>
            </div>

            <Link href="/create-event">
              <Button className="bg-emerald-700 hover:bg-emerald-800 text-white font-medium gap-2 shadow-sm text-xs sm:text-sm shrink-0">
                <PlusCircle className="h-4 w-4" />
                Create Another Event
              </Button>
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 max-w-md">
            <div className="rounded-xl border border-border/70 bg-card p-3 sm:p-4 text-center">
              <p className="text-xs text-muted-foreground font-medium">
                Events Organized
              </p>
              <p className="text-2xl font-extrabold text-foreground mt-1">
                {stats.total}
              </p>
            </div>

            <div className="rounded-xl border border-emerald-700/20 bg-emerald-50/50 dark:bg-emerald-950/30 p-3 sm:p-4 text-center">
              <p className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                Total Volunteers
              </p>
              <p className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-1">
                {stats.totalVolunteers}
              </p>
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
                  Could not load your events
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {error}
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchMyEvents}
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
              <Card
                key={idx}
                className="overflow-hidden border border-border/60"
              >
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

        {!loading && !error && myEvents.length === 0 && (
          <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/20 px-6 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 mb-4">
              <FolderKanban className="h-8 w-8" />
            </div>

            <h3 className="text-lg font-bold tracking-tight">
              No Events Created Yet
            </h3>

            <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
              You haven&apos;t created any community service events. Start a
              cause in your neighborhood and invite volunteers to make an
              impact!
            </p>

            <div className="mt-6 flex gap-3">
              <Link href="/create-event">
                <Button className="bg-emerald-700 hover:bg-emerald-800 text-white gap-2 text-xs">
                  <PlusCircle className="h-4 w-4" />
                  Create Your First Event
                </Button>
              </Link>
            </div>
          </div>
        )}

        {!loading && !error && myEvents.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {myEvents.map((event) => {
              const isDeletingThis =
                isDeleting && deletingId === event._id;

              return (
                <Card
                  key={event._id}
                  className="group flex flex-col overflow-hidden border border-border/70 hover:border-emerald-700/40 hover:shadow-md transition-all duration-300"
                >
                  {/* Thumbnail */}
                  <div className="relative h-44 w-full overflow-hidden bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={event.thumbnailURL || DEFAULT_EVENT_IMAGE}
                      alt={event.title}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          DEFAULT_EVENT_IMAGE;
                      }}
                    />

                    <div className="absolute top-3 left-3">
                      <Badge className="bg-background/90 text-foreground backdrop-blur-md border border-border/40 font-semibold capitalize text-[11px] shadow-sm">
                        <Tag className="h-3 w-3 mr-1 text-emerald-700" />
                        {event.eventType}
                      </Badge>
                    </div>

                    <div className="absolute top-3 right-3">
                      <Badge className="bg-emerald-700/90 text-white backdrop-blur-md text-[11px] font-medium shadow-sm">
                        <Users className="h-3 w-3 mr-1" />
                        {event.joinedCount || 0} Joined
                      </Badge>
                    </div>
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

                  <CardContent className="space-y-2 flex-1 pb-4">
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {event.description}
                    </p>

                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1 border-t border-border/50">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-700" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  </CardContent>

                  <CardFooter className="flex items-center gap-2 pt-0 border-t border-border/40 p-3 bg-muted/10">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(event)}
                      className="flex-1 gap-1.5 text-xs font-medium border-border/80 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-700/40 dark:hover:bg-emerald-950/40"
                    >
                      <Pencil className="h-3.5 w-3.5 text-emerald-700" />
                      <span>Update</span>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isDeletingThis}
                      onClick={() => handleDeleteEvent(event)}
                      className="gap-1.5 text-xs font-medium text-destructive border-destructive/20 hover:bg-destructive/10 hover:border-destructive/40"
                    >
                      {isDeletingThis ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}

                      <span>Delete</span>
                    </Button>

                    <Link href={`/events/${event._id}`}>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="View Public Details"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
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
          if (!open && !isUpdating) {
            setEditingEvent(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Pencil className="h-5 w-5 text-emerald-700" />
              Update Event
            </DialogTitle>

            <DialogDescription>
              Modify event information. Only you (the creator) can update this event.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateEvent} className="space-y-4 py-2">
            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-title" className="text-sm font-medium">
                Event Title <span className="text-destructive">*</span>
              </Label>

              <Input
                id="edit-title"
                value={editForm.title}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                placeholder="Event title"
                disabled={isUpdating}
                maxLength={120}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label
                htmlFor="edit-description"
                className="text-sm font-medium"
              >
                Description <span className="text-destructive">*</span>
              </Label>

              <Textarea
                id="edit-description"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Event description..."
                disabled={isUpdating}
                rows={4}
                maxLength={2000}
                required
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {/* Event Type */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">
                  Event Type <span className="text-destructive">*</span>
                </Label>

                <Select
                  value={editForm.eventType}
                  onValueChange={(val) =>
                    setEditForm((prev) => ({
                      ...prev,
                      eventType: val ?? "",
                    }))
                  }
                  disabled={isUpdating}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>

                  <SelectContent>
                    {EVENT_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="edit-location"
                  className="text-sm font-medium"
                >
                  Location <span className="text-destructive">*</span>
                </Label>

                <Input
                  id="edit-location"
                  value={editForm.location}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  placeholder="e.g. Mirpur 10, Dhaka"
                  disabled={isUpdating}
                  required
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {/* Event Date */}
              <div className="space-y-1.5">
                <Label htmlFor="edit-date" className="text-sm font-medium">
                  Event Date <span className="text-destructive">*</span>
                </Label>

                <Input
                  id="edit-date"
                  type="date"
                  value={editForm.eventDate}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      eventDate: e.target.value,
                    }))
                  }
                  min={minDate || undefined}
                  max="2030-12-31"
                  disabled={isUpdating}
                  required
                />
              </div>

              {/* Required Thumbnail URL */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="edit-thumbnail"
                  className="text-sm font-medium"
                >
                  Thumbnail Image URL{" "}
                  <span className="text-destructive">*</span>
                </Label>

                <Input
                  id="edit-thumbnail"
                  type="url"
                  value={editForm.thumbnailURL}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      thumbnailURL: e.target.value,
                    }))
                  }
                  placeholder="https://images.unsplash.com/photo-..."
                  disabled={isUpdating}
                  required
                />

                <p className="text-xs text-muted-foreground">
                  Required. Provide a valid image URL.
                </p>
              </div>
            </div>

            {/* Thumbnail Preview */}
            {editForm.thumbnailURL.trim() && (
              <div className="overflow-hidden rounded-lg border border-border/60 bg-muted/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={editForm.thumbnailURL.trim()}
                  alt="Thumbnail preview"
                  className="max-h-36 w-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display =
                      "none";
                  }}
                />
              </div>
            )}

            <DialogFooter className="pt-2 sm:justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={isUpdating}
                onClick={() => setEditingEvent(null)}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={isUpdating}
                className="bg-emerald-700 hover:bg-emerald-800 text-white gap-1.5"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
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
