"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { HexColorPicker } from "react-colorful";
import { motion, AnimatePresence } from "motion/react";
import {
  Check,
  ChevronDown,
  Coffee,
  Github,
  Infinity as InfinityIcon,
  Palette,
  User,
  X,
  Zap,
} from "lucide-react";
import { Toggle } from "./Toggle";
import { themes } from "@/lib/themes";
import { parseHexColor } from "@/lib/teamColors";
import { cn } from "@/lib/utils";

export const SettingsDialog = ({
  isOpen,
  onClose,
  config,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  config: {
    gameMode: boolean;
    unlimitedSets: boolean;
    theme: string;
    teamColorA: string;
    teamColorB: string;
  };
  onSave: (newConfig: {
    gameMode: boolean;
    unlimitedSets: boolean;
    theme: string;
    teamColorA: string;
    teamColorB: string;
  }) => void;
}) => {
  const [gameMode, setGameMode] = useState(config.gameMode);
  const [unlimitedSets, setUnlimitedSets] = useState(config.unlimitedSets);
  const [theme, setTheme] = useState(config.theme);
  const [teamColorA, setTeamColorA] = useState(config.teamColorA);
  const [teamColorB, setTeamColorB] = useState(config.teamColorB);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [showTeamColors, setShowTeamColors] = useState(false);
  const [openTeamColorPicker, setOpenTeamColorPicker] = useState<
    "A" | "B" | null
  >(null);
  const teamColorPickerRef = useRef<HTMLDivElement | null>(null);
  const teamColorPortalRef = useRef<HTMLDivElement | null>(null);
  const [teamColorPickerFixedStyle, setTeamColorPickerFixedStyle] = useState<{
    top: number;
    left: number;
  } | null>(null);

  /* Portaled picker uses fixed top/left from anchor rect (setState syncs layout → React). */
  /* eslint-disable react-hooks/set-state-in-effect -- measure + cleanup clear fixed position state */
  useLayoutEffect(() => {
    if (openTeamColorPicker === null) {
      setTeamColorPickerFixedStyle(null);
      return;
    }
    const measure = () => {
      const el = teamColorPickerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const margin = 8;
      const panelApproxWidth = 252;
      let left = r.left;
      const maxLeft = window.innerWidth - panelApproxWidth - margin;
      left = Math.min(left, Math.max(margin, maxLeft));
      setTeamColorPickerFixedStyle({ top: r.bottom + margin, left });
    };
    measure();
    window.addEventListener("resize", measure);
    document.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      document.removeEventListener("scroll", measure, true);
      setTeamColorPickerFixedStyle(null);
    };
  }, [openTeamColorPicker]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (openTeamColorPicker === null) return;
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (teamColorPickerRef.current?.contains(t)) return;
      if (teamColorPortalRef.current?.contains(t)) return;
      setOpenTeamColorPicker(null);
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () =>
      document.removeEventListener("pointerdown", onPointerDown, true);
  }, [openTeamColorPicker]);

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
      onClick={(e) => {
        if (e.target !== e.currentTarget) return;
        if (openTeamColorPicker !== null) {
          setOpenTeamColorPicker(null);
          return;
        }
        onClose();
      }}
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
            sublabel="Automatic set wins at 25 points (2-point lead required). Score resets on set win. Under each team name, dots show timeouts (2 per set); they clear when a set ends."
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
                  className={cn(
                    "transition-transform",
                    showThemeSelector && "rotate-180",
                  )}
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
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: t.colors.primary }}
                        />
                        {t.name}
                      </div>
                      {theme === t.id && <Check size={14} />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-3 rounded-2xl border border-white/5 bg-white/5 p-4">
            <button
              type="button"
              onClick={() => {
                setShowTeamColors((o) => {
                  const next = !o;
                  if (!next) setOpenTeamColorPicker(null);
                  return next;
                });
              }}
              className="flex w-full items-center justify-between gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-white/5"
              aria-expanded={showTeamColors}
            >
              <span className="text-xs font-bold uppercase tracking-widest text-on-surface">
                Custom team colors
              </span>
              <ChevronDown
                size={14}
                className={cn(
                  "shrink-0 text-on-surface-variant transition-transform",
                  showTeamColors && "rotate-180",
                )}
                aria-hidden
              />
            </button>

            <AnimatePresence initial={false}>
              {showTeamColors && (
                <motion.div
                  key="team-colors"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-3"
                >
                  <p className="text-[10px] leading-relaxed text-on-surface-variant">
                    Optional hex for each side. Leave empty to use the theme
                    defaults. Tap the swatch to open the picker.
                  </p>
                  {(
                    [
                      {
                        id: "A" as const,
                        label: "Team A",
                        value: teamColorA,
                        onChange: setTeamColorA,
                        fallback: currentTheme.colors.primary,
                      },
                      {
                        id: "B" as const,
                        label: "Team B",
                        value: teamColorB,
                        onChange: setTeamColorB,
                        fallback: currentTheme.colors.secondary,
                      },
                    ] as const
                  ).map((row) => {
                    const parsed = parseHexColor(row.value);
                    const isPickerOpen = openTeamColorPicker === row.id;
                    const hasCustomColor = row.value.trim() !== "";
                    return (
                      <div
                        key={row.id}
                        className="relative flex items-center gap-3"
                      >
                        <span className="w-16 shrink-0 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                          {row.label}
                        </span>
                        <input
                          type="text"
                          value={row.value}
                          onChange={(e) => row.onChange(e.target.value)}
                          placeholder="#rrggbb"
                          spellCheck={false}
                          autoComplete="off"
                          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 font-mono text-sm text-on-surface outline-none placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-primary/40"
                        />
                        <div
                          ref={isPickerOpen ? teamColorPickerRef : undefined}
                          className="relative flex shrink-0 items-center gap-2"
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setOpenTeamColorPicker((t) =>
                                t === row.id ? null : row.id,
                              )
                            }
                            className={cn(
                              "h-10 w-10 rounded-xl border shadow-inner transition-[box-shadow] outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                              isPickerOpen
                                ? "border-primary/60 ring-2 ring-primary/30"
                                : "border-white/15",
                            )}
                            style={{ backgroundColor: parsed ?? row.fallback }}
                            title={
                              parsed
                                ? "Open color picker"
                                : "Theme default — open picker"
                            }
                            aria-expanded={isPickerOpen}
                            aria-haspopup="dialog"
                            aria-label={`${row.label} color preview, open picker`}
                          />
                          {hasCustomColor && (
                            <button
                              type="button"
                              onClick={() => {
                                row.onChange("");
                                setOpenTeamColorPicker((t) =>
                                  t === row.id ? null : t,
                                );
                              }}
                              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-500/35 bg-red-950/55 text-red-400 transition-colors hover:border-red-400/50 hover:bg-red-950/80 hover:text-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50"
                              title="Reset to theme default"
                              aria-label={`Clear ${row.label} custom color`}
                            >
                              <X size={20} strokeWidth={2.25} aria-hidden />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="mb-5 flex w-full items-center justify-between gap-3 md:mb-6">
          <button
            type="button"
            onClick={handleShowGuideAgain}
            className="min-w-0 cursor-pointer text-left text-xs uppercase tracking-[0.2em] text-on-surface-variant underline underline-offset-4 transition-colors hover:text-primary"
          >
            Show quick guide again
          </button>
          <div className="flex shrink-0 gap-2">
            <a
              href="https://github.com/schunkdev/volleyball-scoreboard"
              target="_blank"
              rel="noopener noreferrer"
              title="Repository"
              aria-label="Repository"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-on-surface-variant transition-colors hover:border-white/15 hover:bg-white/10 hover:text-primary"
            >
              <Github size={20} strokeWidth={2} />
            </a>
            <a
              href="https://schunk.dev"
              target="_blank"
              rel="noopener noreferrer"
              title="Developer"
              aria-label="Developer"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-on-surface-variant transition-colors hover:border-white/15 hover:bg-white/10 hover:text-primary"
            >
              <User size={20} strokeWidth={2} />
            </a>
            <a
              href="https://www.buymeacoffee.com/nikolaischunk"
              target="_blank"
              rel="noopener noreferrer"
              title="Buy me a coffee"
              aria-label="Buy me a coffee"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-on-surface-variant transition-colors hover:border-white/15 hover:bg-white/10 hover:text-primary"
            >
              <Coffee size={20} strokeWidth={2} />
            </a>
          </div>
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
              onSave({
                gameMode,
                unlimitedSets,
                theme,
                teamColorA: parseHexColor(teamColorA) ?? "",
                teamColorB: parseHexColor(teamColorB) ?? "",
              });
              onClose();
            }}
            className="flex-1 cursor-pointer rounded-2xl bg-primary py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-primary-contrast shadow-[0_0_30px_var(--theme-primary-muted)] transition-all active:scale-95 md:py-5"
          >
            Save Config
          </button>
        </div>
      </motion.div>
      {typeof document !== "undefined" &&
        openTeamColorPicker !== null &&
        teamColorPickerFixedStyle !== null &&
        createPortal(
          <div
            ref={teamColorPortalRef}
            className="pointer-events-auto z-[200] rounded-2xl border border-white/10 bg-surface-variant p-3 shadow-xl"
            style={{
              position: "fixed",
              top: teamColorPickerFixedStyle.top,
              left: teamColorPickerFixedStyle.left,
            }}
            role="dialog"
            aria-label={
              openTeamColorPicker === "A"
                ? "Team A color picker"
                : "Team B color picker"
            }
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <HexColorPicker
              className="settings-team-hex-picker"
              color={
                openTeamColorPicker === "A"
                  ? (parseHexColor(teamColorA) ?? currentTheme.colors.primary)
                  : (parseHexColor(teamColorB) ?? currentTheme.colors.secondary)
              }
              onChange={
                openTeamColorPicker === "A" ? setTeamColorA : setTeamColorB
              }
            />
          </div>,
          document.body,
        )}
    </motion.div>
  );
};
