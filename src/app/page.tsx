"use client";

import React, { Fragment, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Settings,
  Maximize2,
  Minimize2,
  RefreshCw,
  Layers,
  Trophy,
  BarChart2,
  Users,
  History,
  Undo2,
} from "lucide-react";

// Components
import { OrientationGuard } from "@/lib/components/OrientationGuard";
import { ScoreDialog } from "@/lib/components/ScoreDialog";
import { EditTeamDialog } from "@/lib/components/EditTeamDialog";
import { SettingsDialog } from "@/lib/components/SettingsDialog";
import { TeamSide } from "@/lib/components/TeamSide";
import { NavButton } from "@/lib/components/NavButton";

// Utils
import { cn } from "@/lib/utils";
import { themes } from "@/lib/themes";

type HistoryEntry = {
  scoreA: number;
  scoreB: number;
  setsWonA: number;
  setsWonB: number;
};

export default function VolleyballScoreboard() {
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [setsWonA, setSetsWonA] = useState(0);
  const [setsWonB, setSetsWonB] = useState(0);
  const [nameA, setNameA] = useState("Team A");
  const [nameB, setNameB] = useState("Team B");
  const [scoreDialogOpen, setScoreDialogOpen] = useState<"A" | "B" | null>(
    null,
  );
  const [nameDialogOpen, setNameDialogOpen] = useState<"A" | "B" | null>(null);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // Settings state
  const [gameMode, setGameMode] = useState(true);
  const [unlimitedSets, setUnlimitedSets] = useState(false);
  const [themeId, setThemeId] = useState("stadium-dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("vb-scoreboard-theme");
    if (savedTheme) {
      // Hydrate from localStorage after mount so SSR and first client paint match.
      queueMicrotask(() => setThemeId(savedTheme));
    }
  }, []);

  useEffect(() => {
    const theme = themes.find((t) => t.id === themeId) || themes[0];
    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, value]) => {
      // Convert camelCase to kebab-case for CSS variables
      const cssVarName = `--theme-${key.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase())}`;
      root.style.setProperty(cssVarName, value);
    });
    localStorage.setItem("vb-scoreboard-theme", themeId);
  }, [themeId]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (typeof document === "undefined") return;
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((e) => {
        console.error(
          `Error attempting to enable full-screen mode: ${e.message} (${e.name})`,
        );
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const currentSet = setsWonA + setsWonB + 1;

  const pushToHistory = () => {
    setHistory((prev: HistoryEntry[]) =>
      [...prev, { scoreA, scoreB, setsWonA, setsWonB }].slice(-50),
    );
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const lastState = history[history.length - 1];
    setScoreA(lastState.scoreA);
    setScoreB(lastState.scoreB);
    setSetsWonA(lastState.setsWonA);
    setSetsWonB(lastState.setsWonB);
    setHistory((prev: HistoryEntry[]) => prev.slice(0, -1));
  };

  const updateScore = (team: "A" | "B", newScore: number) => {
    const score = Math.max(0, newScore);
    pushToHistory();
    if (team === "A") {
      if (gameMode && score >= 25 && score - scoreB >= 2) {
        setSetsWonA((prev: number) => prev + 1);
        setScoreA(0);
        setScoreB(0);
      } else {
        setScoreA(score);
      }
    } else {
      if (gameMode && score >= 25 && score - scoreA >= 2) {
        setSetsWonB((prev: number) => prev + 1);
        setScoreA(0);
        setScoreB(0);
      } else {
        setScoreB(score);
      }
    }
  };

  const handleScoreChange = (team: "A" | "B", delta: number) => {
    const current = team === "A" ? scoreA : scoreB;
    updateScore(team, current + delta);
  };

  const handleSetWinIncrement = (team: "A" | "B") => {
    pushToHistory();
    const max = unlimitedSets ? 99 : 3;
    if (team === "A") setSetsWonA((prev: number) => Math.min(max, prev + 1));
    else setSetsWonB((prev: number) => Math.min(max, prev + 1));
  };

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-bg font-body transition-colors duration-700">
      <OrientationGuard />

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-40 flex justify-between items-center px-8 py-6 pointer-events-none">
        <div className="w-48" /> {/* Spacer for balance */}
        {/* Integrated Set Display in Header */}
        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-auto">
          <div className="flex items-center gap-4 bg-surface-container/40 backdrop-blur-md px-8 py-2 rounded-full border border-white/5">
            <div className="flex flex-col items-center min-w-[60px]">
              <span className="font-headline font-black text-xl text-[#ff7346]">
                {!unlimitedSets && (setsWonA === 3 || setsWonB === 3)
                  ? "FINAL"
                  : currentSet}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-6 pointer-events-auto">
          <button
            onClick={toggleFullscreen}
            className="text-on-surface-variant hover:text-primary transition-colors"
          >
            {isFullscreen ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
          </button>
          <button
            onClick={() => setSettingsDialogOpen(true)}
            className="text-on-surface-variant hover:text-primary transition-colors"
          >
            <Settings size={24} />
          </button>
        </div>
      </header>

      {/* Main Score Area */}
      <div className="flex h-full w-full">
        <TeamSide
          name={nameA}
          score={scoreA}
          setsWon={setsWonA}
          label="Home Team"
          color="primary"
          onScoreChange={(d) => handleScoreChange("A", d)}
          onScoreDialogRequest={() => setScoreDialogOpen("A")}
          onNameLongPress={() => setNameDialogOpen("A")}
          onSetWinIncrement={() => handleSetWinIncrement("A")}
          unlimitedSets={unlimitedSets}
        />
        <TeamSide
          name={nameB}
          score={scoreB}
          setsWon={setsWonB}
          label="Visitor"
          color="secondary"
          onScoreChange={(d) => handleScoreChange("B", d)}
          onScoreDialogRequest={() => setScoreDialogOpen("B")}
          onNameLongPress={() => setNameDialogOpen("B")}
          onSetWinIncrement={() => handleSetWinIncrement("B")}
          unlimitedSets={unlimitedSets}
        />
      </div>

      {/* Center Divider Line */}
      <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <div className="w-[1px] h-full bg-gradient-to-b from-transparent via-white/10 to-transparent" />
      </div>

      {/* Bottom Menu Area */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex flex-col items-center pb-8 pointer-events-none">
        {/* Quick Actions */}
        <div className="flex gap-4 mb-6 pointer-events-auto">
          <button
            onClick={() => {
              setScoreA(0);
              setScoreB(0);
              setSetsWonA(0);
              setSetsWonB(0);
            }}
            className="flex items-center gap-2 px-5 py-2.5 glass-panel rounded-full border border-white/5 hover:bg-white/10 transition-all active:scale-95"
          >
            <RefreshCw size={14} className="text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Reset
            </span>
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 glass-panel rounded-full border border-white/5 hover:bg-white/10 transition-all active:scale-95">
            <Layers size={14} className="text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              {!unlimitedSets && (setsWonA === 3 || setsWonB === 3)
                ? "Match Over"
                : `Set ${currentSet}${unlimitedSets ? "" : " of 5"}`}
            </span>
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="glass-panel px-4 py-2 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-2 pointer-events-auto">
          <NavButton icon={<Trophy size={20} />} label="Match" active />
          <NavButton icon={<BarChart2 size={20} />} label="Stats" disabled />
          <NavButton icon={<Users size={20} />} label="Lineup" disabled />
          <NavButton icon={<History size={20} />} label="History" disabled />
          <NavButton
            icon={<Undo2 size={20} />}
            label="Undo"
            onClick={handleUndo}
            disabled={history.length === 0}
          />
        </nav>
      </div>

      {/* Winner Announcement Overlay */}
      <AnimatePresence>
        {!unlimitedSets && (setsWonA === 3 || setsWonB === 3) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute inset-0 z-[60] flex items-center justify-center pointer-events-none"
          >
            <div className="glass-panel px-12 py-8 rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col items-center">
              <Trophy
                size={64}
                className={setsWonA === 3 ? "text-primary" : "text-secondary"}
              />
              <h2 className="text-5xl font-headline font-black mt-4 uppercase tracking-tighter text-on-surface">
                {setsWonA === 3 ? nameA : nameB} Wins!
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
        {scoreDialogOpen === "A" && (
          <Fragment key={`score-a-${scoreA}`}>
            <ScoreDialog
              isOpen={true}
              onClose={() => setScoreDialogOpen(null)}
              currentScore={scoreA}
              onConfirm={(v) => updateScore("A", v)}
              color="primary"
            />
          </Fragment>
        )}
        {scoreDialogOpen === "B" && (
          <Fragment key={`score-b-${scoreB}`}>
            <ScoreDialog
              isOpen={true}
              onClose={() => setScoreDialogOpen(null)}
              currentScore={scoreB}
              onConfirm={(v) => updateScore("B", v)}
              color="secondary"
            />
          </Fragment>
        )}
        {nameDialogOpen === "A" && (
          <Fragment key={`name-a-${nameA}`}>
            <EditTeamDialog
              isOpen={true}
              onClose={() => setNameDialogOpen(null)}
              currentName={nameA}
              currentSets={setsWonA}
              onConfirm={(n, s) => {
                setNameA(n);
                setSetsWonA(s);
              }}
              color="primary"
              maxSets={unlimitedSets ? 99 : gameMode ? 3 : 99}
            />
          </Fragment>
        )}
        {nameDialogOpen === "B" && (
          <Fragment key={`name-b-${nameB}`}>
            <EditTeamDialog
              isOpen={true}
              onClose={() => setNameDialogOpen(null)}
              currentName={nameB}
              currentSets={setsWonB}
              onConfirm={(n, s) => {
                setNameB(n);
                setSetsWonB(s);
              }}
              color="secondary"
              maxSets={unlimitedSets ? 99 : gameMode ? 3 : 99}
            />
          </Fragment>
        )}
        {settingsDialogOpen && (
          <SettingsDialog
            isOpen={true}
            onClose={() => setSettingsDialogOpen(false)}
            config={{ gameMode, unlimitedSets, theme: themeId }}
            onSave={(cfg) => {
              setGameMode(cfg.gameMode);
              setUnlimitedSets(cfg.unlimitedSets);
              setThemeId(cfg.theme);
            }}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
