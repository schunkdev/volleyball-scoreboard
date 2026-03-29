import { NextResponse } from "next/server";
import {
  assertAdminConfigured,
  deleteLiveSessionTrees,
} from "@/app/api/live/_lib/sessionServer";
import { getFirebaseAdminDatabase } from "@/lib/firebase/admin";
import { RTDB_LIVE_SESSIONS } from "@/lib/firebase/rtdbPaths";

function authorizeCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

/**
 * Deletes sessions whose expiresAt is in the past (stale heartbeats / host offline).
 * Vercel Cron is configured for once daily (04:00 UTC) so it stays within Hobby limits.
 * For more frequent server-side cleanup, call this route from an external scheduler.
 * Subscribers lose read access when rules deny (expired); stale rows are removed here.
 */
export async function POST(request: Request) {
  if (!authorizeCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    assertAdminConfigured();
  } catch {
    return NextResponse.json({ error: "Admin not configured" }, { status: 503 });
  }

  const db = getFirebaseAdminDatabase();
  const now = Date.now();
  const ref = db.ref(RTDB_LIVE_SESSIONS);
  const snap = await ref.orderByChild("expiresAt").endAt(now).once("value");

  const codes: string[] = [];
  snap.forEach((child) => {
    const key = child.key;
    if (key) codes.push(key);
    return false;
  });

  for (const code of codes) {
    try {
      await deleteLiveSessionTrees(code);
    } catch (e) {
      console.error(`cleanup failed for ${code}`, e);
    }
  }

  return NextResponse.json({ removed: codes.length, codes });
}

export async function GET(request: Request) {
  return POST(request);
}
