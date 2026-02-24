import { acquireLock } from "@/lib/locks";
import { runStellarDepositWatcher } from "@/domain/jobs/stellarDepositWatcher";
import * as prizeRepo from "@/domain/repositories/prizeRepo";

const TICK_LOCK_TTL_SECONDS = 60;

export interface RunTickParams {
  runMode: "dry_run" | "execute";
  maxPrizes?: number;
  nowOverride?: string;
}

export interface TickPhaseDeposits {
  awaiting: number;
  scannedTx: number;
  matched: number;
  locked: number;
  skipped: number;
  errors: string[];
}

export interface RunTickResult {
  runId: string;
  now: string;
  runMode: "dry_run" | "execute";
  phases: {
    deposits: TickPhaseDeposits;
  };
}

/**
 * Ejecuta una pasada del job tick: verificación de depósitos (Horizon) y mark LOCKED.
 * Idempotente; protegido por lock jobs/tick.
 */
export async function runTick(
  requestId: string,
  params?: RunTickParams
): Promise<RunTickResult> {
  const runMode = params?.runMode ?? "execute";
  const maxPrizes = Math.max(1, Math.min(100, params?.maxPrizes ?? 50));
  const nowOverride = params?.nowOverride;
  const now = nowOverride ? new Date(nowOverride) : new Date();
  const nowIso = now.toISOString();

  await acquireLock({
    scopeId: "jobs",
    operation: "tick",
    ttlSeconds: TICK_LOCK_TTL_SECONDS,
    ownerId: requestId,
  });

  const watcherResult = await runStellarDepositWatcher({
    maxPrizes,
    nowOverride: nowIso,
  });

  let locked = 0;
  if (runMode === "execute" && watcherResult.matched.length > 0) {
    for (const m of watcherResult.matched) {
      const updated = await prizeRepo.markLocked(m.prizeId, {
        lockRef: m.txHash,
        lockedAt: nowIso,
      });
      if (updated) locked++;
    }
  }

  return {
    runId: requestId,
    now: nowIso,
    runMode,
    phases: {
      deposits: {
        awaiting: watcherResult.awaiting,
        scannedTx: watcherResult.scannedTx,
        matched: watcherResult.matched.length,
        locked,
        skipped: watcherResult.skipped,
        errors: watcherResult.errors,
      },
    },
  };
}
