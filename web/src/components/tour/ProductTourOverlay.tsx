"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Sparkles, X } from "lucide-react";
import { TOUR_STEPS, useProductTour } from "./TourContext";

export function ProductTourOverlay() {
  const { isOpen, currentStep, currentStepIndex, nextStep, prevStep, skipTour } =
    useProductTour();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!isOpen || !currentStep?.selector) {
      setTargetRect(null);
      return;
    }

    function updateRect() {
      if (!currentStep?.selector) return;
      const el = document.querySelector(currentStep.selector);
      if (el) {
        setTargetRect(el.getBoundingClientRect());
      } else {
        setTargetRect(null);
      }
    }

    updateRect();
    const timer = setTimeout(updateRect, 300);
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [isOpen, currentStep]);

  if (!isOpen || !currentStep) return null;

  const isLast = currentStepIndex === TOUR_STEPS.length - 1;
  const isFirst = currentStepIndex === 0;

  return (
    <div className="fixed inset-0 z-50 pointer-events-auto flex flex-col justify-end p-4 pb-20 sm:pb-6 transition-all animate-in fade-in duration-300">
      {/* Backdrop with cutout / dim effect */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-[2px] transition-all"
        onClick={skipTour}
      />

      {/* Target highlight ring if element is found */}
      {targetRect && (
        <div
          className="fixed pointer-events-none rounded-3xl border-2 border-lime-400 ring-4 ring-lime-400/20 shadow-2xl shadow-lime-400/30 transition-all duration-300 z-50"
          style={{
            top: Math.max(8, targetRect.top - 6),
            left: Math.max(8, targetRect.left - 6),
            width: targetRect.width + 12,
            height: targetRect.height + 12,
          }}
        />
      )}

      {/* Tooltip Card */}
      <div className="relative z-50 max-w-md w-full mx-auto rounded-3xl border border-lime-400/30 bg-[#14161d]/95 p-5 shadow-2xl shadow-black/80 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-lime-300 uppercase tracking-wider bg-lime-400/15 px-2.5 py-0.5 rounded-full border border-lime-400/30">
            <Sparkles className="w-3 h-3 text-lime-400" />
            {currentStep.badge}
          </span>
          <button
            type="button"
            onClick={skipTour}
            className="text-zinc-500 hover:text-zinc-300 p-1 transition-colors"
            aria-label="Tutup panduan"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <h3 className="text-base font-bold text-zinc-100 tracking-tight">
          {currentStep.title}
        </h3>
        <p className="text-xs text-zinc-300 mt-1.5 leading-relaxed">
          {currentStep.description}
        </p>

        {/* Step dots & Action Buttons */}
        <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            {TOUR_STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentStepIndex
                    ? "w-5 bg-lime-400"
                    : "w-1.5 bg-zinc-700"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                type="button"
                onClick={prevStep}
                className="min-h-8 px-2.5 rounded-xl border border-white/[0.08] text-xs font-semibold text-zinc-300 hover:bg-zinc-800 transition-colors flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" />
                Kembali
              </button>
            )}

            <button
              type="button"
              onClick={nextStep}
              className="min-h-8 px-3.5 rounded-xl bg-lime-400 text-zinc-950 text-xs font-bold hover:bg-lime-300 transition-colors shadow-sm flex items-center gap-1.5"
            >
              {isLast ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Selesai
                </>
              ) : (
                <>
                  Lanjut
                  <ArrowRight className="w-3 h-3" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
