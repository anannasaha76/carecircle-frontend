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
} from "lucide-react";

import { useSession } from "@/lib/auth-client";
import { notify } from "@/lib/notify";

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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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



const emptySubscribe = () => () => {};

export default function CreateEventPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const minDate = useSyncExternalStore(
    emptySubscribe,
    getTomorrowString,
    () => ""
  );

  useEffect(() => {
    if (!isPending && !session) {
      notify.error("Authentication Required", "Please sign in to create an event.");
      router.push("/login");
    }
  }, [session, isPending, router]);

  const setField = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validate = (): string | null => {
    if (!form.title.trim()) return "Event title is required.";
    if (form.title.trim().length < 5) return "Title must be at least 5 characters.";
    if (!form.description.trim()) return "Description is required.";
    if (form.description.trim().length < 20)
      return "Description must be at least 20 characters.";
    if (!form.eventType) return "Please select an event type.";
    if (!form.location.trim()) return "Location is required.";
    if (!form.eventDate) return "Event date is required.";

    const selected = new Date(form.eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selected <= today) return "Event date must be in the future.";

    if (form.thumbnailURL.trim()) {
      try {
        new URL(form.thumbnailURL.trim());
      } catch {
        return "Thumbnail must be a valid URL (or leave it empty).";
      }
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const error = validate();
    if (error) {
      notify.error("Validation Error", error);
      return;
    }

    if (!session?.user?.email) {
      notify.error("Not Authenticated", "Your session has expired. Please sign in again.");
      router.push("/login");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      eventType: form.eventType,
      thumbnailURL: form.thumbnailURL.trim() || null,
      location: form.location.trim(),
      eventDate: form.eventDate,
      creatorEmail: session.user.email,
      creatorName: session.user.name || null,
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/events`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { message?: string };
        notify.error("Failed to Create Event", data?.message || "Something went wrong.");
        setIsSubmitting(false);
        return;
      }

      notify.success("Event Created! 🎉", `"${payload.title}" has been published.`);
      setForm(INITIAL_FORM);
      router.push("/upcoming-events");
    } catch (err: unknown) {
      notify.error(
        "Network Error",
        err instanceof Error ? err.message : "Could not reach the server."
      );
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
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-emerald-50/60 via-background to-background dark:from-emerald-950/20 dark:via-background dark:to-background">
      <div className="border-b bg-background/70 backdrop-blur-sm">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-md">
              <PlusCircle className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Create a New Event
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Organise a community event and invite people to join in.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <HeartHandshake className="h-5 w-5 text-emerald-700" />
              Event Details
            </CardTitle>
            <CardDescription>
              All fields marked with <span className="text-destructive">*</span> are
              required.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="title" className="flex items-center gap-1.5 font-medium">
                  <FileText className="h-4 w-4 text-emerald-700" />
                  Event Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setField("title", e.target.value)}
                  placeholder="e.g. Winter Clothes Distribution – Mirpur 10"
                  disabled={isSubmitting}
                  maxLength={120}
                  required
                  className="h-10"
                />
                <p className="text-[11px] text-muted-foreground">
                  {form.title.length}/120 characters
                </p>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="description"
                  className="flex items-center gap-1.5 font-medium"
                >
                  <FileText className="h-4 w-4 text-emerald-700" />
                  Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                  placeholder="Describe the event — what will happen, who should join, what to bring…"
                  disabled={isSubmitting}
                  rows={4}
                  maxLength={2000}
                  required
                  className="resize-none"
                />
                <p className="text-[11px] text-muted-foreground">
                  {form.description.length}/2000 · minimum 20 characters
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5 font-medium">
                    <Tag className="h-4 w-4 text-emerald-700" />
                    Event Type <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={form.eventType}
                    onValueChange={(val) => setField("eventType", val ?? "")}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue placeholder="Select a type…" />
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

               
                <div className="space-y-1.5">
                  <Label
                    htmlFor="location"
                    className="flex items-center gap-1.5 font-medium"
                  >
                    <MapPin className="h-4 w-4 text-emerald-700" />
                    Location <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="location"
                    value={form.location}
                    onChange={(e) => setField("location", e.target.value)}
                    placeholder="e.g. Mohammadpur, Dhaka"
                    disabled={isSubmitting}
                    maxLength={120}
                    required
                    className="h-10"
                  />
                </div>
              </div>

             
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="eventDate"
                    className="flex items-center gap-1.5 font-medium"
                  >
                    <CalendarDays className="h-4 w-4 text-emerald-700" />
                    Event Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="eventDate"
                    type="date"
                    value={form.eventDate}
                    onChange={(e) => setField("eventDate", e.target.value)}
                    min={minDate || undefined}
                    max="2030-12-31"
                    disabled={isSubmitting}
                    required
                    className="h-10"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Must be a future date {minDate ? `(from ${minDate})` : ""}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="thumbnailURL"
                    className="flex items-center gap-1.5 font-medium"
                  >
                    <ImageIcon className="h-4 w-4 text-emerald-700" />
                    Thumbnail Image URL{" "}
                    <span className="text-muted-foreground font-normal">(optional)</span>
                  </Label>
                  <Input
                    id="thumbnailURL"
                    type="url"
                    value={form.thumbnailURL}
                    onChange={(e) => setField("thumbnailURL", e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    disabled={isSubmitting}
                    className="h-10"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Direct image link ending in .jpg / .png / .webp
                  </p>
                </div>
              </div>

              
              {form.thumbnailURL.trim() && (
                <div className="overflow-hidden rounded-xl border border-border/60 bg-muted/30">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.thumbnailURL.trim()}
                    alt="Thumbnail preview"
                    className="max-h-48 w-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <p className="px-3 py-1.5 text-[11px] text-muted-foreground">
                    Preview — image must be a direct URL
                  </p>
                </div>
              )}

              <div className="rounded-xl border border-emerald-700/20 bg-emerald-50/60 px-4 py-3 dark:bg-emerald-950/20">
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-emerald-800 dark:text-emerald-300">
                    Event organiser:
                  </span>{" "}
                  {session.user.name ? `${session.user.name} ` : ""}
                  <span className="font-mono text-xs">{session.user.email}</span>
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Your email is saved with the event so you can manage it later.
                </p>
              </div>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting}
                  onClick={() => router.back()}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full gap-2 bg-emerald-700 hover:bg-emerald-800 text-white sm:w-auto"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Publishing…
                    </>
                  ) : (
                    <>
                      <ArrowRight className="h-4 w-4" />
                      Publish Event
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

