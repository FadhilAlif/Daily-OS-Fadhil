import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppDataProvider } from "@/components/AppDataProvider";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { TourProvider } from "@/components/tour/TourContext";
import { ProductTourOverlay } from "@/components/tour/ProductTourOverlay";

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
        <AppDataProvider>
          <TourProvider>
            <Header />
            <main className="max-w-md mx-auto px-4 pt-4 pb-24 space-y-4">{children}</main>
            <BottomNav />
            <ProductTourOverlay />
          </TourProvider>
        </AppDataProvider>
      </body>
    </html>
  );
}
