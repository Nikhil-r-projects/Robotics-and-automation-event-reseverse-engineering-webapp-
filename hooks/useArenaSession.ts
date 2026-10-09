"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Team, TeamSession, ChallengeInstance, ChallengeId } from "@/types/arena";

export function useArenaSession() {
  const router = useRouter();
  const pathname = usePathname();
  const [team, setTeam] = useState<Team | null>(null);
  const [session, setSession] = useState<TeamSession | null>(null);
  const [challenges, setChallenges] = useState<Record<ChallengeId, ChallengeInstance> | null>(null);
  const [loading, setLoading] = useState(true);
  const hasTriggeredViolation = useRef(false);

  // Fetch session state
  const refreshState = useCallback(async () => {
    try {
      let res = await fetch("/api/session/state");
      if (!res.ok && res.status === 401) {
        // Quick retry once to protect against serverless cold-start / propagation latency
        await new Promise((r) => setTimeout(r, 600));
        res = await fetch("/api/session/state");
      }

      if (!res.ok) {
        if (pathname !== "/auth" && pathname !== "/eliminated" && !pathname.startsWith("/admin")) {
          router.replace("/auth");
        }
        setLoading(false);
        return;
      }

      const data = await res.json();
      if (data.authenticated) {
        setTeam(data.team);
        setSession(data.session);
        setChallenges(data.challenges);

        if (data.session.status === "ELIMINATED" && pathname !== "/eliminated") {
          router.replace("/eliminated");
        }
      } else {
        if (pathname !== "/auth" && pathname !== "/eliminated" && !pathname.startsWith("/admin")) {
          router.replace("/auth");
        }
      }
    } catch (err) {
      console.error("Session refresh error:", err);
    } finally {
      setLoading(false);
    }
  }, [pathname, router]);

  useEffect(() => {
    refreshState();
  }, [refreshState]);

  // Heartbeat every 15 seconds
  useEffect(() => {
    if (!session || session.status === "ELIMINATED") return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/session/heartbeat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ currentRoute: pathname }),
        });
        const data = await res.json();
        if (data.status === "ELIMINATED") {
          router.replace("/eliminated");
        }
      } catch (err) {
        console.error("Heartbeat error:", err);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [session, pathname, router]);

  // Tab Visibility Violation Watcher (Section 8)
  useEffect(() => {
    if (!session || session.status === "ELIMINATED" || pathname.startsWith("/admin") || pathname === "/eliminated" || pathname === "/auth") {
      return;
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && !hasTriggeredViolation.current) {
        hasTriggeredViolation.current = true;
        
        // Instant violation beacon
        const payload = JSON.stringify({
          type: "TAB_HIDDEN",
          metadata: { route: pathname, timestamp: new Date().toISOString() },
        });

        if (navigator.sendBeacon) {
          navigator.sendBeacon("/api/session/violation", payload);
        } else {
          fetch("/api/session/violation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: payload,
            keepalive: true,
          });
        }

        router.replace("/eliminated");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [session, pathname, router]);

  return { team, session, challenges, loading, refreshState };
}
