import { NextResponse } from "next/server";
import {
  assertAdminConfigured,
  publishLiveSessionState,
} from "@/app/api/live/_lib/sessionServer";
import { LIVE_CODE_REGEX, parseLiveScoreboardState } from "@/lib/live/liveScoreboardState";

export async function POST(request: Request) {
  try {
    assertAdminConfigured();
  } catch {
    return NextResponse.json(
      { error: "Live sessions are not configured on the server." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const o = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
  const code = typeof o.code === "string" ? o.code.trim().toUpperCase() : "";
  const hostSessionId = typeof o.hostSessionId === "string" ? o.hostSessionId : "";
  if (!LIVE_CODE_REGEX.test(code) || !hostSessionId) {
    return NextResponse.json({ error: "Invalid code or host session" }, { status: 400 });
  }

  const state = parseLiveScoreboardState(o.state);
  if (!state) {
    return NextResponse.json({ error: "Invalid state payload" }, { status: 400 });
  }

  try {
    await publishLiveSessionState(code, hostSessionId, state);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const status = (e as Error & { status?: number }).status;
    if (status === 403) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (status === 404) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
    console.error("live publish error", e);
    return NextResponse.json({ error: "Failed to publish" }, { status: 500 });
  }
}
