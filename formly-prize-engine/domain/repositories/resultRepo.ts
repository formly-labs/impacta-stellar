import { supabaseAdmin } from "@/lib/supabaseAdmin";

export interface DistributionResultSnapshot {
  prizeId: string;
  status: string;
  payoutRef: string | null;
  ledgerBatchId: string | null;
  distributedAt: string | null;
  winners: Array<{ entryId: string; userId: string; amount: string; winner: boolean }>;
}

export async function getResult(
  prizeExternalId: string
): Promise<DistributionResultSnapshot | null> {
  const { data, error } = await supabaseAdmin
    .from("prizes")
    .select("external_id, status, payout_ref, ledger_batch_id, distributed_at, payout_result")
    .eq("external_id", prizeExternalId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const result = (data.payout_result ?? null) as { winners?: Array<{ entryId: string; userId: string; amount: string; winner: boolean }> } | null;
  const winners = result && Array.isArray(result.winners) ? result.winners : [];
  return {
    prizeId: data.external_id,
    status: data.status,
    payoutRef: data.payout_ref ?? null,
    ledgerBatchId: data.ledger_batch_id ?? null,
    distributedAt: data.distributed_at ?? null,
    winners,
  };
}

export interface ResultJson {
  prizeId: string;
  status: string;
  payoutRef: string | null;
  ledgerBatchId: string | null;
  distributedAt: string;
  winners: Array<{ entryId: string; userId: string; amount: string; winner: boolean }>;
}

export async function upsertResult(
  prizeExternalId: string,
  resultJson: ResultJson,
  patch: { status: string; distributed_at?: string; payout_ref?: string | null; ledger_batch_id?: string | null }
): Promise<void> {
  const { error } = await supabaseAdmin
    .from("prizes")
    .update({
      payout_result: resultJson,
      status: patch.status,
      distributed_at: patch.distributed_at ?? null,
      payout_ref: patch.payout_ref ?? null,
      ledger_batch_id: patch.ledger_batch_id ?? null,
    })
    .eq("external_id", prizeExternalId);
  if (error) throw error;
}
