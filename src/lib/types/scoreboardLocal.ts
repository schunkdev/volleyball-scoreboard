/**
 * Device-only preferences: not part of LiveScoreboardState and never published
 * to Firebase when hosting. Persisted under `localSettings` in `vb-scoreboard-state`.
 *
 * Game / shared state (scores, names, sets, theme, team colors, game mode, etc.)
 * lives at the root of that snapshot and maps to LiveScoreboardState for live viewers.
 */

export const SCORE_TEXT_SCALE_MIN = 0.65;
export const SCORE_TEXT_SCALE_MAX = 1.4;

export type LocalScoreboardSettings = {
  /** Multiplier for main court score digits; 1 = default layout. */
  scoreTextScale: number;
};

export const DEFAULT_LOCAL_SCOREBOARD_SETTINGS: LocalScoreboardSettings = {
  scoreTextScale: 1,
};

export function parsePersistedLocalSettings(raw: unknown): LocalScoreboardSettings {
  if (raw === undefined || raw === null) return { ...DEFAULT_LOCAL_SCOREBOARD_SETTINGS };
  if (typeof raw !== "object" || Array.isArray(raw)) {
    return { ...DEFAULT_LOCAL_SCOREBOARD_SETTINGS };
  }
  const o = raw as Record<string, unknown>;
  let scoreTextScale = DEFAULT_LOCAL_SCOREBOARD_SETTINGS.scoreTextScale;
  if (typeof o.scoreTextScale === "number" && Number.isFinite(o.scoreTextScale)) {
    scoreTextScale = Math.min(
      SCORE_TEXT_SCALE_MAX,
      Math.max(SCORE_TEXT_SCALE_MIN, o.scoreTextScale),
    );
  }
  return { scoreTextScale };
}

/** Match & appearance block saved from settings (synced when live). */
export type GameSettingsPayload = {
  gameMode: boolean;
  unlimitedSets: boolean;
  theme: string;
  teamColorA: string;
  teamColorB: string;
};

export type SettingsSavePayload = {
  game: GameSettingsPayload;
  local: LocalScoreboardSettings;
};

/** Inline font-size for the large court score (compact vs full layout). */
export function courtScoreFontSizeCss(compactLayout: boolean, scale: number): string {
  const s = Math.min(SCORE_TEXT_SCALE_MAX, Math.max(SCORE_TEXT_SCALE_MIN, scale));
  if (compactLayout) {
    return `clamp(calc(4.25rem * ${s}), min(calc(21vw * ${s}), calc(44vh * ${s})), calc(8.5rem * ${s}))`;
  }
  return `clamp(calc(15rem * ${s}), calc(52vh * ${s}), calc(36rem * ${s}))`;
}
