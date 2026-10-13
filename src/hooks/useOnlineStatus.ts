import { useState, useEffect } from "react";

export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof navigator !== "undefined" && typeof navigator.onLine === "boolean") {
      return navigator.onLine;
    }
    return true;
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Optional heartbeat verification
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/online-status", { method: "GET", cache: "no-store" });
        if (res.ok) {
          setIsOnline(true);
        }
      } catch {
        if (!navigator.onLine) {
          setIsOnline(false);
        }
      }
    }, 90000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, []);

  return isOnline;
}
