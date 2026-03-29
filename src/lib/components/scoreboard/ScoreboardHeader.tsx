"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { LogOut, Maximize2, Minimize2, Radio, Settings, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { normalizeLiveCode } from "@/lib/live/liveScoreboardState";

type Props = {
  isCompactMobile: boolean;
  currentSet: number;
  setsWonA: number;
  setsWonB: number;
  unlimitedSets: boolean;
  supportsFullscreen: boolean;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onOpenSettings: () => void;
  /** Main host: opens Live dialog (broadcast / join). Omit on subscriber-only views. */
  onOpenLiveSettings?: () => void;
  readOnly?: boolean;
  hideSettings?: boolean;
  liveMode?: "off" | "host" | "subscriber";
  liveCode?: string | null;
  liveViewerCount?: number;
  firebaseOnline?: boolean;
  /** Main scoreboard: host uses Live dialog + header radio; subscriber uses dropdown. */
  enableHostLiveActions?: boolean;
  /** Main host: radio opens Live dialog instead of header dropdown. */
  hostLiveInSettingsOnly?: boolean;
};

export function ScoreboardHeader({
  isCompactMobile,
  currentSet,
  setsWonA,
  setsWonB,
  unlimitedSets,
  supportsFullscreen,
  isFullscreen,
  onToggleFullscreen,
  onOpenSettings,
  onOpenLiveSettings,
  readOnly = false,
  hideSettings = false,
  liveMode = "off",
  liveCode = null,
  liveViewerCount = 0,
  firebaseOnline = true,
  enableHostLiveActions = true,
  hostLiveInSettingsOnly = false,
}: Props) {
  const router = useRouter();
  const [liveMenuOpen, setLiveMenuOpen] = useState(false);
  const [joinInput, setJoinInput] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);

  const showLiveChip = liveMode !== "off" && liveCode;
  const iconSize = isCompactMobile ? 20 : 24;
  const showLiveMenuButton = !readOnly || !enableHostLiveActions;
  const showHostLiveDialogButton =
    showLiveMenuButton && hostLiveInSettingsOnly && Boolean(onOpenLiveSettings);
  const showHeaderLiveDropdown = showLiveMenuButton && !hostLiveInSettingsOnly;
  const isHostLive = liveMode === "host";

  useEffect(() => {
    if (!liveMenuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setLiveMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [liveMenuOpen]);

  const submitJoin = () => {
    const c = normalizeLiveCode(joinInput);
    if (!c) return;
    setLiveMenuOpen(false);
    setJoinInput("");
    router.push(`/live/${c}`);
  };

  return (
    <header
      className={cn(
        "absolute top-0 left-0 right-0 z-40 flex justify-between items-center pointer-events-none",
        isCompactMobile ? "px-3 py-2.5" : "px-8 py-6",
      )}
    >
      <div className={cn(isCompactMobile ? "w-20" : "w-48")} />

      {!isCompactMobile && (
        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-auto gap-2">
          <div className="flex items-center gap-4 rounded-full border border-white/5 bg-surface-container/40 px-8 py-2 backdrop-blur-md">
            <div className="flex min-w-[60px] flex-col items-center">
              <span className="font-headline text-xl font-black text-primary">
                {!unlimitedSets && (setsWonA === 3 || setsWonB === 3)
                  ? "FINAL"
                  : currentSet}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary/90">
                {setsWonA}-{setsWonB}
              </span>
            </div>
          </div>
          {showLiveChip && (
            <div
              className={cn(
                "flex items-center gap-3 rounded-full border px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest backdrop-blur-md",
                firebaseOnline
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
                  : "border-amber-500/30 bg-amber-500/10 text-amber-100",
              )}
            >
              <span className="flex items-center gap-1.5">
                <Radio
                  size={12}
                  className={cn(
                    liveMode === "host" && firebaseOnline && "animate-live-shimmer",
                    liveMode !== "host" && firebaseOnline && "text-emerald-400",
                  )}
                />
                {liveMode === "host" ? "Live" : "Watching"}
              </span>
              <span className="text-white/50">·</span>
              <span className="font-mono tracking-widest">{liveCode}</span>
              {liveMode === "host" && (
                <>
                  <span className="text-white/50">·</span>
                  <span className="flex items-center gap-1 text-on-surface">
                    <Users size={12} />
                    {liveViewerCount}
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {isCompactMobile && showLiveChip && (
        <div className="pointer-events-none absolute left-1/2 top-2.5 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-surface-container/50 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-on-surface backdrop-blur-md">
          <Radio
            size={10}
            className={cn(
              liveMode === "host" && firebaseOnline && "animate-live-shimmer",
              liveMode !== "host" && firebaseOnline && "text-emerald-400",
            )}
          />
          <span className="font-mono">{liveCode}</span>
          {liveMode === "host" && (
            <>
              <Users size={10} />
              {liveViewerCount}
            </>
          )}
        </div>
      )}

      <div
        className={cn(
          "pointer-events-auto flex items-center",
          isCompactMobile ? "gap-3" : "gap-6",
        )}
      >
        {supportsFullscreen && (
          <button
            type="button"
            onClick={onToggleFullscreen}
            className="text-on-surface-variant transition-colors hover:text-primary"
            aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 size={iconSize} /> : <Maximize2 size={iconSize} />}
          </button>
        )}

        {showHostLiveDialogButton && (
          <button
            type="button"
            onClick={onOpenLiveSettings}
            className={cn(
              "transition-colors",
              isHostLive
                ? "text-primary"
                : "text-on-surface-variant hover:text-primary",
            )}
            aria-label="Live broadcast settings"
          >
            <Radio size={iconSize} className={cn(isHostLive && "animate-live-shimmer")} />
          </button>
        )}

        {showHeaderLiveDropdown && (
          <div className="relative" ref={wrapRef}>
            <button
              type="button"
              onClick={() => setLiveMenuOpen((o) => !o)}
              className={cn(
                "transition-colors",
                isHostLive
                  ? "text-primary"
                  : "text-on-surface-variant hover:text-primary",
              )}
              aria-expanded={liveMenuOpen}
              aria-haspopup="true"
              aria-label="Live menu"
            >
              <Radio size={iconSize} className={cn(isHostLive && "animate-live-shimmer")} />
            </button>

            <AnimatePresence>
              {liveMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full z-50 mt-2 w-[min(calc(100vw-2rem),16rem)] rounded-2xl border border-white/10 bg-surface/95 py-2 shadow-2xl backdrop-blur-xl"
                >
                  {!isHostLive && (
                    <div className="border-b border-white/5 px-3 pb-2 pt-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                        Join game
                      </p>
                      <div className="mt-2 flex gap-2">
                        <input
                          type="text"
                          inputMode="text"
                          autoCapitalize="characters"
                          maxLength={4}
                          placeholder="CODE"
                          value={joinInput}
                          onChange={(e) =>
                            setJoinInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))
                          }
                          onKeyDown={(e) => e.key === "Enter" && submitJoin()}
                          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 font-mono text-sm font-bold tracking-widest text-on-surface outline-none focus:ring-2 focus:ring-primary/40"
                        />
                        <button
                          type="button"
                          onClick={submitJoin}
                          disabled={!normalizeLiveCode(joinInput)}
                          className="shrink-0 rounded-xl bg-primary px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-primary-contrast transition-opacity disabled:opacity-30"
                        >
                          Open
                        </button>
                      </div>
                    </div>
                  )}

                  {liveMode === "subscriber" && (
                    <div className="border-t border-white/5 px-3 pb-2 pt-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                        Stop watching
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setLiveMenuOpen(false);
                          router.push("/");
                        }}
                        className="mt-2 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-bold uppercase tracking-widest text-red-200 transition-colors hover:bg-red-500/10"
                      >
                        <LogOut size={14} />
                        Back home
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {!hideSettings && !readOnly && (
          <button
            type="button"
            onClick={onOpenSettings}
            className="text-on-surface-variant transition-colors hover:text-primary"
            aria-label="Game settings"
          >
            <Settings size={iconSize} />
          </button>
        )}
      </div>
    </header>
  );
}
