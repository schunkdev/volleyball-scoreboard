import type { CompletedSet, LiveScoreboardState } from "@/lib/types/scoreboard";
import { parseHexColor, parseTeamColorField } from "@/lib/teamColors";

const MAX_NAME_LEN = 48;
const MAX_SETS_EACH = 99;
const MAX_SCORE = 999;
const MAX_COMPLETED_SETS = 15;

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** RTDB often returns numbers as strings; arrays as objects with "0","1",… keys. */
function coerceFiniteInt(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v))) {
    return Number(v);
  }
  return null;
}

function parseCompletedSet(v: unknown): CompletedSet | null {
  if (!isRecord(v)) return null;
  const a = coerceFiniteInt(v.a);
  const b = coerceFiniteInt(v.b);
  if (a === null || b === null) return null;
  if (!Number.isInteger(a) || !Number.isInteger(b)) return null;
  if (a < 0 || b < 0 || a > MAX_SCORE || b > MAX_SCORE) return null;
  return { a, b };
}

/**
 * Firebase Realtime Database stores JS arrays as objects with numeric keys when read back.
 */
function parseCompletedSetsFromRtdb(cs: unknown): CompletedSet[] | null {
  if (cs === undefined || cs === null) {
    return [];
  }
  if (Array.isArray(cs)) {
    if (cs.length > MAX_COMPLETED_SETS) return null;
    const out: CompletedSet[] = [];
    for (const item of cs) {
      const s = parseCompletedSet(item);
      if (!s) return null;
      out.push(s);
    }
    return out;
  }
  if (isRecord(cs)) {
    const indices = Object.keys(cs)
      .filter((k) => /^\d+$/.test(k))
      .map((k) => Number.parseInt(k, 10))
      .sort((a, b) => a - b);
    if (indices.length > MAX_COMPLETED_SETS) return null;
    const out: CompletedSet[] = [];
    for (const i of indices) {
      const s = parseCompletedSet(cs[String(i)]);
      if (!s) return null;
      out.push(s);
    }
    return out;
  }
  return null;
}

/**
 * Validates and normalizes JSON/state from RTDB or API. Returns null if invalid.
 */
export function parseLiveScoreboardState(raw: unknown): LiveScoreboardState | null {
  if (!isRecord(raw)) return null;

  const num = (k: string) => coerceFiniteInt(raw[k]);

  const scoreA = num("scoreA");
  const scoreB = num("scoreB");
  const setsWonA = num("setsWonA");
  const setsWonB = num("setsWonB");
  if (
    scoreA === null ||
    scoreB === null ||
    setsWonA === null ||
    setsWonB === null
  ) {
    return null;
  }
  if (
    !Number.isInteger(scoreA) ||
    !Number.isInteger(scoreB) ||
    !Number.isInteger(setsWonA) ||
    !Number.isInteger(setsWonB)
  ) {
    return null;
  }
  if (
    scoreA < 0 ||
    scoreB < 0 ||
    scoreA > MAX_SCORE ||
    scoreB > MAX_SCORE ||
    setsWonA < 0 ||
    setsWonB < 0 ||
    setsWonA > MAX_SETS_EACH ||
    setsWonB > MAX_SETS_EACH
  ) {
    return null;
  }

  const nameA = raw.nameA;
  const nameB = raw.nameB;
  if (typeof nameA !== "string" || typeof nameB !== "string") return null;
  const trimA = nameA.trim().slice(0, MAX_NAME_LEN) || "Team A";
  const trimB = nameB.trim().slice(0, MAX_NAME_LEN) || "Team B";

  const isSwapped = raw.isSwapped === true;
  const gameMode = raw.gameMode === true;
  const unlimitedSets = raw.unlimitedSets === true;
  const themeId =
    typeof raw.themeId === "string" && raw.themeId.length <= 64
      ? raw.themeId
      : "stadium-dark";

  const completedSets = parseCompletedSetsFromRtdb(raw.completedSets);
  if (completedSets === null) return null;

  const teamColorA = parseTeamColorField(raw.teamColorA);
  const teamColorB = parseTeamColorField(raw.teamColorB);

  return {
    scoreA,
    scoreB,
    setsWonA,
    setsWonB,
    nameA: trimA,
    nameB: trimB,
    isSwapped,
    completedSets,
    gameMode,
    unlimitedSets,
    themeId,
    teamColorA,
    teamColorB,
  };
}

function clampTeamColor(s: string): string {
  const t = typeof s === "string" ? s.trim().slice(0, 7) : "";
  return parseHexColor(t) ?? "";
}

export function buildLiveScoreboardStateFromController(input: {
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
  teamColorA: string;
  teamColorB: string;
}): LiveScoreboardState {
  const clampInt = (n: number, min: number, max: number) =>
    Math.min(max, Math.max(min, Math.floor(Number.isFinite(n) ? n : 0)));

  const name = (s: string, fallback: string) => {
    const t = typeof s === "string" ? s.trim().slice(0, MAX_NAME_LEN) : "";
    return t || fallback;
  };

  const sets = input.completedSets
    .slice(0, MAX_COMPLETED_SETS)
    .map((c) => ({
      a: clampInt(c.a, 0, MAX_SCORE),
      b: clampInt(c.b, 0, MAX_SCORE),
    }));

  return {
    scoreA: clampInt(input.scoreA, 0, MAX_SCORE),
    scoreB: clampInt(input.scoreB, 0, MAX_SCORE),
    setsWonA: clampInt(input.setsWonA, 0, MAX_SETS_EACH),
    setsWonB: clampInt(input.setsWonB, 0, MAX_SETS_EACH),
    nameA: name(input.nameA, "Team A"),
    nameB: name(input.nameB, "Team B"),
    isSwapped: Boolean(input.isSwapped),
    completedSets: sets,
    gameMode: Boolean(input.gameMode),
    unlimitedSets: Boolean(input.unlimitedSets),
    themeId:
      typeof input.themeId === "string" && input.themeId.length <= 64
        ? input.themeId
        : "stadium-dark",
    teamColorA: clampTeamColor(input.teamColorA),
    teamColorB: clampTeamColor(input.teamColorB),
  };
}

export const LIVE_CODE_REGEX = /^[A-Z0-9]{4}$/;

export function normalizeLiveCode(code: string): string | null {
  const u = code.trim().toUpperCase();
  return LIVE_CODE_REGEX.test(u) ? u : null;
}
