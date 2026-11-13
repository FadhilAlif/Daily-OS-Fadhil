"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";

export interface TourStep {
  id: string;
  route: string;
  selector?: string;
  title: string;
  description: string;
  badge?: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: "cockpit_summary",
    route: "/",
    selector: "#tour-cockpit-hero",
    badge: "1 / 5 · Home",
    title: "Cockpit Kesiapan & Latihan Harian",
    description:
      "Pantau skor kesiapan fisik, status beban harian, dan rekomendasi latihan lari terkini berbasis Norwegian Singles.",
  },
  {
    id: "fab_add_log",
    route: "/",
    selector: "#tour-fab-button",
    badge: "2 / 5 · Tindakan Cepat",
    title: "Tombol Catat Log (+)",
    description:
      "Akses cepat di tengah navigasi untuk mencatat makanan solid, liquid calorie booster, atau sesi beban gym dari mana saja.",
  },
  {
    id: "workout_studio",
    route: "/bulking",
    selector: "#tour-workout-hero",
    badge: "3 / 5 · Workout",
    title: "Workout & Clean Bulking Studio",
    description:
      "Rancang surplus kalori, guardrail rasio Power-to-Weight, sesi Steve Magness Gym (A/B/C), dan timer McGill Big 3 7 detik.",
  },
  {
    id: "planner_sync",
    route: "/planner",
    selector: "#tour-planner-hero",
    badge: "4 / 5 · Planner",
    title: "Weekly Planner & Sync Kalender",
    description:
      "Susun jadwal lari 7 hari dengan rasio baku 75/25 NSA dan terbitkan langsung ke kalender Intervals.icu Anda.",
  },
  {
    id: "lab_race",
    route: "/lab",
    selector: "#tour-lab-hero",
    badge: "5 / 5 · Lab & Race",
    title: "NSA Lab & Race Command",
    description:
      "Audit cardiac drift dari telemetri aktual, matriks interval NSA, serta prediksi race dan fueling gel EJ Sport di Race Command.",
  },
];

const TOUR_STORAGE_KEY = "daily_athlete_product_tour_seen";

interface TourContextValue {
  isOpen: boolean;
  currentStepIndex: number;
  currentStep: TourStep | null;
  startTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
}

const TourContext = createContext<TourContextValue | null>(null);

export function TourProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  // Auto-start for first-time visits on home route
  useEffect(() => {
    try {
      const seen = localStorage.getItem(TOUR_STORAGE_KEY);
      if (!seen && pathname === "/") {
        const timer = setTimeout(() => {
          setIsOpen(true);
          setCurrentStepIndex(0);
        }, 800);
        return () => clearTimeout(timer);
      }
    } catch {
      // Ignore localStorage access restrictions
    }
  }, [pathname]);

  const currentStep = isOpen ? TOUR_STEPS[currentStepIndex] ?? null : null;

  const startTour = useCallback(() => {
    setCurrentStepIndex(0);
    setIsOpen(true);
    if (pathname !== "/") {
      router.push("/");
    }
  }, [pathname, router]);

  const completeTour = useCallback(() => {
    setIsOpen(false);
    try {
      localStorage.setItem(TOUR_STORAGE_KEY, "true");
    } catch {
      // Ignore
    }
  }, []);

  const skipTour = useCallback(() => {
    completeTour();
  }, [completeTour]);

  const nextStep = useCallback(() => {
    if (currentStepIndex >= TOUR_STEPS.length - 1) {
      completeTour();
      return;
    }
    const nextIdx = currentStepIndex + 1;
    const targetRoute = TOUR_STEPS[nextIdx].route;
    setCurrentStepIndex(nextIdx);
    if (pathname !== targetRoute) {
      router.push(targetRoute);
    }
  }, [currentStepIndex, completeTour, pathname, router]);

  const prevStep = useCallback(() => {
    if (currentStepIndex <= 0) return;
    const prevIdx = currentStepIndex - 1;
    const targetRoute = TOUR_STEPS[prevIdx].route;
    setCurrentStepIndex(prevIdx);
    if (pathname !== targetRoute) {
      router.push(targetRoute);
    }
  }, [currentStepIndex, pathname, router]);

  return (
    <TourContext.Provider
      value={{
        isOpen,
        currentStepIndex,
        currentStep,
        startTour,
        nextStep,
        prevStep,
        skipTour,
      }}
    >
      {children}
    </TourContext.Provider>
  );
}

export function useProductTour() {
  const ctx = useContext(TourContext);
  if (!ctx) {
    throw new Error("useProductTour harus digunakan di dalam TourProvider");
  }
  return ctx;
}
