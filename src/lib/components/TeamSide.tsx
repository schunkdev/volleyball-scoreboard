"use client";

import React, { useState, useRef } from "react";
import { motion } from "motion/react";
import { Infinity as InfinityIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export const TeamSide = ({
  name,
  score,
  setsWon,
  label,
  side,
  color,
  onScoreChange,
  onScoreDialogRequest,
  onNameLongPress,
  onSetWinIncrement,
  onTimeoutsCycle,
  gameMode = false,
  timeoutsUsed = 0,
  unlimitedSets = false,
  compactLayout = false,
  readOnly = false,
}: {
  name: string;
  score: number;
  setsWon: number;
  label: string;
  side: "left" | "right";
  color: "primary" | "secondary";
  onScoreChange: (delta: number) => void;
  onScoreDialogRequest: () => void;
  onNameLongPress: () => void;
  onSetWinIncrement: () => void;
  /** Game mode: tap timeout dots to cycle 0 → 1 → 2 → 0 */
  onTimeoutsCycle?: () => void;
  gameMode?: boolean;
  /** Timeouts used this set (0–2), game mode only */
  timeoutsUsed?: number;
  unlimitedSets?: boolean;
  compactLayout?: boolean;
  readOnly?: boolean;
}) => {
  const [isHolding, setIsHolding] = useState(false);
  const [lastDelta, setLastDelta] = useState(0);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const swipeLongPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const nameLongPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const longPressTriggeredRef = useRef(false);
  const startYRef = useRef<number | null>(null);
  const hasMovedRef = useRef<boolean>(false);
  const ignoreMouseUntilRef = useRef<number>(0);

  const startHold = (delta: number) => {
    if (readOnly) return;
    if (holdTimerRef.current) clearInterval(holdTimerRef.current);
    holdTimerRef.current = setInterval(() => {
      onScoreChange(delta * 5);
    }, 1500);
  };

  const stopHold = () => {
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    setIsHolding(false);
  };

  // --- Name Long Press Handlers ---
  const handleNameStart = () => {
    if (readOnly) return;
    longPressTriggeredRef.current = false;
    nameLongPressTimerRef.current = setTimeout(() => {
      onNameLongPress();
      longPressTriggeredRef.current = true;
    }, 600);
  };

  const handleNameEnd = () => {
    if (nameLongPressTimerRef.current) {
      clearTimeout(nameLongPressTimerRef.current);
      nameLongPressTimerRef.current = null;
    }
  };

  const handleNameClick = () => {
    if (readOnly) return;
    if (!longPressTriggeredRef.current) {
      onSetWinIncrement();
    }
  };

  // --- Score Swipe/Tap/Hold Handlers ---
  const handleScoreStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (readOnly) return;
    if ("touches" in e) {
      ignoreMouseUntilRef.current = Date.now() + 800;
    } else if (Date.now() < ignoreMouseUntilRef.current) {
      return;
    }

    const y = "touches" in e ? e.touches[0].clientY : e.clientY;
    startYRef.current = y;
    hasMovedRef.current = false;

    // Long press on score opens dialog
    swipeLongPressTimerRef.current = setTimeout(() => {
      onScoreDialogRequest();
      startYRef.current = null;
    }, 600);
  };

  const handleScoreEnd = (e: React.TouchEvent | React.MouseEvent) => {
    if (readOnly) return;
    if (!("changedTouches" in e) && Date.now() < ignoreMouseUntilRef.current) {
      return;
    }

    if (swipeLongPressTimerRef.current)
      clearTimeout(swipeLongPressTimerRef.current);

    if (startYRef.current !== null) {
      const y = "changedTouches" in e ? e.changedTouches[0].clientY : e.clientY;
      const diff = startYRef.current - y;

      if (Math.abs(diff) > 30) {
        // Swipe
        const delta = diff > 0 ? 1 : -1;
        onScoreChange(delta);
      } else if (!hasMovedRef.current) {
        // Tap
        onScoreChange(1);
      }
    }

    stopHold();
    startYRef.current = null;
  };

  const handleScoreMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (readOnly) return;
    if (!("touches" in e) && Date.now() < ignoreMouseUntilRef.current) {
      return;
    }

    if (startYRef.current === null) return;

    const y = "touches" in e ? e.touches[0].clientY : e.clientY;
    const diff = startYRef.current - y;

    if (Math.abs(diff) > 10) {
      hasMovedRef.current = true;
      if (swipeLongPressTimerRef.current) {
        clearTimeout(swipeLongPressTimerRef.current);
        swipeLongPressTimerRef.current = null;
      }
    }

    // Hold detection
    if (Math.abs(diff) > 50 && !isHolding) {
      setIsHolding(true);
      const delta = diff > 0 ? 1 : -1;
      setLastDelta(delta);
      startHold(delta);
    }
  };

  return (
    <div
      className={cn(
        "relative w-1/2 h-full flex flex-col items-center justify-center overflow-visible select-none touch-none transition-colors duration-700",
        color === "primary" ? "bg-bg-secondary" : "bg-bg",
      )}
    >
      {/* Background Glow */}
      <div
        className={cn(
          "absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-transparent via-transparent to-transparent",
          color === "primary" ? "from-primary" : "from-secondary",
        )}
      />

      {/* Team Info Area - Separate Hitbox for Name Long Press */}
      <div
        className={cn(
          "absolute flex flex-col items-center z-30 group/name",
          readOnly
            ? "pointer-events-none cursor-default"
            : "pointer-events-auto cursor-pointer",
          compactLayout ? "top-3" : "top-20",
        )}
        onMouseDown={handleNameStart}
        onMouseUp={handleNameEnd}
        onMouseLeave={handleNameEnd}
        onTouchStart={handleNameStart}
        onTouchEnd={handleNameEnd}
        onClick={handleNameClick}
      >
        <span
          className={cn(
            "font-body tracking-[0.3em] uppercase font-bold",
            compactLayout ? "text-[8px] mb-1.5" : "text-[10px] mb-2",
            color === "primary" ? "text-primary" : "text-secondary",
          )}
        >
          {label}
        </span>
        <h2
          className={cn(
            "font-headline font-black tracking-tight uppercase transition-transform group-active/name:scale-95 text-on-surface",
            compactLayout ? "text-xl max-w-[42vw] truncate" : "text-4xl",
          )}
        >
          {name}
        </h2>
        <div className={cn("flex flex-col items-center", compactLayout ? "mt-2" : "mt-4")}>
          {unlimitedSets ? (
            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
              <InfinityIcon
                size={12}
                className={
                  color === "primary" ? "text-primary" : "text-secondary"
                }
              />
              <span className="text-[10px] font-bold text-on-surface">
                {setsWon}
              </span>
            </div>
          ) : gameMode ? (
            <div
              className={cn(
                "flex flex-col items-center gap-1.5",
                !readOnly && onTimeoutsCycle && "cursor-pointer",
              )}
              role={readOnly || !onTimeoutsCycle ? undefined : "button"}
              tabIndex={readOnly || !onTimeoutsCycle ? undefined : 0}
              aria-label={
                readOnly || !onTimeoutsCycle
                  ? undefined
                  : `Timeouts used: ${timeoutsUsed} of 2. Tap to cycle.`
              }
              onKeyDown={(e) => {
                if (readOnly || !onTimeoutsCycle) return;
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  onTimeoutsCycle();
                }
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (!readOnly && onTimeoutsCycle) onTimeoutsCycle();
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >
              <span
                className={cn(
                  "font-bold uppercase tracking-widest text-on-surface-variant",
                  compactLayout ? "text-[7px]" : "text-[8px]",
                )}
              >
                Timeouts
              </span>
              <div className="flex gap-3">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-3 w-3 rounded-full border transition-all duration-500",
                      i <= timeoutsUsed
                        ? color === "primary"
                          ? "border-primary bg-primary shadow-[0_0_15px_var(--theme-primary-muted)]"
                          : "border-secondary bg-secondary shadow-[0_0_15px_var(--theme-secondary-muted)]"
                        : "border-white/10 bg-white/5",
                    )}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "h-3 w-3 rounded-full border transition-all duration-500",
                    i <= setsWon
                      ? color === "primary"
                        ? "border-primary bg-primary shadow-[0_0_15px_var(--theme-primary-muted)]"
                        : "border-secondary bg-secondary shadow-[0_0_15px_var(--theme-secondary-muted)]"
                      : "border-white/10 bg-white/5",
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Score area: whole lower half is the hit target — tap +1, swipe ±1, hold rapid ±5 */}
      <div
        className={cn(
          "relative z-10 flex min-h-0 w-full flex-1 flex-col items-center justify-center",
          readOnly ? "pointer-events-none" : "pointer-events-auto cursor-pointer",
          compactLayout ? "py-2" : "pt-[clamp(6rem,13vh,9.5rem)] pb-4",
        )}
        onMouseMove={handleScoreMove}
        onMouseUp={handleScoreEnd}
        onMouseLeave={handleScoreEnd}
        onTouchMove={handleScoreMove}
        onTouchEnd={handleScoreEnd}
        onMouseDown={handleScoreStart}
        onTouchStart={handleScoreStart}
      >
        <motion.div
          animate={{ y: isHolding ? (lastDelta > 0 ? -10 : 10) : 0 }}
          className="flex flex-col items-center"
        >
          <span
            className={cn(
              "font-headline font-black leading-none tracking-tighter transition-all duration-300",
              compactLayout
                ? "text-[clamp(11rem,32vw,14rem)]"
                : "text-[clamp(15rem,52vh,36rem)]",
              color === "primary"
                ? "text-primary score-glow-primary"
                : "text-secondary score-glow-secondary",
            )}
          >
            {score}
          </span>
        </motion.div>
      </div>

      {/* Side Accent */}
      <div
        className={cn(
          "absolute top-1/4 bottom-1/4 w-1.5 rounded-full blur-[1px]",
          side === "left" ? "left-0" : "right-0",
          color === "primary"
            ? "bg-primary shadow-[0_0_20px_var(--theme-primary-muted)]"
            : "bg-secondary shadow-[0_0_20px_var(--theme-secondary-muted)]",
        )}
      />
    </div>
  );
};
