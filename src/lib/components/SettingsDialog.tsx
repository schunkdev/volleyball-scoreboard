"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, ChevronDown, Infinity as InfinityIcon, Palette, Zap } from "lucide-react";
import { Toggle } from "./Toggle";
import { themes } from "@/lib/themes";
import { cn } from "@/lib/utils";

export const SettingsDialog = ({
  isOpen,
  onClose,
  config,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  config: { gameMode: boolean; unlimitedSets: boolean; theme: string };
  onSave: (newConfig: { gameMode: boolean; unlimitedSets: boolean; theme: string }) => void;
}) => {
  const [gameMode, setGameMode] = useState(config.gameMode);
  const [unlimitedSets, setUnlimitedSets] = useState(config.unlimitedSets);
  const [theme, setTheme] = useState(config.theme);
  const [showThemeSelector, setShowThemeSelector] = useState(false);

  const handleShowGuideAgain = () => {
    window.dispatchEvent(new Event("vb-scoreboard-show-quickguide"));
    onClose();
  };

  if (!isOpen) return null;

  const currentTheme = themes.find((t) => t.id === theme) || themes[0];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pointer-events-auto absolute inset-0 z-[100] flex cursor-pointer items-center justify-center bg-black/60 p-3 backdrop-blur-md md:p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="flex max-h-[calc(100dvh-max(env(safe-area-inset-top),0.75rem)-max(env(safe-area-inset-bottom),0.75rem)-1.5rem)] w-full max-w-[520px] cursor-default flex-col items-center overflow-y-auto rounded-3xl border border-white/10 bg-surface p-5 shadow-[0_30px_60px_rgba(0,0,0,0.5)] md:rounded-[40px] md:p-10"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-2 font-headline text-3xl font-black uppercase italic tracking-tighter text-on-surface md:text-5xl">
          Settings
        </h2>
        <div className="mb-5 h-1.5 w-12 rounded-full bg-primary shadow-[0_0_15px_var(--theme-primary)] md:mb-8" />

        <div className="mb-6 w-full space-y-4 md:mb-10">
          <Toggle
            active={gameMode}
            onToggle={() => setGameMode(!gameMode)}
            label="Game Mode"
            sublabel="Automatic set wins at 25 points (2-point lead required). Score resets on set win."
            icon={Zap}
          />
          <Toggle
            active={unlimitedSets}
            onToggle={() => setUnlimitedSets(!unlimitedSets)}
            label="Unlimited Sets"
            sublabel="Match continues indefinitely. Disables set limits and 'Match Over' announcements."
            icon={InfinityIcon}
          />

          <div className="relative">
            <div
              onClick={() => setShowThemeSelector(!showThemeSelector)}
              className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-white/5 bg-white/5 p-4 transition-colors hover:bg-white/10"
            >
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/5 text-white/40">
                  <Palette size={24} className="shrink-0" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="text-xs font-bold uppercase tracking-widest text-on-surface">
                    Theme Selection
                  </span>
                  <span className="mt-0.5 text-[10px] leading-relaxed text-on-surface-variant">
                    Customize visual style and contrast.
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-on-surface">
                {currentTheme.name}
                <ChevronDown
                  size={14}
                  className={cn("transition-transform", showThemeSelector && "rotate-180")}
                />
              </div>
            </div>

            <AnimatePresence>
              {showThemeSelector && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute left-0 right-0 top-full z-50 mt-2 rounded-2xl border border-white/10 bg-surface-variant p-2 shadow-xl"
                >
                  {themes.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setTheme(t.id);
                        setShowThemeSelector(false);
                      }}
                      className={cn(
                        "flex w-full cursor-pointer items-center justify-between rounded-xl px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors",
                        theme === t.id
                          ? "bg-primary/20 text-primary"
                          : "text-on-surface-variant hover:bg-white/5",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: t.colors.primary }} />
                        {t.name}
                      </div>
                      {theme === t.id && <Check size={14} />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="mb-4 w-full md:mb-5">
          <button
            type="button"
            onClick={handleShowGuideAgain}
            className="cursor-pointer text-xs uppercase tracking-[0.2em] text-on-surface-variant underline underline-offset-4 transition-colors hover:text-primary"
          >
            Show quick guide again
          </button>
        </div>

        <div className="flex w-full gap-3 md:gap-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 cursor-pointer rounded-2xl bg-white/5 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-on-surface transition-all hover:bg-white/10 active:scale-95 md:py-5"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onSave({ gameMode, unlimitedSets, theme });
              onClose();
            }}
            className="flex-1 cursor-pointer rounded-2xl bg-primary py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-primary-contrast shadow-[0_0_30px_var(--theme-primary-muted)] transition-all active:scale-95 md:py-5"
          >
            Save Config
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
