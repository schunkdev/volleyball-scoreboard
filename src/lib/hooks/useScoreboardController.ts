"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { themes } from "@/lib/themes";
import {
  type CompletedSet,
  type HistoryEntry,
  type TeamId,
  type TeamView,
} from "@/lib/types/scoreboard";

export function useScoreboardController() {
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [setsWonA, setSetsWonA] = useState(0);
  const [setsWonB, setSetsWonB] = useState(0);
  const [nameA, setNameA] = useState("Team A");
  const [nameB, setNameB] = useState("Team B");
  const [scoreDialogOpen, setScoreDialogOpen] = useState<TeamId | null>(null);
  const [nameDialogOpen, setNameDialogOpen] = useState<TeamId | null>(null);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isSwapped, setIsSwapped] = useState(false);
  const [completedSets, setCompletedSets] = useState<CompletedSet[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCompactMobile, setIsCompactMobile] = useState(false);
  const [gameMode, setGameMode] = useState(true);
  const [unlimitedSets, setUnlimitedSets] = useState(false);
  const [themeId, setThemeId] = useState("stadium-dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("vb-scoreboard-theme");
    if (savedTheme) queueMicrotask(() => setThemeId(savedTheme));
  }, []);

  useEffect(() => {
    const theme = themes.find((t) => t.id === themeId) || themes[0];
    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, value]) => {
      const cssVarName = `--theme-${key.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase())}`;
      root.style.setProperty(cssVarName, value);
    });
    localStorage.setItem("vb-scoreboard-theme", themeId);
  }, [themeId]);

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia(
      "(max-height: 520px) and (orientation: landscape) and (pointer: coarse)",
    );
    const update = () => setIsCompactMobile(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  const supportsFullscreen = useSyncExternalStore(
    () => () => {},
    () => {
      if (typeof document === "undefined") return false;
      const el = document.documentElement as HTMLElement & {
        webkitRequestFullscreen?: () => Promise<void> | void;
      };
      return (
        typeof el.requestFullscreen === "function" ||
        typeof el.webkitRequestFullscreen === "function"
      );
    },
    () => false,
  );

  const currentSet = setsWonA + setsWonB + 1;

  const safeAreaStyle = isCompactMobile
    ? {
        paddingTop: "max(env(safe-area-inset-top), 0.5rem)",
        paddingBottom: "max(env(safe-area-inset-bottom), 0.5rem)",
        paddingLeft: "max(env(safe-area-inset-left), 0.5rem)",
        paddingRight: "max(env(safe-area-inset-right), 0.5rem)",
      }
    : {
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
      };

  const pushToHistory = () => {
    setHistory((prev) =>
      [
        ...prev,
        { scoreA, scoreB, setsWonA, setsWonB, isSwapped, completedSets: [...completedSets] },
      ].slice(-50),
    );
  };

  const resetMatch = () => {
    setScoreA(0);
    setScoreB(0);
    setSetsWonA(0);
    setSetsWonB(0);
    setIsSwapped(false);
    setCompletedSets([]);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const lastState = history[history.length - 1];
    setScoreA(lastState.scoreA);
    setScoreB(lastState.scoreB);
    setSetsWonA(lastState.setsWonA);
    setSetsWonB(lastState.setsWonB);
    setIsSwapped(lastState.isSwapped);
    setCompletedSets(lastState.completedSets);
    setHistory((prev) => prev.slice(0, -1));
  };

  const updateScore = (team: TeamId, newScore: number) => {
    const score = Math.max(0, newScore);
    pushToHistory();
    if (team === "A") {
      if (gameMode && score >= 25 && score - scoreB >= 2) {
        setCompletedSets((prev) => [...prev, { a: score, b: scoreB }]);
        setSetsWonA((prev) => prev + 1);
        setScoreA(0);
        setScoreB(0);
      } else {
        setScoreA(score);
      }
      return;
    }
    if (gameMode && score >= 25 && score - scoreA >= 2) {
      setCompletedSets((prev) => [...prev, { a: scoreA, b: score }]);
      setSetsWonB((prev) => prev + 1);
      setScoreA(0);
      setScoreB(0);
    } else {
      setScoreB(score);
    }
  };

  const handleScoreChange = (team: TeamId, delta: number) => {
    const current = team === "A" ? scoreA : scoreB;
    updateScore(team, current + delta);
  };

  const handleSetWinIncrement = (team: TeamId) => {
    pushToHistory();
    const max = unlimitedSets ? 99 : 3;
    if (team === "A") setSetsWonA((prev) => Math.min(max, prev + 1));
    else setSetsWonB((prev) => Math.min(max, prev + 1));
  };

  const handleSwitchSides = () => {
    pushToHistory();
    setIsSwapped((prev) => !prev);
  };

  const toggleFullscreen = () => {
    if (typeof document === "undefined") return;
    const el = document.documentElement as HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void> | void;
    };
    const hasStandardApi = typeof el.requestFullscreen === "function";
    const hasWebkitApi = typeof el.webkitRequestFullscreen === "function";

    if (!document.fullscreenElement) {
      if (hasStandardApi) {
        el.requestFullscreen().catch((e) => {
          console.error(`Error attempting full-screen mode: ${e.message} (${e.name})`);
        });
        return;
      }
      if (hasWebkitApi) {
        try {
          el.webkitRequestFullscreen?.();
        } catch (e) {
          console.error("Error attempting webkit full-screen mode:", e);
        }
      }
      return;
    }
    if (document.exitFullscreen) document.exitFullscreen();
  };

  const teamA: TeamView = {
    id: "A",
    name: nameA,
    score: scoreA,
    setsWon: setsWonA,
    label: "Home Team",
    color: "primary",
  };

  const teamB: TeamView = {
    id: "B",
    name: nameB,
    score: scoreB,
    setsWon: setsWonB,
    label: "Visitor",
    color: "secondary",
  };

  const leftTeam = isSwapped ? teamB : teamA;
  const rightTeam = isSwapped ? teamA : teamB;

  const canUndo = history.length > 0;

  return {
    scoreA,
    scoreB,
    setsWonA,
    setsWonB,
    nameA,
    nameB,
    scoreDialogOpen,
    nameDialogOpen,
    settingsDialogOpen,
    isFullscreen,
    isSwapped,
    completedSets,
    mobileMenuOpen,
    isCompactMobile,
    gameMode,
    unlimitedSets,
    themeId,
    supportsFullscreen,
    currentSet,
    safeAreaStyle,
    leftTeam,
    rightTeam,
    canUndo,
    setNameA,
    setNameB,
    setSetsWonA,
    setSetsWonB,
    setScoreDialogOpen,
    setNameDialogOpen,
    setSettingsDialogOpen,
    setMobileMenuOpen,
    setGameMode,
    setUnlimitedSets,
    setThemeId,
    resetMatch,
    handleUndo,
    updateScore,
    handleScoreChange,
    handleSetWinIncrement,
    handleSwitchSides,
    toggleFullscreen,
  };
}
