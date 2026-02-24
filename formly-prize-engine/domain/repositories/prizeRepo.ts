import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { PrizeStatus, RewardType, DistributionMode } from "@/types/enums";

export interface PrizeRow {
  id: string;
  external_id: string;
  form_id: string | null;
  creator_user_id: string | null;
  reward_type: RewardType;
  distribution_mode: DistributionMode;
  amount_total: string;
  fee_bps: number;
  fee_amount: string;
  prize_net: string;
  close_at: string;
  draw_at: string;
  status: PrizeStatus;
  vault_public_key: string | null;
  memo: string | null;
  memo_type: string | null;
  lock_ref: string | null;
  payout_ref: string | null;
  payout_result: unknown;
  ledger_batch_id: string | null;
  locked_at: string | null;
  distributed_at: string | null;
  created_at: string;
  updated_at: string;
}

const PRIZE_COLUMNS =
  "id, external_id, form_id, creator_user_id, reward_type, distribution_mode, amount_total, fee_bps, fee_amount, prize_net, close_at, draw_at, status, vault_public_key, memo, memo_type, lock_ref, payout_ref, payout_result, ledger_batch_id, locked_at, distributed_at, created_at, updated_at";

export interface InsertPrizeData {
  external_id: string;
  form_id: string | null;
  creator_user_id: string | null;
  reward_type: RewardType;
  distribution_mode: DistributionMode;
  amount_total: string;
  fee_bps: number;
  fee_amount: string;
  prize_net: string;
  close_at: string;
  draw_at: string;
  status: PrizeStatus;
  vault_public_key: string | null;
  memo?: string | null;
  memo_type?: string | null;
}

export interface UpdatePrizeStatusPatch {
  locked_at?: string;
  distributed_at?: string;
  lock_ref?: string;
  payout_ref?: string;
  ledger_batch_id?: string;
  payout_result?: unknown;
}

export async function insertPrize(data: InsertPrizeData): Promise<PrizeRow> {
  const { data: row, error } = await supabaseAdmin
    .from("prizes")
    .insert(data)
    .select(PRIZE_COLUMNS)
    .single();
  if (error) throw error;
  return row as PrizeRow;
}

export async function findPrizeById(id: string): Promise<PrizeRow | null> {
  const { data, error } = await supabaseAdmin
    .from("prizes")
    .select(PRIZE_COLUMNS)
    .eq("external_id", id)
    .maybeSingle();
  if (error) throw error;
  return data as PrizeRow | null;
}

export async function findPrizeByUuid(uuid: string): Promise<PrizeRow | null> {
  const { data, error } = await supabaseAdmin
    .from("prizes")
    .select(PRIZE_COLUMNS)
    .eq("id", uuid)
    .maybeSingle();
  if (error) throw error;
  return data as PrizeRow | null;
}

export async function updatePrizeStatus(
  externalId: string,
  status: PrizeStatus,
  patch?: UpdatePrizeStatusPatch
): Promise<PrizeRow> {
  const body: Record<string, unknown> = { status, ...patch };
  const { data, error } = await supabaseAdmin
    .from("prizes")
    .update(body)
    .eq("external_id", externalId)
    .select(PRIZE_COLUMNS)
    .single();
  if (error) throw error;
  return data as PrizeRow;
}

export async function updatePrize(
  externalId: string,
  patch: Partial<InsertPrizeData>
): Promise<PrizeRow> {
  const { data, error } = await supabaseAdmin
    .from("prizes")
    .update(patch)
    .eq("external_id", externalId)
    .select(PRIZE_COLUMNS)
    .single();
  if (error) throw error;
  return data as PrizeRow;
}

export async function listPrizesByStatusForJobs(_opts: {
  statuses: PrizeStatus[];
  limit: number;
}): Promise<PrizeRow[]> {
  return [];
}

/**
 * Prizes awaiting deposit confirmation: status AWAITING_PAYMENT_CONFIRMATION,
 * reward_type XLM or USDC, lock_ref null. Used by the watcher.
 */
export async function listAwaitingPayment(opts: { limit: number }): Promise<PrizeRow[]> {
  const { data, error } = await supabaseAdmin
    .from("prizes")
    .select(PRIZE_COLUMNS)
    .eq("status", "AWAITING_PAYMENT_CONFIRMATION")
    .in("reward_type", ["XLM", "USDC"])
    .is("lock_ref", null)
    .limit(opts.limit);
  if (error) throw error;
  return (data ?? []) as PrizeRow[];
}

/**
 * Marks prize as LOCKED with lockRef and lockedAt. Only updates if status is
 * AWAITING_PAYMENT_CONFIRMATION and lock_ref is null (idempotent guard).
 */
export async function markLocked(
  prizeId: string,
  params: { lockRef: string; lockedAt: string }
): Promise<PrizeRow | null> {
  const { data, error } = await supabaseAdmin
    .from("prizes")
    .update({
      status: "LOCKED",
      lock_ref: params.lockRef,
      locked_at: params.lockedAt,
    })
    .eq("external_id", prizeId)
    .eq("status", "AWAITING_PAYMENT_CONFIRMATION")
    .is("lock_ref", null)
    .select(PRIZE_COLUMNS)
    .maybeSingle();
  if (error) throw error;
  return data as PrizeRow | null;
}
