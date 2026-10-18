"use client";

import { useEffect } from "react";
import { runStartupSync } from "../utils/startup";

export default function PwaProvider() {
  useEffect(() => {
    // Sync inicial (no hace nada mientras esté desactivado)
    runStartupSync();

    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return; // solo en build de producción

    let reg;
    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .then((r) => (reg = r))
      .catch((e) => console.error("[SW] registro falló:", e));

    const onOnline = () => {
      reg?.update();
      runStartupSync();
    };
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, []);

  return null;
}