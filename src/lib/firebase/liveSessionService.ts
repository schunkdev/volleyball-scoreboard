"use client";

import {
  ref,
  onValue,
  set,
  onDisconnect,
  get,
  remove,
  type Unsubscribe,
} from "firebase/database";
import { getFirebaseDatabase, isFirebaseClientConfigured } from "@/lib/firebase/client";
import {
  RTDB_LIVE_SESSIONS,
  RTDB_LIVE_WATCHERS,
} from "@/lib/firebase/rtdbPaths";
import type { LiveSessionPublicRecord } from "@/lib/types/scoreboard";
import { parseLiveScoreboardState } from "@/lib/live/liveScoreboardState";

const WATCHER_PREFIX = "w_";

export function createWatcherId(): string {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  const b64 = btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "x")
    .replace(/\//g, "y")
    .replace(/=+$/g, "");
  return `${WATCHER_PREFIX}${b64.slice(0, 20)}`;
}

export function parseLiveSessionRecord(raw: unknown): LiveSessionPublicRecord | null {
  if (typeof raw !== "object" || raw === null) return null;
  const o = raw as Record<string, unknown>;
  const live = o.isLive;
  if (live !== true && live !== 1) return null;
  const state = parseLiveScoreboardState(o.state);
  if (!state) return null;
  const num = (k: string) => {
    const v = o[k];
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v))) {
      return Number(v);
    }
    return null;
  };
  const createdAt = num("createdAt");
  const updatedAt = num("updatedAt");
  const lastHeartbeatAt = num("lastHeartbeatAt");
  const expiresAt = num("expiresAt");
  if (
    createdAt === null ||
    updatedAt === null ||
    lastHeartbeatAt === null ||
    expiresAt === null
  ) {
    return null;
  }
  return {
    state,
    isLive: true,
    createdAt,
    updatedAt,
    lastHeartbeatAt,
    expiresAt,
  };
}

export type LiveSessionListenerStatus =
  | "loading"
  | "live"
  | "ended"
  | "expired"
  | "offline"
  | "misconfigured";

export function subscribeToLiveSession(
  code: string,
  onUpdate: (payload: {
    record: LiveSessionPublicRecord | null;
    status: LiveSessionListenerStatus;
  }) => void,
): Unsubscribe {
  if (!isFirebaseClientConfigured()) {
    onUpdate({ record: null, status: "misconfigured" });
    return () => {};
  }

  const db = getFirebaseDatabase();
  const sessionRef = ref(db, `${RTDB_LIVE_SESSIONS}/${code}`);

  const unsub = onValue(sessionRef, (snap) => {
    const raw = snap.val();
    if (raw == null) {
      onUpdate({ record: null, status: "ended" });
      return;
    }
    const record = parseLiveSessionRecord(raw);
    if (!record) {
      onUpdate({ record: null, status: "ended" });
      return;
    }
    // Do not compare expiresAt to local Date.now() — device clock skew falsely marks
    // active sessions as expired. Rules already enforce expiresAt > now (server) on read.
    onUpdate({ record, status: "live" });
  });

  return () => {
    unsub();
  };
}

export function subscribeToWatcherCount(
  code: string,
  onCount: (n: number) => void,
): Unsubscribe {
  if (!isFirebaseClientConfigured()) {
    onCount(0);
    return () => {};
  }
  const db = getFirebaseDatabase();
  const watchersRef = ref(db, `${RTDB_LIVE_WATCHERS}/${code}`);
  const unsub = onValue(watchersRef, (snap) => {
    const v = snap.val();
    if (v == null || typeof v !== "object") {
      onCount(0);
      return;
    }
    onCount(Object.keys(v as object).length);
  });
  return () => {
    unsub();
  };
}

const HEARTBEAT_MS = 25_000;

export async function registerWatcherPresence(code: string, watcherId: string) {
  if (!isFirebaseClientConfigured()) return () => {};
  const db = getFirebaseDatabase();
  const wRef = ref(db, `${RTDB_LIVE_WATCHERS}/${code}/${watcherId}`);
  const now = Date.now();
  await set(wRef, { joinedAt: now, lastSeenAt: now });
  const disc = onDisconnect(wRef);
  await disc.remove();

  const beat = async () => {
    const t = Date.now();
    await set(wRef, { joinedAt: now, lastSeenAt: t });
  };
  const interval = window.setInterval(() => {
    void beat();
  }, HEARTBEAT_MS);

  return () => {
    window.clearInterval(interval);
    void remove(wRef);
  };
}

export async function sessionExists(code: string): Promise<boolean> {
  if (!isFirebaseClientConfigured()) return false;
  const db = getFirebaseDatabase();
  const snap = await get(ref(db, `${RTDB_LIVE_SESSIONS}/${code}`));
  return snap.exists();
}

export function subscribeDatabaseConnection(
  onOnlineChange: (online: boolean) => void,
): Unsubscribe {
  if (!isFirebaseClientConfigured()) {
    onOnlineChange(false);
    return () => {};
  }
  const db = getFirebaseDatabase();
  const connectedRef = ref(db, ".info/connected");
  return onValue(connectedRef, (snap) => {
    onOnlineChange(!!snap.val());
  });
}
