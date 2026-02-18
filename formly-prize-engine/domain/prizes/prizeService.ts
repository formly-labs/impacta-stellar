import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { CreatePrizeInput } from "@/validators/prizeValidators";
import type { PrizePublic } from "@/types/dtos";

const PLACEHOLDER_VAULT = "GPLACEHOLDER_MVP";

function toExternalId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
}

function rowToPrizePublic(row: {
  id: string;
  external_id: string;
  form_id: string | null;
  creator_user_id: string | null;
  reward_type: string;
  distribution_mode: string;
  amount_total: string;
  fee_bps: number;
  status: string;
  close_at: string;
  draw_at: string;
  created_at: string;
  updated_at: string;
}): PrizePublic {
  return {
    id: row.external_id,
    formId: row.form_id ?? "",
    creatorId: row.creator_user_id ?? "",
    rewardType: row.reward_type as PrizePublic["rewardType"],
    distributionMode: row.distribution_mode as PrizePublic["distributionMode"],
    amount: String(row.amount_total),
    feeBps: row.fee_bps,
    status: row.status,
    closeAt: row.close_at,
    drawAt: row.draw_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createPrize(
  input: CreatePrizeInput,
  _requestId: string
): Promise<PrizePublic> {
  const feeBps = input.feeBps ?? 1000;
  const amountNum = Number(input.amount);
  const feeAmount = (amountNum * feeBps) / 10000;
  const prizeNet = amountNum - feeAmount;

  const status =
    input.rewardType === "POINTS" ? "LOCKED" : "PENDING";
  const vaultPublicKey =
    input.rewardType === "XLM" || input.rewardType === "USDC"
      ? PLACEHOLDER_VAULT
      : null;

  const { data, error } = await supabaseAdmin
    .from("prizes")
    .insert({
      external_id: toExternalId("prize"),
      form_id: input.formId,
      creator_user_id: input.creatorId,
      reward_type: input.rewardType,
      distribution_mode: input.distributionMode,
      amount_total: input.amount,
      fee_bps: feeBps,
      fee_amount: String(feeAmount.toFixed(7)),
      prize_net: String(prizeNet.toFixed(7)),
      close_at: input.closeAt,
      draw_at: input.drawAt,
      status,
      vault_public_key: vaultPublicKey,
    })
    .select(
      "id, external_id, form_id, creator_user_id, reward_type, distribution_mode, amount_total, fee_bps, status, close_at, draw_at, created_at, updated_at"
    )
    .single();

  if (error) throw error;
  return rowToPrizePublic(data);
}

export async function getPrize(prizeId: string): Promise<PrizePublic | null> {
  const { data, error } = await supabaseAdmin
    .from("prizes")
    .select(
      "id, external_id, form_id, creator_user_id, reward_type, distribution_mode, amount_total, fee_bps, status, close_at, draw_at, created_at, updated_at"
    )
    .eq("external_id", prizeId)
    .maybeSingle();

  if (error) throw error;
  return data ? rowToPrizePublic(data) : null;
}
