import type { PrizeRow } from "@/domain/repositories/prizeRepo";
import type { PrizePublic } from "@/types/dtos";

export function toPrizePublic(row: PrizeRow): PrizePublic {
  return {
    prizeId: row.external_id,
    status: row.status,
    rewardType: row.reward_type as PrizePublic["rewardType"],
    distributionMode: row.distribution_mode as PrizePublic["distributionMode"],
    prizeAmount: String(row.amount_total),
    feeBps: row.fee_bps ?? 1000,
    feeAmount: String(row.fee_amount ?? "0"),
    prizeNet: String(row.prize_net ?? "0"),
    vaultAddress: row.vault_public_key ?? null,
    closeAt: row.close_at,
    drawAt: row.draw_at,
    lockRef: row.lock_ref ?? null,
    payoutRef: row.payout_ref ?? null,
    ledgerBatchId: row.ledger_batch_id ?? null,
    lockedAt: row.locked_at ?? null,
    distributedAt: row.distributed_at ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
