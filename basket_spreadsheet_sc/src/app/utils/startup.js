export const STARTUP_SYNC_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_STARTUP_SYNC === "true";

export async function runStartupSync() {
  if (!STARTUP_SYNC_ENABLED) return;       // desactivado
  if (!navigator.onLine) return;           // sin red, no intentes

  try {
    // TODO: tu llamada real
    // const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/algo`);
    // const data = await res.json();
    // ...guardar en IndexedDB / estado, etc.
  } catch (err) {
    console.error("[startup] sync falló:", err);
  }
}