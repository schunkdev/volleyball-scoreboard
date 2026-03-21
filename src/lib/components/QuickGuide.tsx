"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Hand,
  Trophy,
  Undo2,
  Smartphone,
  PencilLine,
  ChevronRight,
} from "lucide-react";

const STORAGE_KEY = "vb-scoreboard-quickguide-seen";
const SHOW_EVENT = "vb-scoreboard-show-quickguide";

const STEPS = [
  {
    icon: Hand,
    accent: "text-primary",
    title: "Score control",
    body: "Tap the big score to add a point. Swipe up to add 1 and swipe down to subtract 1.",
  },
  {
    icon: PencilLine,
    accent: "text-primary",
    title: "Manual entry",
    body: "Long-press the big score to open direct score entry. This is the fastest way to correct larger mistakes.",
  },
  {
    icon: Hand,
    accent: "text-secondary",
    title: "Quick adjust",
    body: "Drag up or down on the big score, then hold in that direction to change score in bigger jumps.",
  },
  {
    icon: Trophy,
    accent: "text-secondary",
    title: "Team name and sets",
    body: "Tap the team name to add a set won. Long-press the team name to edit the team name and set count.",
  },
  {
    icon: Undo2,
    accent: "text-on-surface",
    title: "Buttons and controls",
    body: "Use the faint + and - buttons for single-point changes, Undo in the bottom bar to step back, and Settings for game mode, unlimited sets, and theme.",
  },
  {
    icon: Smartphone,
    accent: "text-on-surface-variant",
    title: "Best view",
    body: "On phones, landscape orientation gives the best scoreboard layout and touch targets.",
  },
] as const;

export const QuickGuide = () => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    queueMicrotask(() => {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setOpen(true);
      }
    });

    const onShowGuide = () => {
      setStep(0);
      setOpen(true);
    };
    window.addEventListener(SHOW_EVENT, onShowGuide);
    return () => window.removeEventListener(SHOW_EVENT, onShowGuide);
  }, []);

  const dismiss = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
    setStep(0);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
      if (e.key === "ArrowRight") {
        setStep((prev) => Math.min(prev + 1, STEPS.length - 1));
      }
      if (e.key === "ArrowLeft") {
        setStep((prev) => Math.max(prev - 1, 0));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, dismiss]);

  const isLastStep = step === STEPS.length - 1;
  const currentStep = STEPS[step];
  const CurrentIcon = currentStep.icon;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="quickguide-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-center justify-center p-6 pointer-events-auto bg-black/65 backdrop-blur-md"
          onClick={dismiss}
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 16 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="glass-panel max-w-lg w-full max-h-[min(85vh,640px)] overflow-y-auto rounded-3xl border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] p-8 md:p-10"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-[10px] uppercase tracking-[0.25em] text-on-surface-variant mb-2">
              Quick guide
            </p>
            <h2
              id="quickguide-title"
              className="text-3xl md:text-4xl font-headline font-black uppercase tracking-tighter text-on-surface mb-2"
            >
              {currentStep.title}
            </h2>
            <div className="flex items-center gap-3 mb-6">
              <span className={`shrink-0 ${currentStep.accent}`}>
                <CurrentIcon size={22} strokeWidth={2} />
              </span>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {currentStep.body}
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 mb-8">
              {STEPS.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === step
                      ? "w-6 bg-primary"
                      : "w-3 bg-white/20"
                  }`}
                />
              ))}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
              <button
                type="button"
                onClick={() => setStep((prev) => Math.max(prev - 1, 0))}
                disabled={step === 0}
                className="px-6 py-3 rounded-full border border-white/15 text-on-surface-variant font-bold uppercase tracking-widest text-xs disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/5 transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  if (isLastStep) dismiss();
                  else setStep((prev) => Math.min(prev + 1, STEPS.length - 1));
                }}
                className="px-8 py-3 rounded-full bg-primary text-bg font-headline font-black uppercase tracking-widest text-xs shadow-[0_0_24px_var(--theme-primary-muted)] hover:opacity-95 transition-opacity active:scale-[0.98] inline-flex items-center justify-center gap-2"
              >
                {isLastStep ? "Get started" : "Next"}
                {!isLastStep && <ChevronRight size={14} />}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
