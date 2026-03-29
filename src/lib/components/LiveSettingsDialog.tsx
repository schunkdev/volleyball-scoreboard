"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Check, Copy, Link2, Loader2, Radio, Square } from "lucide-react";
import { normalizeLiveCode } from "@/lib/live/liveScoreboardState";
import { cn } from "@/lib/utils";

const COPY_FEEDBACK_MS = 2500;

export type LiveSettingsDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  isLiveHosting: boolean;
  liveCode: string | null;
  liveShareUrl: string | null;
  livePublishError: string | null;
  firebaseConfigured: boolean;
  onGoLive: () => void | Promise<void>;
  onStopLive: () => void | Promise<void>;
  onCopyLiveLink: () => void | Promise<void>;
};

export const LiveSettingsDialog = ({
  isOpen,
  onClose,
  isLiveHosting,
  liveCode,
  liveShareUrl,
  livePublishError,
  firebaseConfigured,
  onGoLive,
  onStopLive,
  onCopyLiveLink,
}: LiveSettingsDialogProps) => {
  const router = useRouter();
  const [joinInput, setJoinInput] = useState("");
  const [codeCopySuccess, setCodeCopySuccess] = useState(false);
  const [isStartingLive, setIsStartingLive] = useState(false);
  const copyFeedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isOpen) setIsStartingLive(false);
  }, [isOpen]);

  useEffect(() => {
    if (isLiveHosting) setIsStartingLive(false);
  }, [isLiveHosting]);

  useEffect(() => {
    return () => {
      if (copyFeedbackTimerRef.current) {
        clearTimeout(copyFeedbackTimerRef.current);
        copyFeedbackTimerRef.current = null;
      }
    };
  }, []);

  const submitJoin = () => {
    if (isStartingLive) return;
    const c = normalizeLiveCode(joinInput);
    if (!c) return;
    setJoinInput("");
    onClose();
    router.push(`/live/${c}`);
  };

  const handleGoLiveClick = async () => {
    if (isStartingLive || !firebaseConfigured) return;
    setIsStartingLive(true);
    try {
      await onGoLive();
    } catch {
      /* error surfaced by parent (e.g. toast) */
    } finally {
      setIsStartingLive(false);
    }
  };

  const copyLiveCode = async (code: string) => {
    if (!code || typeof navigator === "undefined" || !navigator.clipboard?.writeText) return;
    try {
      await navigator.clipboard.writeText(code);
      setCodeCopySuccess(true);
      if (copyFeedbackTimerRef.current) clearTimeout(copyFeedbackTimerRef.current);
      copyFeedbackTimerRef.current = setTimeout(() => {
        copyFeedbackTimerRef.current = null;
        setCodeCopySuccess(false);
      }, COPY_FEEDBACK_MS);
    } catch {
      /* ignore */
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        "pointer-events-auto absolute inset-0 z-[100] flex items-center justify-center bg-black/60 p-3 backdrop-blur-md md:p-6",
        isStartingLive ? "cursor-wait" : "cursor-pointer",
      )}
      onClick={() => {
        if (!isStartingLive) onClose();
      }}
      aria-busy={isStartingLive}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative flex max-h-[calc(100dvh-max(env(safe-area-inset-top),0.75rem)-max(env(safe-area-inset-bottom),0.75rem)-1.5rem)] w-full max-w-[520px] cursor-default flex-col items-center overflow-y-auto rounded-3xl border border-white/10 bg-surface p-5 shadow-[0_30px_60px_rgba(0,0,0,0.5)] md:rounded-[40px] md:p-10"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-2 font-headline text-3xl font-black uppercase italic tracking-tighter text-on-surface md:text-5xl">
          Live
        </h2>
        <div
          className="mb-5 h-1.5 w-12 rounded-full bg-primary shadow-[0_0_15px_var(--theme-primary)] md:mb-8"
          aria-hidden
        />

        <div className="mb-6 w-full md:mb-8">
          <p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-200/90">
            <Radio
              size={14}
              className={isLiveHosting ? "text-primary animate-live-shimmer" : "text-emerald-400"}
            />
            Broadcast &amp; viewers
          </p>

          {!isLiveHosting ? (
            <div className="relative space-y-3">
              <AnimatePresence>
                {isStartingLive && (
                  <motion.div
                    key="starting"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-2xl border border-primary/20 bg-surface/90 backdrop-blur-sm"
                    role="status"
                    aria-live="polite"
                  >
                    <Loader2
                      className="h-8 w-8 shrink-0 animate-spin text-primary"
                      aria-hidden
                    />
                    <p className="text-center text-[10px] font-bold uppercase tracking-widest text-on-surface">
                      Starting stream…
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <p className="px-0.5 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
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
                    disabled={isStartingLive}
                    onChange={(e) =>
                      setJoinInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))
                    }
                    onKeyDown={(e) => e.key === "Enter" && !isStartingLive && submitJoin()}
                    className="min-w-0 flex-1 cursor-text rounded-xl border border-white/10 bg-white/5 px-3 py-2 font-mono text-sm font-bold tracking-widest text-on-surface outline-none focus:ring-2 focus:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={submitJoin}
                    disabled={!normalizeLiveCode(joinInput) || isStartingLive}
                    className="shrink-0 cursor-pointer rounded-xl bg-primary px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-primary-contrast transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    Open
                  </button>
                </div>
              </div>
              <button
                type="button"
                disabled={!firebaseConfigured || isStartingLive}
                onClick={() => void handleGoLiveClick()}
                className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-bold uppercase tracking-widest text-emerald-200 transition-colors hover:bg-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Radio size={14} className="shrink-0" aria-hidden />
                Go live
              </button>
            </div>
          ) : liveCode ? (
            <div className="space-y-3">
              <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.07] p-4 md:p-5">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-200/90">
                  <Radio size={14} className="shrink-0 text-primary animate-live-shimmer" />
                  Live code
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span
                    className="min-w-0 flex-1 font-mono text-2xl font-black tracking-[0.35em] text-on-surface md:text-3xl"
                    translate="no"
                  >
                    {liveCode}
                  </span>
                  <button
                    type="button"
                    onClick={() => void copyLiveCode(liveCode)}
                    className="flex shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-on-surface transition-colors hover:bg-white/15 active:scale-[0.98]"
                  >
                    <Copy size={14} className="text-emerald-300" />
                    Copy code
                  </button>
                </div>
                <AnimatePresence initial={false}>
                  {codeCopySuccess && (
                    <motion.p
                      key="copied"
                      role="status"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.2 }}
                      className="mt-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-300"
                    >
                      <Check size={14} className="text-emerald-400" strokeWidth={2.5} />
                      Code copied to clipboard
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
              <button
                type="button"
                disabled={!liveShareUrl}
                onClick={() => void onCopyLiveLink()}
                className="flex w-full cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-on-surface-variant transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30 md:py-4"
              >
                <Link2 size={16} className="shrink-0 text-primary" />
                Copy viewer link
              </button>
              <button
                type="button"
                onClick={() => {
                  void onStopLive();
                  onClose();
                }}
                className="flex w-full cursor-pointer items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-red-200 transition-colors hover:bg-red-500/15 md:py-4"
              >
                <Square size={16} className="shrink-0" />
                Stop live
              </button>
              {livePublishError ? (
                <p className="text-[9px] font-bold uppercase leading-snug tracking-widest text-red-300">
                  {livePublishError}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="flex w-full gap-3 md:gap-4">
          <button
            type="button"
            disabled={isStartingLive}
            onClick={onClose}
            className="flex-1 cursor-pointer rounded-2xl bg-white/5 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-on-surface transition-all hover:bg-white/10 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 md:py-5"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
