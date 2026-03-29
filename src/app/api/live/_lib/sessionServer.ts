import { randomInt, randomUUID } from "crypto";
import { getFirebaseAdminDatabase, isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import {
  RTDB_LIVE_SESSIONS,
  RTDB_LIVE_SECRETS,
  RTDB_LIVE_WATCHERS,
} from "@/lib/firebase/rtdbPaths";
import type { LiveScoreboardState, LiveSessionPublicRecord } from "@/lib/types/scoreboard";
import { parseLiveScoreboardState } from "@/lib/live/liveScoreboardState";

const CODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export const SESSION_TTL_MS = 60 * 60 * 1000;

export function assertAdminConfigured() {
  if (!isFirebaseAdminConfigured()) {
    throw new Error("Firebase Admin is not configured");
  }
}

export function generateLiveCode(): string {
  let s = "";
  for (let i = 0; i < 4; i++) {
    s += CODE_CHARS[randomInt(CODE_CHARS.length)]!;
  }
  return s;
}

export async function readHostSessionId(code: string): Promise<string | null> {
  const db = getFirebaseAdminDatabase();
  const snap = await db.ref(`${RTDB_LIVE_SECRETS}/${code}/hostSessionId`).once("value");
  const v = snap.val();
  return typeof v === "string" ? v : null;
}

export async function verifyHostSession(code: string, hostSessionId: string): Promise<boolean> {
  const stored = await readHostSessionId(code);
  return stored !== null && stored === hostSessionId;
}

export async function deleteLiveSessionTrees(code: string) {
  const db = getFirebaseAdminDatabase();
  await Promise.all([
    db.ref(`${RTDB_LIVE_SESSIONS}/${code}`).remove(),
    db.ref(`${RTDB_LIVE_SECRETS}/${code}`).remove(),
    db.ref(`${RTDB_LIVE_WATCHERS}/${code}`).remove(),
  ]);
}

export function buildPublicRecord(
  state: LiveScoreboardState,
  now: number,
): LiveSessionPublicRecord {
  return {
    state,
    isLive: true,
    createdAt: now,
    updatedAt: now,
    lastHeartbeatAt: now,
    expiresAt: now + SESSION_TTL_MS,
  };
}

export async function createLiveSessionWithUniqueCode(
  state: LiveScoreboardState,
): Promise<{ code: string; hostSessionId: string }> {
  assertAdminConfigured();
  const db = getFirebaseAdminDatabase();
  const hostSessionId = randomUUID();

  for (let attempt = 0; attempt < 64; attempt++) {
    const code = generateLiveCode();
    const sessionRef = db.ref(`${RTDB_LIVE_SESSIONS}/${code}`);
    const existing = await sessionRef.once("value");
    if (existing.exists()) continue;

    const now = Date.now();
    const record = buildPublicRecord(state, now);
    await sessionRef.set(record);
    await db.ref(`${RTDB_LIVE_SECRETS}/${code}`).set({ hostSessionId });
    return { code, hostSessionId };
  }

  throw new Error("Could not allocate a live session code");
}

export async function publishLiveSessionState(
  code: string,
  hostSessionId: string,
  state: LiveScoreboardState,
): Promise<void> {
  assertAdminConfigured();
  const ok = await verifyHostSession(code, hostSessionId);
  if (!ok) {
    const err = new Error("Forbidden");
    (err as Error & { status: number }).status = 403;
    throw err;
  }

  const db = getFirebaseAdminDatabase();
  const sessionRef = db.ref(`${RTDB_LIVE_SESSIONS}/${code}`);
  const snap = await sessionRef.once("value");
  if (!snap.exists()) {
    const err = new Error("Not found");
    (err as Error & { status: number }).status = 404;
    throw err;
  }
  const existing = snap.val() as Record<string, unknown> | null;
  if (existing?.isLive !== true) {
    const err = new Error("Not found");
    (err as Error & { status: number }).status = 404;
    throw err;
  }

  const now = Date.now();
  await sessionRef.update({
    state,
    updatedAt: now,
    lastHeartbeatAt: now,
    expiresAt: now + SESSION_TTL_MS,
  });
}

export async function stopLiveSession(code: string, hostSessionId: string): Promise<void> {
  assertAdminConfigured();
  const ok = await verifyHostSession(code, hostSessionId);
  if (!ok) {
    const err = new Error("Forbidden");
    (err as Error & { status: number }).status = 403;
    throw err;
  }
  await deleteLiveSessionTrees(code);
}

export function parseStateBody(raw: unknown): LiveScoreboardState | null {
  if (typeof raw !== "object" || raw === null) return null;
  const o = raw as Record<string, unknown>;
  return parseLiveScoreboardState(o.state ?? o);
}
