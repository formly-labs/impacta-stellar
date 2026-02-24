import { ApiError } from "@/lib/errors";
import { env } from "@/lib/env";
import { acquireLock } from "@/lib/locks";
import { buildMemo, toDecimalAmount, calcFeeAndNet } from "@/domain/intents/paymentIntentService";
import * as prizeRepo from "@/domain/repositories/prizeRepo";
import * as entryRepo from "@/domain/repositories/entryRepo";
import * as resultRepo from "@/domain/repositories/resultRepo";
import { assertTransition, transitionPrizeStatus } from "@/domain/state/stateMachine";
import { toPrizePublic } from "@/domain/mappers/prizeMapper";
import type { CreatePrizeInput } from "@/validators/prizeValidators";
import type { PrizePublic, DistributionResult } from "@/types/dtos";

const DISTRIBUTE_LOCK_TTL_SECONDS = 60;

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

export async function closePrize(prizeId: string): Promise<PrizePublic> {
  const row = await prizeRepo.findPrizeById(prizeId);
  if (!row) throw new ApiError(404, "NOT_FOUND", "Prize not found", null);
  assertTransition(row.status, "CLOSED");
  await transitionPrizeStatus(prizeId, "LOCKED", "CLOSED");
  const updated = await prizeRepo.findPrizeById(prizeId);
  return toPrizePublic(updated!);
}

export async function getResult(prizeId: string): Promise<DistributionResult | null> {
  const snapshot = await resultRepo.getResult(prizeId);
  if (!snapshot) return null;
  return {
    prizeId: snapshot.prizeId,
    status: snapshot.status,
    payoutRef: snapshot.payoutRef,
    ledgerBatchId: snapshot.ledgerBatchId,
    distributedAt: snapshot.distributedAt,
    winners: snapshot.winners ?? [],
  };
}

export async function distributePrize(
  prizeId: string,
  requestId: string
): Promise<DistributionResult> {
  await acquireLock({
    scopeId: prizeId,
    operation: "distribute",
    ttlSeconds: DISTRIBUTE_LOCK_TTL_SECONDS,
    ownerId: requestId,
  });

  const row = await prizeRepo.findPrizeById(prizeId);
  if (!row) throw new ApiError(404, "NOT_FOUND", "Prize not found", null);
  if (row.status === "DISTRIBUTED") {
    const existing = await resultRepo.getResult(prizeId);
    if (existing) {
      return {
        prizeId: existing.prizeId,
        status: existing.status,
        payoutRef: existing.payoutRef,
        ledgerBatchId: existing.ledgerBatchId,
        distributedAt: existing.distributedAt,
        winners: existing.winners ?? [],
      };
    }
  }

  const now = new Date().toISOString();
  if (new Date(row.draw_at) > new Date(now)) {
    throw new ApiError(
      422,
      "UNPROCESSABLE_ENTITY",
      "drawAt has not passed yet",
      null
    );
  }

  const prizeUuid = row.id;
  const entriesResult = await entryRepo.listEntries(prizeUuid, { limit: 10000 });
  const entries = entriesResult.items;
  const N = entries.length;

  if (N === 0) {
    await transitionPrizeStatus(prizeId, row.status, "FAILED");
    throw new ApiError(
      422,
      "UNPROCESSABLE_ENTITY",
      "No entries to distribute",
      { errorCode: "NO_ENTRIES_TO_DISTRIBUTE" }
    );
  }

  assertTransition(row.status, row.reward_type === "POINTS" ? "DISTRIBUTED" : "DISTRIBUTING");

  const prizeNet = Number(row.prize_net);
  const distributionMode = row.distribution_mode;
  const winners: Array<{ entryId: string; userId: string; amount: string; winner: boolean }> = [];

  if (distributionMode === "LOTTERY_SINGLE") {
    const idx = Math.floor(Math.random() * N);
    const winner = entries[idx];
    winners.push({
      entryId: winner.external_id,
      userId: winner.wallet_address,
      amount: String(prizeNet),
      winner: true,
    });
  } else {
    const amountPerWinner = Math.floor(prizeNet / N);
    const remainder = prizeNet - amountPerWinner * N;
    const sorted = [...entries].sort((a, b) => a.external_id.localeCompare(b.external_id));
    sorted.forEach((entry, i) => {
      const amount = i === 0 ? amountPerWinner + remainder : amountPerWinner;
      winners.push({
        entryId: entry.external_id,
        userId: entry.wallet_address,
        amount: String(amount.toFixed(7)),
        winner: false,
      });
    });
  }

  const resultJson: DistributionResult = {
    prizeId,
    status: "DISTRIBUTED",
    payoutRef: null,
    ledgerBatchId: null,
    distributedAt: now,
    winners,
  };

  for (const w of winners) {
    await entryRepo.updateEntryAmountAndWinner(prizeUuid, w.entryId, w.amount, w.winner);
  }

  if (row.reward_type === "POINTS") {
    const batchId = `batch_${toExternalId("ledger")}`;
    const { supabaseAdmin } = await import("@/lib/supabaseAdmin");
    for (const w of winners) {
      await supabaseAdmin.from("points_ledger").insert({
        prize_id: prizeUuid,
        wallet_address: w.userId,
        delta_points: w.amount,
        reason: "prize_distribution",
        batch_id: batchId,
      });
    }
    resultJson.ledgerBatchId = batchId;
    await transitionPrizeStatus(prizeId, row.status, "DISTRIBUTED", {
      distributed_at: now,
      ledger_batch_id: batchId,
      payout_result: resultJson,
    });
  } else {
    resultJson.status = "DISTRIBUTING";
    resultJson.payoutRef = null;
    await transitionPrizeStatus(prizeId, row.status, "DISTRIBUTING", {
      distributed_at: now,
      payout_result: resultJson,
    });
  }

  return resultJson;
}
