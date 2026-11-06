
"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import {
  PlusCircle,
  FileText,
  MapPin,
  CalendarDays,
  ImageIcon,
  Tag,
  Loader2,
  HeartHandshake,
  ArrowRight,
  Users,
  Sparkles,
  ShieldCheck,
  User,
  X,
} from "lucide-react";

import { useSession } from "@/lib/auth-client";
import { notify } from "@/lib/notify";
import { getTokenFromClient } from "@/lib/getTokenFromClient";

import { Button } from "@/components/ui/button";
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

function getTomorrowString() {
  const d = new Date();
  d.setDate(d.getDate() + 1);

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
}

interface FormState {
  title: string;
  description: string;
  eventType: string;
  thumbnailURL: string;
  location: string;
  eventDate: string;
}

const INITIAL_FORM: FormState = {
  title: "",
  description: "",
  eventType: "",
  thumbnailURL: "",
  location: "",
  eventDate: "",
};

const emptySubscribe = () => () => { };

export default function CreateEventPage() {
  const router = useRouter();
  const { data: session, isPending, refetch } = useSession();

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageError, setImageError] = useState(false);

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
        notify.error(
          "Authentication Required",
          "Please sign in to create an event."
        );

        router.push("/login?callbackUrl=/create-event");
      }, 400);

      return () => clearTimeout(timeout);
    }
  }, [session, isPending, router, refetch]);

  const setField = (field: keyof FormState, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (field === "thumbnailURL") {
      setImageError(false);
    }
  };

  const validate = (): string | null => {
    if (!form.title.trim()) {
      return "Event title is required.";
    }

    if (form.title.trim().length < 5) {
      return "Title must be at least 5 characters.";
    }

    if (!form.description.trim()) {
      return "Description is required.";
    }

    if (form.description.trim().length < 20) {
      return "Description must be at least 20 characters.";
    }

    if (!form.eventType) {
      return "Please select an event type.";
    }

    if (!form.location.trim()) {
      return "Location is required.";
    }

    if (!form.eventDate) {
      return "Event date is required.";
    }

    const selected = new Date(`${form.eventDate}T00:00:00`);
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    if (selected <= today) {
      return "Event date must be in the future.";
    }

    if (!form.thumbnailURL.trim()) {
      return "Thumbnail image URL is required.";
    }

    try {
      const url = new URL(form.thumbnailURL.trim());

      if (
        url.protocol !== "https:" &&
        url.protocol !== "http:"
      ) {
        return "Please provide a valid image URL.";
      }
    } catch {
      return "Please provide a valid image URL.";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const error = validate();

    if (error) {
      notify.error("Validation Error", error);
      return;
    }

    if (!session?.user?.email) {
      notify.error(
        "Not Authenticated",
        "Your session has expired. Please sign in again."
      );

      router.push("/login");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      eventType: form.eventType,
      thumbnailURL: form.thumbnailURL.trim(),
      location: form.location.trim(),
      eventDate: form.eventDate,
      creatorEmail: session.user.email,
      creatorName: session.user.name || null,
      creatorImage:
        session.user.image ||
        (session.user as { photoURL?: string }).photoURL ||
        null,
      createdAt: new Date().toISOString(),
    };

    try {
      const token = await getTokenFromClient();

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/events`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          message?: string;
        };

        notify.error(
          "Failed to Create Event",
          data?.message || "Something went wrong."
        );

        return;
      }

      notify.success(
        "Event Created! 🎉",
        `"${payload.title}" has been published.`
      );

      setForm(INITIAL_FORM);
      setImageError(false);

      router.push("/upcoming-events");
    } catch (err: unknown) {
      notify.error(
        "Network Error",
        err instanceof Error
          ? err.message
          : "Could not reach the server."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isPending || !session) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-700" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50/80 pb-16 dark:bg-background">

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-emerald-950 text-white">

        <div className="absolute -right-24 -top-32 h-96 w-96 rounded-full border border-white/10" />
        <div className="absolute -right-10 -top-16 h-72 w-72 rounded-full border border-white/10" />
        <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">

          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center">

            <div className="max-w-2xl">

              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-white/10 px-4 py-2 text-xs font-medium text-emerald-100">
                <Sparkles className="h-4 w-4" />
                Make something meaningful happen
              </div>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Bring Your Community
                <span className="block text-emerald-300">
                  Together.
                </span>
              </h1>

              <p className="mt-5 max-w-xl text-sm leading-7 text-emerald-100/75 sm:text-base">
                Every meaningful change begins with an idea. Create a
                community event, invite volunteers, and turn your idea
                into positive action.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-5 text-sm text-emerald-100/80">
                <div className="flex items-center gap-2">
                  <HeartHandshake className="h-4 w-4 text-emerald-300" />
                  Create initiatives
                </div>

                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-emerald-300" />
                  Connect volunteers
                </div>
              </div>

            </div>

            <div className="hidden h-40 w-40 shrink-0 items-center justify-center rounded-[2rem] border border-white/10 bg-white/5 md:flex lg:h-48 lg:w-48">
              <div className="flex h-28 w-28 items-center justify-center rounded-[1.7rem] bg-emerald-400/15 ring-1 ring-emerald-300/20 lg:h-36 lg:w-36">
                <HeartHandshake className="h-16 w-16 text-emerald-300 lg:h-20 lg:w-20" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Main Form */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-8">

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">

          {/* Form Card */}
          <div className="min-w-0 overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">

            {/* Form Header */}
            <div className="border-b border-border/70 px-5 py-6 sm:px-8">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  <PlusCircle className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-xl font-bold tracking-tight">
                    Event Information
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Fill in the details to publish your event.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="space-y-7 p-5 sm:p-8">

                {/* Section 1 */}
                <div>
                  <div className="mb-5 flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      01
                    </span>

                    <h3 className="font-semibold">
                      Basic Information
                    </h3>
                  </div>

                  <div className="space-y-5">

                    {/* Title */}
                    <div className="space-y-2">
                      <Label htmlFor="title" className="font-semibold">
                        Event Title <span className="text-destructive">*</span>
                      </Label>

                      <Input
                        id="title"
                        value={form.title}
                        onChange={(e) => setField("title", e.target.value)}
                        placeholder="e.g. Winter Clothes Distribution – Rangpur"
                        disabled={isSubmitting}
                        maxLength={120}
                        required
                        className="h-12 rounded-xl bg-background"
                      />

                      <p className="text-right text-xs text-muted-foreground">
                        {form.title.length}/120 characters
                      </p>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label htmlFor="description" className="font-semibold">
                        Event Description{" "}
                        <span className="text-destructive">*</span>
                      </Label>

                      <Textarea
                        id="description"
                        value={form.description}
                        onChange={(e) =>
                          setField("description", e.target.value)
                        }
                        placeholder="Describe the purpose of your event, activities, who can participate, and what volunteers should bring..."
                        disabled={isSubmitting}
                        rows={5}
                        maxLength={2000}
                        required
                        className="min-h-32 resize-y rounded-xl bg-background"
                      />

                      <p className="text-right text-xs text-muted-foreground">
                        {form.description.length}/2000 · Minimum 20 characters
                      </p>
                    </div>

                  </div>
                </div>

                <div className="h-px bg-border/70" />

                {/* Section 2 */}
                <div>
                  <div className="mb-5 flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      02
                    </span>

                    <h3 className="font-semibold">
                      Event Category & Location
                    </h3>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">

                    {/* Event Type */}
                    <div className="space-y-2">
                      <Label className="font-semibold">
                        Event Type <span className="text-destructive">*</span>
                      </Label>

                      <Select
                        value={form.eventType}
                        onValueChange={(val) =>
                          setField("eventType", val ?? "")
                        }
                        disabled={isSubmitting}
                      >
                        <SelectTrigger className="h-12 w-full rounded-xl bg-background">
                          <SelectValue placeholder="Choose a category" />
                        </SelectTrigger>

                        <SelectContent>
                          {EVENT_TYPES.map((type) => (
                            <SelectItem
                              key={type.value}
                              value={type.value}
                            >
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Location */}
                    <div className="space-y-2">
                      <Label htmlFor="location" className="font-semibold">
                        Event Location{" "}
                        <span className="text-destructive">*</span>
                      </Label>

                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                        <Input
                          id="location"
                          value={form.location}
                          onChange={(e) =>
                            setField("location", e.target.value)
                          }
                          placeholder="e.g. Rangpur, Bangladesh"
                          disabled={isSubmitting}
                          maxLength={120}
                          required
                          className="h-12 rounded-xl bg-background pl-10"
                        />
                      </div>
                    </div>

                  </div>
                </div>

                <div className="h-px bg-border/70" />

                {/* Section 3 */}
                <div>
                  <div className="mb-5 flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      03
                    </span>

                    <h3 className="font-semibold">
                      Schedule & Event Image
                    </h3>
                  </div>

                  <div className="space-y-5">

                    {/* Date */}
                    <div className="space-y-2">
                      <Label htmlFor="eventDate" className="font-semibold">
                        Event Date <span className="text-destructive">*</span>
                      </Label>

                      <div className="relative">
                        <CalendarDays className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                        <Input
                          id="eventDate"
                          type="date"
                          value={form.eventDate}
                          onChange={(e) =>
                            setField("eventDate", e.target.value)
                          }
                          min={minDate || undefined}
                          max="2030-12-31"
                          disabled={isSubmitting}
                          required
                          className="h-12 rounded-xl bg-background pl-10"
                        />
                      </div>

                      <p className="text-xs text-muted-foreground">
                        Choose a future date for your community event.
                      </p>
                    </div>

                    {/* Thumbnail URL */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="thumbnailURL"
                        className="font-semibold"
                      >
                        Event Thumbnail URL{" "}
                        <span className="text-destructive">*</span>
                      </Label>

                      <div className="relative">
                        <ImageIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                        <Input
                          id="thumbnailURL"
                          type="url"
                          value={form.thumbnailURL}
                          onChange={(e) =>
                            setField("thumbnailURL", e.target.value)
                          }
                          placeholder="https://example.com/event-image.jpg"
                          disabled={isSubmitting}
                          required
                          className="h-12 rounded-xl bg-background pl-10"
                        />
                      </div>

                      <p className="text-xs text-muted-foreground">
                        Add a publicly accessible image URL for your event.
                      </p>
                    </div>

                    {/* Image Preview */}
                    {form.thumbnailURL.trim() && (
                      <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-muted/30">

                        {!imageError ? (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={form.thumbnailURL.trim()}
                              alt="Event thumbnail preview"
                              className="aspect-[16/7] w-full object-cover"
                              referrerPolicy="no-referrer"
                              onError={() => setImageError(true)}
                            />

                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-4 pt-10">
                              <p className="text-xs font-semibold text-white">
                                EVENT IMAGE PREVIEW
                              </p>
                            </div>
                          </>
                        ) : (
                          <div className="flex min-h-32 flex-col items-center justify-center gap-2 p-5 text-center">
                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                            <p className="text-sm font-medium">
                              Unable to load image
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Please check your image URL.
                            </p>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setField("thumbnailURL", "");
                            setImageError(false);
                          }}
                          disabled={isSubmitting}
                          aria-label="Remove image URL"
                          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                  </div>
                </div>

                {/* Organizer */}
                <div className="rounded-2xl border border-emerald-700/15 bg-emerald-50/70 p-4 dark:bg-emerald-950/20">
                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300">
                      <User className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                        EVENT ORGANIZER
                      </p>

                      <p className="mt-1 truncate text-sm font-semibold">
                        {session.user.name || "Community Member"}
                      </p>

                      <p className="truncate text-xs text-muted-foreground">
                        {session.user.email}
                      </p>
                    </div>

                    <div className="ml-auto shrink-0">
                      <ShieldCheck className="h-5 w-5 text-emerald-700" />
                    </div>

                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col-reverse gap-3 border-t border-border/70 pt-6 sm:flex-row sm:justify-end">

                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting}
                    onClick={() => router.back()}
                    className="h-12 rounded-xl px-6"
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-12 gap-2 rounded-xl bg-emerald-700 px-7 font-semibold text-white shadow-md shadow-emerald-700/15 hover:bg-emerald-800"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Publishing Event...
                      </>
                    ) : (
                      <>
                        <PlusCircle className="h-4 w-4" />
                        Publish Event
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>

                </div>

              </div>
            </form>
          </div>

          {/* Right Sidebar */}
          <aside className="space-y-5">

            {/* Tips Card */}
            <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">

              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  <Sparkles className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="font-bold">Tips for a Great Event</h3>
                  <p className="text-xs text-muted-foreground">
                    Make your event stand out
                  </p>
                </div>
              </div>

              <div className="space-y-4">

                <div>
                  <p className="text-sm font-semibold">
                    Write a clear title
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Choose a title that explains what your event is about.
                  </p>
                </div>

                <div className="h-px bg-border/70" />

                <div>
                  <p className="text-sm font-semibold">
                    Add useful details
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Explain the purpose, activities, and how people can help.
                  </p>
                </div>

                <div className="h-px bg-border/70" />

                <div>
                  <p className="text-sm font-semibold">
                    Choose a good image
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Use a relevant, high-quality image to attract volunteers.
                  </p>
                </div>

                <div className="h-px bg-border/70" />

                <div>
                  <p className="text-sm font-semibold">
                    Provide an exact location
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Mention the area, city, and venue so participants can find you.
                  </p>
                </div>

              </div>
            </div>

            {/* Community Message */}
            <div className="overflow-hidden rounded-2xl bg-emerald-950 p-5 text-white">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                <HeartHandshake className="h-6 w-6 text-emerald-300" />
              </div>

              <h3 className="text-lg font-bold">
                Every Action Matters.
              </h3>

              <p className="mt-2 text-sm leading-6 text-emerald-100/75">
                A small act of kindness can inspire an entire community.
                Your event could be the beginning of something wonderful.
              </p>

              <div className="mt-5 flex items-center gap-2 text-xs font-medium text-emerald-300">
                <HeartHandshake className="h-4 w-4" />
                Together, we make a difference.
              </div>
            </div>

            {/* Privacy Note */}
            <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-card p-4">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />

              <div>
                <p className="text-sm font-semibold">
                  Community Guidelines
                </p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Make sure your event details are accurate, respectful,
                  and focused on creating a positive community impact.
                </p>
              </div>
            </div>

          </aside>

        </div>
      </section>
    </main>
  );
}
