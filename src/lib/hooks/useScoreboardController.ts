"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { themes } from "@/lib/themes";
import {
  type CompletedSet,
  type HistoryEntry,
  type TeamId,
  type TeamView,
} from "@/lib/types/scoreboard";
import {
  buildLiveScoreboardStateFromController,
  LIVE_CODE_REGEX,
} from "@/lib/live/liveScoreboardState";
import {
  apiPublishLiveSession,
  apiStartLiveSession,
  apiStopLiveSession,
} from "@/lib/live/liveApi";
import {
  createWatcherId,
  sessionExists,
  subscribeDatabaseConnection,
  subscribeToLiveSession,
  subscribeToWatcherCount,
  registerWatcherPresence,
  type LiveSessionListenerStatus,
} from "@/lib/firebase/liveSessionService";
import { isFirebaseClientConfigured } from "@/lib/firebase/client";

const LIVE_PUBLISH_MS = 250;
const STORAGE_CODE = "vb-live-code";
const STORAGE_HOST = "vb-live-host-id";
const STORAGE_SCOREBOARD = "vb-scoreboard-state";

type PersistedSnapshotV1 = {
  v: 1;
  scoreA: number;
  scoreB: number;
  setsWonA: number;
  setsWonB: number;
  nameA: string;
  nameB: string;
  history: HistoryEntry[];
  isSwapped: boolean;
  completedSets: CompletedSet[];
  gameMode: boolean;
  unlimitedSets: boolean;
  themeId: string;
};

function isCompletedSet(x: unknown): x is CompletedSet {
  return (
    typeof x === "object" &&
    x !== null &&
    "a" in x &&
    "b" in x &&
    typeof (x as CompletedSet).a === "number" &&
    typeof (x as CompletedSet).b === "number"
  );
}

function isHistoryEntry(x: unknown): x is HistoryEntry {
  if (typeof x !== "object" || x === null) return false;
  const h = x as Record<string, unknown>;
  if (
    typeof h.scoreA !== "number" ||
    typeof h.scoreB !== "number" ||
    typeof h.setsWonA !== "number" ||
    typeof h.setsWonB !== "number" ||
    typeof h.isSwapped !== "boolean" ||
    !Array.isArray(h.completedSets)
  ) {
    return false;
  }
  return h.completedSets.every(isCompletedSet);
}

function parsePersistedSnapshot(raw: string | null): PersistedSnapshotV1 | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as unknown;
    if (!data || typeof data !== "object") return null;
    const o = data as Record<string, unknown>;
    if (o.v !== 1) return null;
    if (
      typeof o.scoreA !== "number" ||
      typeof o.scoreB !== "number" ||
      typeof o.setsWonA !== "number" ||
      typeof o.setsWonB !== "number" ||
      typeof o.nameA !== "string" ||
      typeof o.nameB !== "string" ||
      !Array.isArray(o.history) ||
      typeof o.isSwapped !== "boolean" ||
      !Array.isArray(o.completedSets) ||
      typeof o.gameMode !== "boolean" ||
      typeof o.unlimitedSets !== "boolean" ||
      typeof o.themeId !== "string"
    ) {
      return null;
    }
    if (!o.history.every(isHistoryEntry)) return null;
    if (!o.completedSets.every(isCompletedSet)) return null;
    return o as PersistedSnapshotV1;
  } catch {
    return null;
  }
}

export type UseScoreboardControllerOptions = {
  /** When set, this instance runs in read-only subscriber mode for `/live/[code]`. */
  subscriberCode?: string | null;
};

export function useScoreboardController(options?: UseScoreboardControllerOptions) {
  const subscriberCode =
    options?.subscriberCode?.trim().toUpperCase() ?? null;
  const isSubscriberView =
    Boolean(subscriberCode && LIVE_CODE_REGEX.test(subscriberCode));

  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [setsWonA, setSetsWonA] = useState(0);
  const [setsWonB, setSetsWonB] = useState(0);
  const [nameA, setNameA] = useState("Team A");
  const [nameB, setNameB] = useState("Team B");
  const [scoreDialogOpen, setScoreDialogOpen] = useState<TeamId | null>(null);
  const [nameDialogOpen, setNameDialogOpen] = useState<TeamId | null>(null);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [liveSettingsDialogOpen, setLiveSettingsDialogOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isSwapped, setIsSwapped] = useState(false);
  const [completedSets, setCompletedSets] = useState<CompletedSet[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCompactMobile, setIsCompactMobile] = useState(false);
  const [gameMode, setGameMode] = useState(true);
  const [unlimitedSets, setUnlimitedSets] = useState(false);
  const [themeId, setThemeId] = useState("stadium-dark");

  const [liveCode, setLiveCode] = useState<string | null>(null);
  const [liveHostSessionId, setLiveHostSessionId] = useState<string | null>(null);
  const [liveViewerCount, setLiveViewerCount] = useState(0);
  const [liveSessionStatus, setLiveSessionStatus] =
    useState<LiveSessionListenerStatus>("loading");
  const [firebaseOnline, setFirebaseOnline] = useState(true);
  const [livePublishError, setLivePublishError] = useState<string | null>(null);
  const [subscriberHydrated, setSubscriberHydrated] = useState(!isSubscriberView);
  /** Avoid writing localStorage before the first load from localStorage (host only). */
  const [localStorageHydrated, setLocalStorageHydrated] = useState(isSubscriberView);

  const publishTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const liveHostSessionIdRef = useRef<string | null>(null);
  const liveCodeRef = useRef<string | null>(null);

  useEffect(() => {
    liveHostSessionIdRef.current = liveHostSessionId;
  }, [liveHostSessionId]);

  useEffect(() => {
    liveCodeRef.current = liveCode;
  }, [liveCode]);

  useEffect(() => {
    if (isSubscriberView) return;
    const full = parsePersistedSnapshot(localStorage.getItem(STORAGE_SCOREBOARD));
    if (full) {
      setScoreA(full.scoreA);
      setScoreB(full.scoreB);
      setSetsWonA(full.setsWonA);
      setSetsWonB(full.setsWonB);
      setNameA(full.nameA);
      setNameB(full.nameB);
      setHistory(full.history);
      setIsSwapped(full.isSwapped);
      setCompletedSets(full.completedSets);
      setGameMode(full.gameMode);
      setUnlimitedSets(full.unlimitedSets);
      setThemeId(full.themeId);
    } else {
      const savedTheme = localStorage.getItem("vb-scoreboard-theme");
      if (savedTheme) setThemeId(savedTheme);
    }
    setLocalStorageHydrated(true);
  }, [isSubscriberView]);

  useEffect(() => {
    if (!localStorageHydrated || isSubscriberView || typeof window === "undefined") return;
    const snapshot: PersistedSnapshotV1 = {
      v: 1,
      scoreA,
      scoreB,
      setsWonA,
      setsWonB,
      nameA,
      nameB,
      history,
      isSwapped,
      completedSets,
      gameMode,
      unlimitedSets,
      themeId,
    };
    try {
      localStorage.setItem(STORAGE_SCOREBOARD, JSON.stringify(snapshot));
    } catch {
      /* quota */
    }
  }, [
    localStorageHydrated,
    isSubscriberView,
    scoreA,
    scoreB,
    setsWonA,
    setsWonB,
    nameA,
    nameB,
    history,
    isSwapped,
    completedSets,
    gameMode,
    unlimitedSets,
    themeId,
  ]);

  useEffect(() => {
    const theme = themes.find((t) => t.id === themeId) || themes[0];
    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, value]) => {
      const cssVarName = `--theme-${key.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase())}`;
      root.style.setProperty(cssVarName, value);
    });
    if (!isSubscriberView) {
      localStorage.setItem("vb-scoreboard-theme", themeId);
    }
  }, [themeId, isSubscriberView]);

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

  const applyRemoteLiveState = useCallback((s: {
    scoreA: number;
    scoreB: number;
    setsWonA: number;
    setsWonB: number;
    nameA: string;
    nameB: string;
    isSwapped: boolean;
    completedSets: CompletedSet[];
    gameMode: boolean;
    unlimitedSets: boolean;
    themeId: string;
  }) => {
    setScoreA(s.scoreA);
    setScoreB(s.scoreB);
    setSetsWonA(s.setsWonA);
    setSetsWonB(s.setsWonB);
    setNameA(s.nameA);
    setNameB(s.nameB);
    setIsSwapped(s.isSwapped);
    setCompletedSets(s.completedSets);
    setGameMode(s.gameMode);
    setUnlimitedSets(s.unlimitedSets);
    setThemeId(s.themeId);
  }, []);

  useEffect(() => {
    if (!isSubscriberView || !subscriberCode) return;

    const watcherId = createWatcherId();
    let unsubSession: (() => void) | undefined;
    let unsubConn: (() => void) | undefined;
    let cleanupWatcher: (() => void) | undefined;
    let detachGen = 0;

    const detach = () => {
      detachGen++;
      unsubSession?.();
      unsubConn?.();
      cleanupWatcher?.();
      unsubSession = undefined;
      unsubConn = undefined;
      cleanupWatcher = undefined;
    };

    const attach = () => {
      const gen = detachGen;
      unsubSession = subscribeToLiveSession(subscriberCode, ({ status, record }) => {
        setLiveSessionStatus(status);
        if (record) {
          applyRemoteLiveState(record.state);
          setSubscriberHydrated(true);
        } else if (status !== "loading") {
          setSubscriberHydrated(true);
        }
      });
      unsubConn = subscribeDatabaseConnection(setFirebaseOnline);
      void registerWatcherPresence(subscriberCode, watcherId).then((fn) => {
        if (gen !== detachGen) {
          fn();
          return;
        }
        cleanupWatcher = fn;
      });
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        attach();
      } else {
        detach();
      }
    };

    if (document.visibilityState === "visible") {
      attach();
    }
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      detach();
    };
  }, [isSubscriberView, subscriberCode, applyRemoteLiveState]);

  useEffect(() => {
    if (isSubscriberView || typeof window === "undefined") return;

    const code = sessionStorage.getItem(STORAGE_CODE);
    const hid = sessionStorage.getItem(STORAGE_HOST);
    if (!code || !hid || !LIVE_CODE_REGEX.test(code)) return;

    void sessionExists(code).then((exists) => {
      if (exists) {
        setLiveCode(code);
        setLiveHostSessionId(hid);
      } else {
        sessionStorage.removeItem(STORAGE_CODE);
        sessionStorage.removeItem(STORAGE_HOST);
      }
    });
  }, [isSubscriberView]);

  const isLiveHosting =
    !isSubscriberView && Boolean(liveCode && liveHostSessionId && LIVE_CODE_REGEX.test(liveCode));

  useEffect(() => {
    if (!isLiveHosting || !liveCode) return;

    let unsubWatchers: (() => void) | undefined;
    let unsubConn: (() => void) | undefined;

    const detach = () => {
      unsubWatchers?.();
      unsubConn?.();
      unsubWatchers = undefined;
      unsubConn = undefined;
    };

    const attach = () => {
      unsubWatchers = subscribeToWatcherCount(liveCode, setLiveViewerCount);
      unsubConn = subscribeDatabaseConnection(setFirebaseOnline);
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        attach();
      } else {
        detach();
      }
    };

    if (document.visibilityState === "visible") {
      attach();
    }
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      detach();
    };
  }, [isLiveHosting, liveCode]);

  const flushLivePublish = useCallback(() => {
    const code = liveCodeRef.current;
    const hid = liveHostSessionIdRef.current;
    if (!code || !hid) return;

    const state = buildLiveScoreboardStateFromController({
      scoreA,
      scoreB,
      setsWonA,
      setsWonB,
      nameA,
      nameB,
      isSwapped,
      completedSets,
      gameMode,
      unlimitedSets,
      themeId,
    });

    void apiPublishLiveSession({ code, hostSessionId: hid, state })
      .then(() => setLivePublishError(null))
      .catch((e) => {
        setLivePublishError(e instanceof Error ? e.message : "Publish failed");
      });
  }, [
    scoreA,
    scoreB,
    setsWonA,
    setsWonB,
    nameA,
    nameB,
    isSwapped,
    completedSets,
    gameMode,
    unlimitedSets,
    themeId,
  ]);

  const prevLiveHostingRef = useRef(false);
  useEffect(() => {
    if (isLiveHosting && !prevLiveHostingRef.current) {
      flushLivePublish();
    }
    prevLiveHostingRef.current = isLiveHosting;
  }, [isLiveHosting, flushLivePublish]);

  useEffect(() => {
    if (!isLiveHosting) {
      if (publishTimerRef.current) {
        clearTimeout(publishTimerRef.current);
        publishTimerRef.current = null;
      }
      return;
    }

    if (publishTimerRef.current) clearTimeout(publishTimerRef.current);
    publishTimerRef.current = setTimeout(() => {
      publishTimerRef.current = null;
      flushLivePublish();
    }, LIVE_PUBLISH_MS);

    return () => {
      if (publishTimerRef.current) {
        clearTimeout(publishTimerRef.current);
        publishTimerRef.current = null;
      }
    };
  }, [isLiveHosting, flushLivePublish]);

  const startLiveSession = useCallback(async () => {
    if (isSubscriberView) return;
    const state = buildLiveScoreboardStateFromController({
      scoreA,
      scoreB,
      setsWonA,
      setsWonB,
      nameA,
      nameB,
      isSwapped,
      completedSets,
      gameMode,
      unlimitedSets,
      themeId,
    });
    const { code, hostSessionId } = await apiStartLiveSession(state);
    sessionStorage.setItem(STORAGE_CODE, code);
    sessionStorage.setItem(STORAGE_HOST, hostSessionId);
    setLiveCode(code);
    setLiveHostSessionId(hostSessionId);
    setLivePublishError(null);
  }, [
    isSubscriberView,
    scoreA,
    scoreB,
    setsWonA,
    setsWonB,
    nameA,
    nameB,
    isSwapped,
    completedSets,
    gameMode,
    unlimitedSets,
    themeId,
  ]);

  const stopLiveSession = useCallback(async () => {
    const code = liveCodeRef.current;
    const hid = liveHostSessionIdRef.current;
    if (!code || !hid) {
      setLiveCode(null);
      setLiveHostSessionId(null);
      sessionStorage.removeItem(STORAGE_CODE);
      sessionStorage.removeItem(STORAGE_HOST);
      return;
    }
    try {
      await apiStopLiveSession({ code, hostSessionId: hid });
    } catch {
      /* still clear local */
    }
    sessionStorage.removeItem(STORAGE_CODE);
    sessionStorage.removeItem(STORAGE_HOST);
    setLiveCode(null);
    setLiveHostSessionId(null);
    setLiveViewerCount(0);
    setLivePublishError(null);
  }, []);

  const pushToHistory = () => {
    if (isSubscriberView) return;
    setHistory((prev) =>
      [
        ...prev,
        { scoreA, scoreB, setsWonA, setsWonB, isSwapped, completedSets: [...completedSets] },
      ].slice(-50),
    );
  };

  const resetMatch = () => {
    if (isSubscriberView) return;
    setScoreA(0);
    setScoreB(0);
    setSetsWonA(0);
    setSetsWonB(0);
    setIsSwapped(false);
    setCompletedSets([]);
    setHistory([]);
  };

  const handleUndo = () => {
    if (isSubscriberView || history.length === 0) return;
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
    if (isSubscriberView) return;
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
    if (isSubscriberView) return;
    const current = team === "A" ? scoreA : scoreB;
    updateScore(team, current + delta);
  };

  const handleSetWinIncrement = (team: TeamId) => {
    if (isSubscriberView) return;
    pushToHistory();
    const max = unlimitedSets ? 99 : 3;
    if (team === "A") setSetsWonA((prev) => Math.min(max, prev + 1));
    else setSetsWonB((prev) => Math.min(max, prev + 1));
  };

  const handleSwitchSides = () => {
    if (isSubscriberView) return;
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

  const canUndo = !isSubscriberView && history.length > 0;

  const readOnly = isSubscriberView;

  const liveShareUrl =
    typeof window !== "undefined" && liveCode
      ? `${window.location.origin}/live/${liveCode}`
      : liveCode
        ? `/live/${liveCode}`
        : null;

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
    liveSettingsDialogOpen,
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
    readOnly,
    isSubscriberView,
    isLiveHosting,
    liveCode,
    liveViewerCount,
    liveSessionStatus,
    firebaseOnline,
    livePublishError,
    subscriberHydrated,
    /** Host only: `false` until saved state is read from `localStorage`. */
    localStorageReady: localStorageHydrated,
    firebaseConfigured: isFirebaseClientConfigured(),
    liveShareUrl,
    setNameA,
    setNameB,
    setSetsWonA,
    setSetsWonB,
    setScoreDialogOpen,
    setNameDialogOpen,
    setSettingsDialogOpen,
    setLiveSettingsDialogOpen,
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
    startLiveSession,
    stopLiveSession,
  };
}
