import { ApiError } from "@/lib/errors";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

/**
 * Transiciones permitidas según STATE.md.
 * (FROM, TO) -> true si está permitido.
 */
const ALLOWED_TRANSITIONS: Record<string, Set<string>> = {
  PENDING: new Set(["LOCKED", "EXPIRED", "CANCELLED"]),
  LOCKED: new Set(["CLOSED"]),
  CLOSED: new Set(["DISTRIBUTED", "FAILED", "DISTRIBUTING"]),
  FAILED: new Set(["DISTRIBUTED"]),
  DISTRIBUTING: new Set(["DISTRIBUTED", "FAILED"]),
  DISTRIBUTED: new Set(),
  EXPIRED: new Set(),
  CANCELLED: new Set(),
};

export function assertTransition(from: string, to: string): void {
  const allowed = ALLOWED_TRANSITIONS[from];
  if (!allowed?.has(to)) {
    throw new ApiError(
      409,
      "INVALID_STATE_TRANSITION",
      `Transition ${from} -> ${to} is not allowed`,
      { from, to }
    );
  }
}

export interface TransitionPatch {
  locked_at?: string;
  distributed_at?: string;
  lock_ref?: string;
  payout_ref?: string;
  ledger_batch_id?: string;
  payout_result?: unknown;
}

/**
 * Actualiza status del prize solo si el estado actual es `from` (optimistic concurrency).
 * Si 0 rows updated -> ApiError 409 STATE_CONFLICT.
 */
export async function transitionPrizeStatus(
  prizeExternalId: string,
  from: string,
  to: string,
  patch?: TransitionPatch
): Promise<void> {
  assertTransition(from, to);

  const updatePayload: Record<string, unknown> = {
    status: to,
    ...patch,
  };

  const { data, error } = await supabaseAdmin
    .from("prizes")
    .update(updatePayload)
    .eq("external_id", prizeExternalId)
    .eq("status", from)
    .select("id");

  if (error) throw error;
  if (!data?.length) {
    throw new ApiError(
      409,
      "STATE_CONFLICT",
      "Prize state changed since last read; retry or refresh",
      { prizeId: prizeExternalId, expectedStatus: from }
    );
  }
}
