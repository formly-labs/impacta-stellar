import { ApiError } from "@/lib/errors";
import { env } from "@/lib/env";
import { buildMemo, toDecimalAmount, calcFeeAndNet } from "@/domain/intents/paymentIntentService";
import * as prizeRepo from "@/domain/repositories/prizeRepo";
import { toPrizePublic } from "@/domain/mappers/prizeMapper";
import type { CreatePrizeInput } from "@/validators/prizeValidators";
import type { PrizePublic } from "@/types/dtos";

function toExternalId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
}

/** Convierte FEE_PERCENT (0-100) a bps (0-10000). Ej: 10 -> 1000. */
function feePercentToBps(percent: number): number {
  return Math.round(percent * 100);
}

export async function createPrize(
  input: CreatePrizeInput,
  _requestId: string
): Promise<PrizePublic> {
  const feePercent = input.feePercent ?? 10;
  const feeBps = feePercentToBps(feePercent);
  const amountStr = input.prizeAmount || "0";
  const amountTotalNorm = toDecimalAmount(amountStr);
  const { feeAmount, prizeNet } = calcFeeAndNet(amountTotalNorm, feeBps);

  const status = "AWAITING_PAYMENT_CONFIRMATION";
  const externalId = toExternalId("prize");

  const sharedVault = env.PRIZE_VAULT_PUBLIC_KEY;
  if (!sharedVault) {
    throw new ApiError(
      500,
      "INTERNAL_ERROR",
      "PRIZE_VAULT_PUBLIC_KEY is not configured (required for XLM/USDC prizes)",
      null
    );
  }
  const memo = buildMemo(externalId);

  const now = new Date();
  const closeAt = new Date(now);
  closeAt.setFullYear(now.getFullYear() + 1);
  const drawAt = new Date(closeAt);
  drawAt.setDate(drawAt.getDate() + 1);

  const row = await prizeRepo.insertPrize({
    external_id: externalId,
    form_id: null,
    creator_user_id: null,
    reward_type: input.rewardType,
    distribution_mode: input.distributionMode,
    amount_total: amountTotalNorm,
    fee_bps: feeBps,
    fee_amount: feeAmount,
    prize_net: prizeNet,
    close_at: closeAt.toISOString(),
    draw_at: drawAt.toISOString(),
    status,
    vault_public_key: sharedVault,
    memo: memo ?? undefined,
    memo_type: "text",
  });
  return toPrizePublic(row);
}

export async function getPrize(prizeId: string): Promise<PrizePublic | null> {
  const row = await prizeRepo.findPrizeById(prizeId);
  return row ? toPrizePublic(row) : null;
}
