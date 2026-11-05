import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import ThemeProvider from "@/components/providers/ThemeProvider";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { Toaster } from "@/components/ui/toast";

export const metadata: Metadata = {
  title: "CareCircle — Social Development Events Platform",
  description: "Small Actions, Big Impact. Create, join, and track social service events in your local area.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased text-foreground">
        <ThemeProvider>
          <Toaster />
          <Suspense fallback={<div className="h-16 border-b bg-background/95" />}>
            <Navbar />
          </Suspense>
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
