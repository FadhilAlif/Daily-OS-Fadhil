"use client";

import { usePathname } from "next/navigation";
import { AppDataProvider } from "@/components/AppDataProvider";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { TourProvider } from "@/components/tour/TourContext";
import { ProductTourOverlay } from "@/components/tour/ProductTourOverlay";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/login") {
    return (
      <main className="max-w-md mx-auto px-4 pt-4 pb-24 space-y-4">
        {children}
      </main>
    );
  }

  return (
    <AppDataProvider>
      <TourProvider>
        <Header />
        <main className="max-w-md mx-auto px-4 pt-4 pb-24 space-y-4">
          {children}
        </main>
        <BottomNav />
        <ProductTourOverlay />
      </TourProvider>
    </AppDataProvider>
  );
}
