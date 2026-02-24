import { createHash } from "crypto";
import {
  Horizon,
  TransactionBuilder,
  Asset,
  Operation,
  Memo,
  Account,
} from "@stellar/stellar-sdk";
import { ApiError } from "@/lib/errors";
import { env } from "@/lib/env";
import * as prizeRepo from "@/domain/repositories/prizeRepo";
import * as paymentIntentRepo from "@/domain/repositories/paymentIntentRepo";
import type { PaymentIntentResponse, ExpectedPayment } from "@/types/dtos";

const DECIMALS = 7;
const STROOP_SCALE = 10 ** DECIMALS;
const MEMO_PREFIX = "PRIZE:";
const MEMO_MAX_BYTES = 28;
const BASE_FEE_FALLBACK = 100;

function toExternalId(): string {
  return `pi_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
}

export function buildMemo(prizeId: string): string {
  const full = `${MEMO_PREFIX}${prizeId}`;
  const bytes = Buffer.byteLength(full, "utf8");
  if (bytes <= MEMO_MAX_BYTES) return full;
  const prefixLen = Buffer.byteLength(MEMO_PREFIX, "utf8");
  const maxPrizeIdBytes = MEMO_MAX_BYTES - prefixLen;
  let truncated = prizeId;
  while (Buffer.byteLength(MEMO_PREFIX + truncated, "utf8") > MEMO_MAX_BYTES && truncated.length > 0) {
    truncated = truncated.slice(0, -1);
  }
  return MEMO_PREFIX + truncated;
}

export function assetForRewardType(
  rewardType: string,
  usdcIssuer: string
): Asset {
  if (rewardType === "XLM") {
    return Asset.native();
  }
  if (rewardType === "USDC") {
    const code = env.USDC_ASSET_CODE ?? "USDC";
    return new Asset(code, usdcIssuer);
  }
  throw new ApiError(422, "UNPROCESSABLE_ENTITY", "rewardType must be XLM or USDC", null);
}

export function toDecimalAmount(amountString: string | number): string {
  const s = typeof amountString === "number" ? String(amountString) : amountString;
  if (typeof s !== "string" || !/^\d+(\.\d+)?$/.test(s)) {
    throw new ApiError(400, "VALIDATION_ERROR", "Invalid decimal amount", null);
  }
  const [whole = "0", frac = ""] = s.split(".");
  const padded = frac.padEnd(DECIMALS, "0").slice(0, DECIMALS);
  return `${whole}.${padded}`;
}

export function amountToStroops(amountStr: string | number): bigint {
  const formatted = toDecimalAmount(amountStr);
  const [whole = "0", frac = ""] = formatted.split(".");
  const padded = frac.padEnd(DECIMALS, "0").slice(0, DECIMALS);
  return BigInt(whole + padded);
}

export function stroopsToAmount(stroops: bigint): string {
  const s = stroops.toString().padStart(DECIMALS + 1, "0");
  const whole = s.slice(0, -DECIMALS) || "0";
  const frac = s.slice(-DECIMALS);
  return `${whole}.${frac}`;
}

export function calcFeeAndNet(
  amountTotalStr: string | number,
  feeBps: number
): { feeAmount: string; prizeNet: string } {
  const totalStroops = amountToStroops(amountTotalStr);
  const feeStroops = (totalStroops * BigInt(feeBps)) / BigInt(10000);
  const prizeNetStroops = totalStroops - feeStroops;
  return {
    feeAmount: stroopsToAmount(feeStroops),
    prizeNet: stroopsToAmount(prizeNetStroops),
  };
}

function computeIntentHash(params: {
  prizeId: string;
  amountTotal: string;
  feeAmount: string;
  prizeNet: string;
  depositTarget: string;
  feeTarget: string;
  expiresAt: string;
  expectedPayments: ExpectedPayment[];
}): string {
  const canonical = JSON.stringify({
    prizeId: params.prizeId,
    amountTotal: params.amountTotal,
    feeAmount: params.feeAmount,
    prizeNet: params.prizeNet,
    depositTarget: params.depositTarget,
    feeTarget: params.feeTarget,
    expiresAt: params.expiresAt,
    expectedPayments: params.expectedPayments,
  });
  return createHash("sha256").update(canonical).digest("hex");
}

export async function createPaymentIntent(params: {
  prizeId: string;
  creatorPublicKey: string;
}): Promise<PaymentIntentResponse> {
  const { prizeId, creatorPublicKey } = params;

  const prize = await prizeRepo.findPrizeById(prizeId);
  if (!prize) {
    throw new ApiError(404, "NOT_FOUND", "Prize not found", null);
  }

  if (prize.reward_type !== "XLM" && prize.reward_type !== "USDC") {
    throw new ApiError(
      409,
      "INVALID_STATE_TRANSITION",
      "Payment intent only supported for XLM or USDC rewards",
      null
    );
  }

  if (prize.status !== "PENDING" && prize.status !== "AWAITING_PAYMENT_CONFIRMATION") {
    throw new ApiError(
      409,
      "PRIZE_NOT_PAYABLE",
      "Prize must be in PENDING or AWAITING_PAYMENT_CONFIRMATION status to create payment intent",
      null
    );
  }

  const depositTarget = prize.vault_public_key;
  if (!depositTarget) {
    throw new ApiError(
      409,
      "UNPROCESSABLE_ENTITY",
      "Vault not configured for this prize",
      null
    );
  }

  const feeTarget = env.FEE_VAULT_PUBLIC_KEY;
  if (!feeTarget) {
    throw new ApiError(
      409,
      "UNPROCESSABLE_ENTITY",
      "Fee vault not configured",
      null
    );
  }

  const horizonUrl = env.HORIZON_URL;
  const networkPassphrase = env.STELLAR_NETWORK_PASSPHRASE;
  if (!horizonUrl || !networkPassphrase) {
    throw new ApiError(
      500,
      "INTERNAL_ERROR",
      "Stellar configuration missing (HORIZON_URL, STELLAR_NETWORK_PASSPHRASE)",
      null
    );
  }

  const usdcIssuer = env.USDC_ISSUER ?? "";
  if (prize.reward_type === "USDC" && !usdcIssuer) {
    throw new ApiError(
      409,
      "UNPROCESSABLE_ENTITY",
      "USDC issuer not configured for this network",
      null
    );
  }

  const amountTotal = toDecimalAmount(prize.amount_total);
  const feeBps = prize.fee_bps;
  const { feeAmount, prizeNet } = calcFeeAndNet(amountTotal, feeBps);

  const ttlSeconds = env.INTENT_TTL_SECONDS ?? 900;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlSeconds * 1000);

  const existing = await paymentIntentRepo.findPaymentIntentByPrizeExternalId(prizeId);
  if (existing && new Date(existing.expires_at) > now) {
    const expectedPayments: ExpectedPayment[] = [
      {
        asset: prize.reward_type as "XLM" | "USDC",
        amount: prizeNet,
        destination: depositTarget,
        ...(prize.reward_type === "USDC" && { issuer: usdcIssuer }),
      },
      {
        asset: prize.reward_type as "XLM" | "USDC",
        amount: feeAmount,
        destination: feeTarget,
        ...(prize.reward_type === "USDC" && { issuer: usdcIssuer }),
      },
    ];
    const hash = computeIntentHash({
      prizeId,
      amountTotal,
      feeAmount,
      prizeNet,
      depositTarget,
      feeTarget,
      expiresAt: existing.expires_at,
      expectedPayments,
    });
    return {
      paymentIntentId: existing.external_id,
      prizeId,
      rewardType: prize.reward_type as "XLM" | "USDC",
      amountTotal,
      feeBps,
      feeAmount,
      prizeNet,
      memo: existing.memo ?? buildMemo(prizeId),
      depositTarget,
      feeTarget,
      unsignedXdr: existing.unsigned_xdr,
      networkPassphrase: existing.network_passphrase ?? networkPassphrase,
      expiresAt: existing.expires_at,
      expectedPayments,
      hash,
      horizonUrl: horizonUrl || undefined,
    };
  }

  const server = new Horizon.Server(horizonUrl, { allowHttp: horizonUrl.startsWith("http://") });
  let sourceAccount: Account;
  try {
    const accountResponse = await server.loadAccount(creatorPublicKey);
    sourceAccount = new Account(accountResponse.accountId(), accountResponse.sequenceNumber());
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      `Cannot load creator account from Horizon: ${msg}`,
      null
    );
  }

  let baseFee: number;
  try {
    baseFee = await server.fetchBaseFee();
  } catch {
    baseFee = BASE_FEE_FALLBACK;
  }

  const timebounds = await server.fetchTimebounds(ttlSeconds);
  const memo = buildMemo(prizeId);
  const asset = assetForRewardType(prize.reward_type, usdcIssuer);

  const txFee = baseFee * 2;

  const builder = new TransactionBuilder(sourceAccount, {
    fee: String(txFee),
    networkPassphrase,
    timebounds: { minTime: timebounds.minTime, maxTime: timebounds.maxTime },
  })
    .addMemo(Memo.text(memo))
    .addOperation(
      Operation.payment({
        destination: depositTarget,
        asset,
        amount: prizeNet,
      })
    )
    .addOperation(
      Operation.payment({
        destination: feeTarget,
        asset,
        amount: feeAmount,
      })
    );

  const transaction = builder.build();
  const unsignedXdr = transaction.toEnvelope().toXDR("base64");

  const expectedPayments: ExpectedPayment[] = [
    {
      asset: prize.reward_type as "XLM" | "USDC",
      amount: prizeNet,
      destination: depositTarget,
      ...(prize.reward_type === "USDC" && { issuer: usdcIssuer }),
    },
    {
      asset: prize.reward_type as "XLM" | "USDC",
      amount: feeAmount,
      destination: feeTarget,
      ...(prize.reward_type === "USDC" && { issuer: usdcIssuer }),
    },
  ];

  const expiresAtIso = expiresAt.toISOString();
  const hash = computeIntentHash({
    prizeId,
    amountTotal,
    feeAmount,
    prizeNet,
    depositTarget,
    feeTarget,
    expiresAt: expiresAtIso,
    expectedPayments,
  });

  const paymentIntentId = toExternalId();
  await paymentIntentRepo.upsertPaymentIntent({
    prizeId,
    externalId: paymentIntentId,
    unsignedXdr,
    networkPassphrase,
    expiresAt: expiresAtIso,
    memo,
    intentHash: hash,
  });

  return {
    paymentIntentId,
    prizeId,
    rewardType: prize.reward_type as "XLM" | "USDC",
    amountTotal,
    feeBps,
    feeAmount,
    prizeNet,
    memo,
    depositTarget,
    feeTarget,
    unsignedXdr,
    networkPassphrase,
    expiresAt: expiresAtIso,
    expectedPayments,
    hash,
    horizonUrl: horizonUrl || undefined,
    minTime: timebounds.minTime ? new Date(timebounds.minTime * 1000).toISOString() : undefined,
    maxTime: new Date(timebounds.maxTime * 1000).toISOString(),
  };
}
