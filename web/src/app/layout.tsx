import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthGate } from "@/components/AuthGate";

export const metadata: Metadata = {
  title: "Daily Athlete OS",
  description: "Daily operating system for endurance athletes: Norwegian Singles + clean bulking.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "Athlete OS", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-dvh">
        <AuthGate>{children}</AuthGate>
      </body>
    </html>
  );
}
