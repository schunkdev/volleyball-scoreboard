import { NextResponse } from "next/server";
import {
  assertAdminConfigured,
  createLiveSessionWithUniqueCode,
} from "@/app/api/live/_lib/sessionServer";
import { parseLiveScoreboardState } from "@/lib/live/liveScoreboardState";

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
  const state = parseLiveScoreboardState(o.state);
  if (!state) {
    return NextResponse.json({ error: "Invalid state payload" }, { status: 400 });
  }

  try {
    const { code, hostSessionId } = await createLiveSessionWithUniqueCode(state);
    return NextResponse.json({ code, hostSessionId });
  } catch (e) {
    console.error("live start error", e);
    return NextResponse.json({ error: "Failed to create live session" }, { status: 500 });
  }
}
