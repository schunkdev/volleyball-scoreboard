const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/**
 * Trims and validates `#rgb` / `#rrggbb`. Returns normalized lowercase `#rrggbb` or null.
 */
export function parseHexColor(input: string): string | null {
  const s = input.trim();
  if (!s) return null;
  const m = HEX_RE.exec(s);
  if (!m) return null;
  let body = m[1]!;
  if (body.length === 3) {
    body = body
      .split("")
      .map((c) => c + c)
      .join("");
  }
  return `#${body.toLowerCase()}`;
}

function linearChannel(c: number): number {
  const x = c / 255;
  return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
}

/**
 * Derives CSS token values for a team accent. `hex` must be a normalized `#rrggbb` from {@link parseHexColor}.
 */
export function teamAccentFromHex(hex: string): {
  base: string;
  muted: string;
  contrast: string;
} {
  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);
  const muted = `rgba(${r}, ${g}, ${b}, 0.2)`;
  const L =
    0.2126 * linearChannel(r) +
    0.7152 * linearChannel(g) +
    0.0722 * linearChannel(b);
  const contrast = L > 0.55 ? "#0c0e12" : "#f8fafc";
  return { base: hex, muted, contrast };
}

const MAX_TEAM_COLOR_LEN = 32;

/** For live/RTDB: coerce unknown to stored `""` or normalized `#rrggbb`. */
export function parseTeamColorField(raw: unknown): string {
  if (typeof raw !== "string") return "";
  const t = raw.trim().slice(0, MAX_TEAM_COLOR_LEN);
  return parseHexColor(t) ?? "";
}
