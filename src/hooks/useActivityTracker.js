// Hook para registrar actividad del usuario automáticamente
// hooks/useActivityTracker.js
import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";

export const useActivityTracker = () => {
  const { data: session } = useSession();
  const lastActivityRef = useRef(Date.now());

  useEffect(() => {
    if (!session?.user) return;

    const trackActivity = async (action, metadata = {}) => {
      try {
        await fetch("/api/admin/monitoring/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action,
            metadata,
            timestamp: Date.now(),
          }),
        });
      } catch (error) {
        console.error("Error tracking activity:", error);
      }
    };

    // Trackear actividad periódica
    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastActivityRef.current > 5 * 60 * 1000) {
        // 5 minutos
        trackActivity("heartbeat");
        lastActivityRef.current = now;
      }
    }, 60000); // Verificar cada minuto

    // Trackear eventos del usuario
    const handleUserActivity = () => {
      lastActivityRef.current = Date.now();
    };

    document.addEventListener("mousedown", handleUserActivity);
    document.addEventListener("keydown", handleUserActivity);
    document.addEventListener("scroll", handleUserActivity);

    return () => {
      clearInterval(interval);
      document.removeEventListener("mousedown", handleUserActivity);
      document.removeEventListener("keydown", handleUserActivity);
      document.removeEventListener("scroll", handleUserActivity);
    };
  }, [session]);

  const trackEvent = async (action, metadata = {}) => {
    if (!session?.user) return;

    try {
      await fetch("/api/admin/monitoring/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          metadata,
        }),
      });
    } catch (error) {
      console.error("Error tracking event:", error);
    }
  };

  return { trackEvent };
};
