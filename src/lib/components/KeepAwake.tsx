"use client";

import { useEffect, useRef } from "react";

type WakeLockSentinelLike = {
  released: boolean;
  release: () => Promise<void>;
  addEventListener?: (type: "release", listener: () => void) => void;
  removeEventListener?: (type: "release", listener: () => void) => void;
};

export function KeepAwake() {
  const sentinelRef = useRef<WakeLockSentinelLike | null>(null);

  useEffect(() => {
    let cancelled = false;

    const requestLock = async () => {
      if (cancelled) return;
      if (typeof navigator === "undefined") return;
      if (!("wakeLock" in navigator)) return;
      if (document.visibilityState !== "visible") return;

      try {
        const anyNav = navigator as unknown as {
          wakeLock?: { request?: (type: "screen") => Promise<WakeLockSentinelLike> };
        };
        const request = anyNav.wakeLock?.request;
        if (!request) return;

        const sentinel = await request("screen");
        if (cancelled) {
          await sentinel.release().catch(() => {});
          return;
        }

        sentinelRef.current = sentinel;
        const onRelease = () => {
          if (sentinelRef.current === sentinel) sentinelRef.current = null;
        };
        sentinel.addEventListener?.("release", onRelease);
      } catch {
        // Not supported or disallowed (e.g. iOS Safari, low-power mode, etc.)
      }
    };

    const releaseLock = async () => {
      const sentinel = sentinelRef.current;
      sentinelRef.current = null;
      await sentinel?.release().catch(() => {});
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void requestLock();
      } else {
        void releaseLock();
      }
    };

    void requestLock();
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      void releaseLock();
    };
  }, []);

  return null;
}

