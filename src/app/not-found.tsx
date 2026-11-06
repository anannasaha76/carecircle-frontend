import Link from "next/link";
import {
    ArrowRight,
    Compass,
    HeartHandshake,
    SearchX,
    Home,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
    return (
        <main className="relative flex min-h-[80vh] items-center justify-center overflow-hidden bg-slate-50 px-4 py-16 dark:bg-background">
            {/* Background Decoration */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-emerald-200/30 blur-3xl dark:bg-emerald-900/10" />
                <div className="absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-emerald-300/20 blur-3xl dark:bg-emerald-800/10" />

                <div className="absolute inset-0 bg-[radial-gradient(#10b98112_1px,transparent_1px)] [background-size:24px_24px]" />
            </div>

            <div className="relative z-10 mx-auto w-full max-w-2xl text-center">
                {/* Icon */}
                <div className="relative mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-[2rem] border border-emerald-200 bg-white shadow-xl shadow-emerald-950/5 dark:border-emerald-900/60 dark:bg-card">
                    <div className="absolute inset-2 rounded-[1.5rem] bg-emerald-50 dark:bg-emerald-950/50" />

                    <SearchX className="relative h-11 w-11 text-emerald-700 dark:text-emerald-400" />

                    <span className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full border-4 border-slate-50 bg-emerald-600 text-white dark:border-background">
                        <Compass className="h-4 w-4" />
                    </span>
                </div>

                {/* 404 */}
                <div className="relative">
                    <h1 className="select-none text-[clamp(7rem,22vw,13rem)] font-black leading-none tracking-tighter text-emerald-700/10 dark:text-emerald-400/10">
                        404
                    </h1>

                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.25em] text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/60 dark:text-emerald-300">
                            Page Not Found
                        </span>
                    </div>
                </div>

                {/* Content */}
                <h2 className="mt-5 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                    Looks like you&apos;ve lost your way!
                </h2>

                <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-slate-600 dark:text-muted-foreground sm:text-base">
                    The page you&apos;re looking for doesn&apos;t exist, may have been
                    moved, or is temporarily unavailable. But there are still plenty of
                    ways to make a positive impact with CareCircle.
                </p>

                {/* Actions */}
                <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <Link
                        href="/"
                        className={cn(
                            buttonVariants(),
                            "h-11 w-full gap-2 rounded-xl bg-emerald-700 px-6 font-semibold text-white shadow-lg shadow-emerald-900/15 transition-all hover:-translate-y-0.5 hover:bg-emerald-800 sm:w-auto"
                        )}
                    >
                        <Home className="h-4 w-4" />
                        Back to Home
                    </Link>

                    <Link
                        href="/upcoming-events"
                        className={cn(
                            buttonVariants({ variant: "outline" }),
                            "h-11 w-full gap-2 rounded-xl border-emerald-200 bg-white px-6 font-semibold text-emerald-800 transition-all hover:-translate-y-0.5 hover:border-emerald-400 hover:bg-emerald-50 dark:border-emerald-900/60 dark:bg-card dark:text-emerald-300 dark:hover:bg-emerald-950/40 sm:w-auto"
                        )}
                    >
                        Explore Events
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>


            </div>
        </main>
    );
}