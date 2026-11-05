import type { Metadata } from "next";
import "./globals.css";
import ThemeProvider from "@/components/providers/ThemeProvider";
import Navbar from "@/components/shared/Navbar";
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
          <Navbar />
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
