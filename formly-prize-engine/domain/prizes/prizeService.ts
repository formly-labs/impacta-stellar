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

export async function createPrize(
  input: CreatePrizeInput,
  _requestId: string
): Promise<PrizePublic> {
  const feeBps = input.feeBps ?? 1000;
  const amountStr = input.amount || input.prizeAmount || "0";
  const amountTotalNorm = toDecimalAmount(amountStr);
  const { feeAmount, prizeNet } = calcFeeAndNet(amountTotalNorm, feeBps);

  const status = input.rewardType === "POINTS" ? "LOCKED" : "AWAITING_PAYMENT_CONFIRMATION";
  const externalId = toExternalId("prize");

  let vaultPublicKey: string | null = null;
  let memo: string | null = null;
  let memoType: string | null = "text";
  if (input.rewardType === "XLM" || input.rewardType === "USDC") {
    const sharedVault = env.PRIZE_VAULT_PUBLIC_KEY;
    if (!sharedVault) {
      throw new ApiError(
        500,
        "INTERNAL_ERROR",
        "PRIZE_VAULT_PUBLIC_KEY is not configured (required for XLM/USDC prizes)",
        null
      );
    }
    vaultPublicKey = sharedVault;
    memo = buildMemo(externalId);
  }

  if (new Date(input.drawAt) <= new Date(input.closeAt)) {
    throw new ApiError(422, "UNPROCESSABLE_ENTITY", "drawAt must be after closeAt", null);
  }

  const row = await prizeRepo.insertPrize({
    external_id: externalId,
    form_id: input.formId ?? null,
    creator_user_id: input.creatorId ?? null,
    reward_type: input.rewardType,
    distribution_mode: input.distributionMode,
    amount_total: amountTotalNorm,
    fee_bps: feeBps,
    fee_amount: feeAmount,
    prize_net: prizeNet,
    close_at: input.closeAt,
    draw_at: input.drawAt,
    status,
    vault_public_key: vaultPublicKey,
    memo: memo ?? undefined,
    memo_type: memoType ?? undefined,
  });
  return toPrizePublic(row);
}

export async function getPrize(prizeId: string): Promise<PrizePublic | null> {
  const row = await prizeRepo.findPrizeById(prizeId);
  return row ? toPrizePublic(row) : null;
}
