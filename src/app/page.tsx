"use client";

import React, { Fragment } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trophy } from "lucide-react";

// Components
import { OrientationGuard } from "@/lib/components/OrientationGuard";
import { QuickGuide } from "@/lib/components/QuickGuide";
import { ScoreDialog } from "@/lib/components/ScoreDialog";
import { EditTeamDialog } from "@/lib/components/EditTeamDialog";
import { SettingsDialog } from "@/lib/components/SettingsDialog";
import { TeamSide } from "@/lib/components/TeamSide";
import { ScoreboardHeader } from "@/lib/components/scoreboard/ScoreboardHeader";
import { DesktopBottomMenu } from "@/lib/components/scoreboard/DesktopBottomMenu";
import { MobileFloatingMenu } from "@/lib/components/scoreboard/MobileFloatingMenu";
import { MobileSetIndicator } from "@/lib/components/scoreboard/MobileSetIndicator";
import { useScoreboardController } from "@/lib/hooks/useScoreboardController";

export default function VolleyballScoreboard() {
  const scoreboard = useScoreboardController();

  return (
    <main
      className="relative h-dvh min-h-dvh w-screen overflow-hidden bg-bg font-body transition-colors duration-700"
      style={scoreboard.safeAreaStyle}
    >
      <QuickGuide />
      <OrientationGuard />

      <ScoreboardHeader
        isCompactMobile={scoreboard.isCompactMobile}
        currentSet={scoreboard.currentSet}
        setsWonA={scoreboard.setsWonA}
        setsWonB={scoreboard.setsWonB}
        unlimitedSets={scoreboard.unlimitedSets}
        supportsFullscreen={scoreboard.supportsFullscreen}
        isFullscreen={scoreboard.isFullscreen}
        onToggleFullscreen={scoreboard.toggleFullscreen}
        onOpenSettings={() => scoreboard.setSettingsDialogOpen(true)}
      />

      <div className="flex h-full w-full">
        <TeamSide
          name={scoreboard.leftTeam.name}
          score={scoreboard.leftTeam.score}
          setsWon={scoreboard.leftTeam.setsWon}
          label={scoreboard.leftTeam.label}
          side="left"
          color={scoreboard.leftTeam.color}
          onScoreChange={(d) => scoreboard.handleScoreChange(scoreboard.leftTeam.id, d)}
          onScoreDialogRequest={() => scoreboard.setScoreDialogOpen(scoreboard.leftTeam.id)}
          onNameLongPress={() => scoreboard.setNameDialogOpen(scoreboard.leftTeam.id)}
          onSetWinIncrement={() => scoreboard.handleSetWinIncrement(scoreboard.leftTeam.id)}
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
          onScoreChange={(d) => scoreboard.handleScoreChange(scoreboard.rightTeam.id, d)}
          onScoreDialogRequest={() => scoreboard.setScoreDialogOpen(scoreboard.rightTeam.id)}
          onNameLongPress={() => scoreboard.setNameDialogOpen(scoreboard.rightTeam.id)}
          onSetWinIncrement={() => scoreboard.handleSetWinIncrement(scoreboard.rightTeam.id)}
          unlimitedSets={scoreboard.unlimitedSets}
          compactLayout={scoreboard.isCompactMobile}
        />
      </div>

      <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <div className="w-[1px] h-full bg-gradient-to-b from-transparent via-white/10 to-transparent" />
      </div>

      <DesktopBottomMenu
        isCompactMobile={scoreboard.isCompactMobile}
        gameMode={scoreboard.gameMode}
        completedSets={scoreboard.completedSets}
        isSwapped={scoreboard.isSwapped}
        setsWonA={scoreboard.setsWonA}
        setsWonB={scoreboard.setsWonB}
        unlimitedSets={scoreboard.unlimitedSets}
        currentSet={scoreboard.currentSet}
        canUndo={scoreboard.canUndo}
        onReset={scoreboard.resetMatch}
        onSwitchSides={scoreboard.handleSwitchSides}
        onUndo={scoreboard.handleUndo}
      />

      <MobileFloatingMenu
        isCompactMobile={scoreboard.isCompactMobile}
        mobileMenuOpen={scoreboard.mobileMenuOpen}
        canUndo={scoreboard.canUndo}
        supportsFullscreen={scoreboard.supportsFullscreen}
        isFullscreen={scoreboard.isFullscreen}
        onToggleOpen={() => scoreboard.setMobileMenuOpen((prev) => !prev)}
        onReset={() => {
          scoreboard.resetMatch();
          scoreboard.setMobileMenuOpen(false);
        }}
        onSwitchSides={() => {
          scoreboard.handleSwitchSides();
          scoreboard.setMobileMenuOpen(false);
        }}
        onUndo={() => {
          scoreboard.handleUndo();
          scoreboard.setMobileMenuOpen(false);
        }}
        onOpenSettings={() => {
          scoreboard.setSettingsDialogOpen(true);
          scoreboard.setMobileMenuOpen(false);
        }}
        onToggleFullscreen={() => {
          scoreboard.toggleFullscreen();
          scoreboard.setMobileMenuOpen(false);
        }}
      />

      <MobileSetIndicator
        isCompactMobile={scoreboard.isCompactMobile}
        unlimitedSets={scoreboard.unlimitedSets}
        setsWonA={scoreboard.setsWonA}
        setsWonB={scoreboard.setsWonB}
        currentSet={scoreboard.currentSet}
      />

      {/* Winner Announcement Overlay */}
      <AnimatePresence>
        {!scoreboard.unlimitedSets &&
          (scoreboard.setsWonA === 3 || scoreboard.setsWonB === 3) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute inset-0 z-[60] flex items-center justify-center pointer-events-none"
          >
            <div className="glass-panel px-12 py-8 rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col items-center">
              <Trophy
                size={64}
                className={
                  scoreboard.setsWonA === 3 ? "text-primary" : "text-secondary"
                }
              />
              <h2 className="text-5xl font-headline font-black mt-4 uppercase tracking-tighter text-on-surface">
                {scoreboard.setsWonA === 3 ? scoreboard.nameA : scoreboard.nameB}{" "}
                Wins!
              </h2>
              <p className="text-on-surface-variant mt-2 font-bold uppercase tracking-widest text-xs">
                Match Completed
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dialogs */}
      <AnimatePresence>
        {scoreboard.scoreDialogOpen === "A" && (
          <Fragment key={`score-a-${scoreboard.scoreA}`}>
            <ScoreDialog
              isOpen={true}
              onClose={() => scoreboard.setScoreDialogOpen(null)}
              currentScore={scoreboard.scoreA}
              onConfirm={(v) => scoreboard.updateScore("A", v)}
              color="primary"
            />
          </Fragment>
        )}
        {scoreboard.scoreDialogOpen === "B" && (
          <Fragment key={`score-b-${scoreboard.scoreB}`}>
            <ScoreDialog
              isOpen={true}
              onClose={() => scoreboard.setScoreDialogOpen(null)}
              currentScore={scoreboard.scoreB}
              onConfirm={(v) => scoreboard.updateScore("B", v)}
              color="secondary"
            />
          </Fragment>
        )}
        {scoreboard.nameDialogOpen === "A" && (
          <Fragment key={`name-a-${scoreboard.nameA}`}>
            <EditTeamDialog
              isOpen={true}
              onClose={() => scoreboard.setNameDialogOpen(null)}
              currentName={scoreboard.nameA}
              currentSets={scoreboard.setsWonA}
              onConfirm={(n, s) => {
                scoreboard.setNameA(n);
                scoreboard.setSetsWonA(s);
              }}
              color="primary"
              maxSets={scoreboard.unlimitedSets ? 99 : scoreboard.gameMode ? 3 : 99}
            />
          </Fragment>
        )}
        {scoreboard.nameDialogOpen === "B" && (
          <Fragment key={`name-b-${scoreboard.nameB}`}>
            <EditTeamDialog
              isOpen={true}
              onClose={() => scoreboard.setNameDialogOpen(null)}
              currentName={scoreboard.nameB}
              currentSets={scoreboard.setsWonB}
              onConfirm={(n, s) => {
                scoreboard.setNameB(n);
                scoreboard.setSetsWonB(s);
              }}
              color="secondary"
              maxSets={scoreboard.unlimitedSets ? 99 : scoreboard.gameMode ? 3 : 99}
            />
          </Fragment>
        )}
        {scoreboard.settingsDialogOpen && (
          <SettingsDialog
            isOpen={true}
            onClose={() => scoreboard.setSettingsDialogOpen(false)}
            config={{
              gameMode: scoreboard.gameMode,
              unlimitedSets: scoreboard.unlimitedSets,
              theme: scoreboard.themeId,
            }}
            onSave={(cfg) => {
              scoreboard.setGameMode(cfg.gameMode);
              scoreboard.setUnlimitedSets(cfg.unlimitedSets);
              scoreboard.setThemeId(cfg.theme);
            }}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
