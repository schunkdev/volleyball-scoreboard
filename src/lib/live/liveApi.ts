import type { LiveScoreboardState } from "@/lib/types/scoreboard";

export async function apiStartLiveSession(state: LiveScoreboardState): Promise<{
  code: string;
  hostSessionId: string;
}> {
  const res = await fetch("/api/live/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ state }),
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    throw new Error(typeof data.error === "string" ? data.error : "Start failed");
  }
  const code = data.code;
  const hostSessionId = data.hostSessionId;
  if (typeof code !== "string" || typeof hostSessionId !== "string") {
    throw new Error("Invalid start response");
  }
  return { code, hostSessionId };
}

export async function apiPublishLiveSession(input: {
  code: string;
  hostSessionId: string;
  state: LiveScoreboardState;
}): Promise<void> {
  const res = await fetch("/api/live/publish", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    throw new Error(typeof data.error === "string" ? data.error : "Publish failed");
  }
}

export async function apiStopLiveSession(input: {
  code: string;
  hostSessionId: string;
}): Promise<void> {
  const res = await fetch("/api/live/stop", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    throw new Error(typeof data.error === "string" ? data.error : "Stop failed");
  }
}
