import { acquireLock } from "@/lib/locks";

const TICK_LOCK_TTL_SECONDS = 60;

/**
 * Ejecuta una pasada del job tick (stub: solo adquiere lock y devuelve respuesta fija).
 * Protegido por lock para evitar ejecuciones concurrentes.
 */
export async function runTick(requestId: string): Promise<{
  runMode: string;
  processedAt: string;
  phases: Record<string, number>;
  actions: Array<{ prizeId: string; action: string; detail: string | null }>;
}> {
  await acquireLock({
    scopeId: "jobs",
    operation: "tick",
    ttlSeconds: TICK_LOCK_TTL_SECONDS,
    ownerId: requestId,
  });

  const processedAt = new Date().toISOString();
  return {
    runMode: "execute",
    processedAt,
    phases: {
      depositsChecked: 0,
      depositsLocked: 0,
      closed: 0,
      distributed: 0,
      failed: 0,
    },
    actions: [],
  };
}
