"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trophy } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { TeamSide } from "@/lib/components/TeamSide";
import { ScoreboardHeader } from "@/lib/components/scoreboard/ScoreboardHeader";
import { MobileSetIndicator } from "@/lib/components/scoreboard/MobileSetIndicator";
import { useScoreboardController } from "@/lib/hooks/useScoreboardController";
import { normalizeLiveCode } from "@/lib/live/liveScoreboardState";
import { cn } from "@/lib/utils";

export default function LiveSubscriberPage() {
  const params = useParams();
  const raw = typeof params.code === "string" ? params.code : "";
  const code = normalizeLiveCode(raw);

  const scoreboard = useScoreboardController({
    subscriberCode: code ?? undefined,
  });

  if (!code) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-bg px-6 text-center text-on-surface">
        <p className="font-headline text-2xl font-black uppercase tracking-tight">
          Invalid code
        </p>
        <p className="text-sm text-on-surface-variant">
          Use a 4-character code from the host (letters A–Z and digits 0–9).
        </p>
        <Link
          href="/"
          className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-xs font-bold uppercase tracking-widest text-primary hover:bg-white/10"
        >
          Back home
        </Link>
      </main>
    );
  }

  const status = scoreboard.liveSessionStatus;
  const ended =
    status === "ended" || status === "expired" || status === "misconfigured";

  return (
    <main
      className={cn(
        "relative h-dvh min-h-dvh w-screen overflow-hidden bg-bg font-body transition-colors duration-700",
        !scoreboard.subscriberHydrated && "opacity-90",
      )}
      style={scoreboard.safeAreaStyle}
    >
      <ScoreboardHeader
        isCompactMobile={scoreboard.isCompactMobile}
        currentSet={scoreboard.currentSet}
        setsWonA={scoreboard.setsWonA}
        setsWonB={scoreboard.setsWonB}
        unlimitedSets={scoreboard.unlimitedSets}
        supportsFullscreen={scoreboard.supportsFullscreen}
        isFullscreen={scoreboard.isFullscreen}
        onToggleFullscreen={scoreboard.toggleFullscreen}
        onOpenSettings={() => {}}
        readOnly
        liveMode="subscriber"
        liveCode={code}
        liveViewerCount={scoreboard.liveViewerCount}
        firebaseOnline={scoreboard.firebaseOnline}
        hideSettings
        enableHostLiveActions={false}
      />

      {!scoreboard.subscriberHydrated && status === "loading" && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-bg/80 backdrop-blur-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
            Connecting…
          </p>
        </div>
      )}

      {ended && scoreboard.subscriberHydrated && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-bg/90 px-6 text-center backdrop-blur-md">
          <p className="font-headline text-3xl font-black uppercase tracking-tight text-on-surface">
            {status === "expired"
              ? "Session ended"
              : status === "ended"
                ? "Broadcast stopped"
                : "Session unavailable"}
          </p>
          <p className="max-w-sm text-sm text-on-surface-variant">
            {status === "misconfigured"
              ? "Live viewing is not configured (missing Firebase client env)."
              : status === "ended"
                ? "The host ended this live stream."
                : "This broadcast is no longer active or has expired."}
          </p>
          <Link
            href="/"
            className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-xs font-bold uppercase tracking-widest text-primary hover:bg-white/10"
          >
            Back home
          </Link>
        </div>
      )}

      {status === "offline" && scoreboard.subscriberHydrated && !ended && (
        <div className="absolute top-20 left-1/2 z-[35] -translate-x-1/2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-amber-200">
          Reconnecting…
        </div>
      )}

      <div className="flex h-full w-full">
        <TeamSide
          name={scoreboard.leftTeam.name}
          score={scoreboard.leftTeam.score}
          setsWon={scoreboard.leftTeam.setsWon}
          label={scoreboard.leftTeam.label}
          side="left"
          color={scoreboard.leftTeam.color}
          readOnly
          onScoreChange={() => {}}
          onScoreDialogRequest={() => {}}
          onNameLongPress={() => {}}
          onSetWinIncrement={() => {}}
          unlimitedSets={scoreboard.unlimitedSets}
          compactLayout={scoreboard.isCompactMobile}
        />
        <TeamSide
          name={scoreboard.rightTeam.name}
          score={scoreboard.rightTeam.score}
          setsWon={scoreboard.rightTeam.setsWon}
          label={scoreboard.rightTeam.label}
          side="right"
          color={scoreboard.rightTeam.color}
          readOnly
          onScoreChange={() => {}}
          onScoreDialogRequest={() => {}}
          onNameLongPress={() => {}}
          onSetWinIncrement={() => {}}
          unlimitedSets={scoreboard.unlimitedSets}
          compactLayout={scoreboard.isCompactMobile}
        />
      </div>

      <div className="pointer-events-none absolute top-0 bottom-0 left-1/2 z-10 -translate-x-1/2">
        <div className="h-full w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
      </div>

      <MobileSetIndicator
        isCompactMobile={scoreboard.isCompactMobile}
        unlimitedSets={scoreboard.unlimitedSets}
        setsWonA={scoreboard.setsWonA}
        setsWonB={scoreboard.setsWonB}
        currentSet={scoreboard.currentSet}
      />

      <AnimatePresence>
        {!scoreboard.unlimitedSets &&
          (scoreboard.setsWonA === 3 || scoreboard.setsWonB === 3) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="pointer-events-none absolute inset-0 z-[60] flex items-center justify-center"
            >
              <div className="glass-panel flex flex-col items-center rounded-3xl border border-white/10 px-12 py-8 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                <Trophy
                  size={64}
                  className={
                    scoreboard.setsWonA === 3 ? "text-primary" : "text-secondary"
                  }
                />
                <h2 className="mt-4 font-headline text-5xl font-black uppercase tracking-tighter text-on-surface">
                  {scoreboard.setsWonA === 3 ? scoreboard.nameA : scoreboard.nameB}{" "}
                  Wins!
                </h2>
                <p className="mt-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  Match Completed
                </p>
              </div>
            </motion.div>
          )}
      </AnimatePresence>
    </main>
  );
}
