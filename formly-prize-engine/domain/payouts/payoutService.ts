import {
  Horizon,
  Keypair,
  TransactionBuilder,
  Operation,
  Account,
} from "@stellar/stellar-sdk";
import { ApiError } from "@/lib/errors";
import { env } from "@/lib/env";
import * as prizeRepo from "@/domain/repositories/prizeRepo";
import {
  assetForRewardType,
  toDecimalAmount,
  amountToStroops,
  stroopsToAmount,
} from "@/domain/intents/paymentIntentService";

const BASE_FEE_FALLBACK = 100;

function isValidStellarPublicKey(s: string): boolean {
  const t = s.trim();
  return t.startsWith("G") && t.length === 56;
}

/**
 * Reparte prize_net en N montos (SPLIT_EQUAL): stroops / N por persona, resto al primero.
 */
function splitAmounts(prizeNetStr: string, count: number): string[] {
  if (count <= 0) return [];
  if (count === 1) return [toDecimalAmount(prizeNetStr)];
  const totalStroops = amountToStroops(prizeNetStr);
  const perStroops = totalStroops / BigInt(count);
  const remainder = totalStroops - perStroops * BigInt(count);
  const amounts: string[] = [];
  for (let i = 0; i < count; i++) {
    const stroops = i === 0 ? perStroops + remainder : perStroops;
    amounts.push(stroopsToAmount(stroops));
  }
  return amounts;
}

export interface PayToDestinationsPayment {
  destination: string;
  amount: string;
}

export interface PayToDestinationsResult {
  prizeId: string;
  txHash: string;
  asset: string;
  distributionMode: string;
  payments: PayToDestinationsPayment[];
}

/**
 * Sends from the prize vault to one or more wallets according to distribution_mode.
 * - LOTTERY_SINGLE: full prize_net to the first wallet (extra destinations ignored).
 * - SPLIT_EQUAL: prize_net split equally across all wallets (remainder to first).
 * Amount and asset are taken from the prize, not from the request.
 */
export async function payToDestinations(params: {
  prizeId: string;
  destinations: string[];
}): Promise<PayToDestinationsResult> {
  const { prizeId, destinations } = params;
  const horizonUrl = env.HORIZON_URL;
  const networkPassphrase = env.STELLAR_NETWORK_PASSPHRASE;
  const vaultSecret = env.PRIZE_VAULT_SECRET_KEY;
  const vaultPublic = env.PRIZE_VAULT_PUBLIC_KEY;
  const usdcIssuer = env.USDC_ISSUER ?? "";

  if (!horizonUrl || !networkPassphrase || !vaultSecret || !vaultPublic) {
    throw new ApiError(
      503,
      "SERVICE_UNAVAILABLE",
      "HORIZON_URL, STELLAR_NETWORK_PASSPHRASE and PRIZE_VAULT keys are required for payouts",
      null
    );
  }

  const prize = await prizeRepo.findPrizeById(prizeId);
  if (!prize) {
    throw new ApiError(404, "NOT_FOUND", "Prize not found", null);
  }
  if (prize.reward_type !== "XLM" && prize.reward_type !== "USDC") {
    throw new ApiError(422, "UNPROCESSABLE_ENTITY", "Prize must be XLM or USDC to pay out", null);
  }
  if (prize.status !== "LOCKED" && prize.status !== "CLOSED") {
    throw new ApiError(
      409,
      "INVALID_STATE",
      "Prize must be LOCKED or CLOSED to pay out",
      { status: prize.status }
    );
  }
  if (prize.vault_public_key !== vaultPublic) {
    throw new ApiError(503, "SERVICE_UNAVAILABLE", "Prize vault does not match configured vault", null);
  }

  if (!Array.isArray(destinations) || destinations.length === 0) {
    throw new ApiError(400, "VALIDATION_ERROR", "destinations is required (non-empty array of G...)", null);
  }
  const validDests = destinations
    .filter((d) => typeof d === "string" && d.trim())
    .map((d) => (d as string).trim());
  if (validDests.length === 0) {
    throw new ApiError(400, "VALIDATION_ERROR", "destinations must contain at least one Stellar address (G..., 56 chars)", null);
  }
  for (const d of validDests) {
    if (!isValidStellarPublicKey(d)) {
      throw new ApiError(400, "VALIDATION_ERROR", `Invalid destination: ${d.slice(0, 8)}... (must be G..., 56 chars)`, null);
    }
  }

  const mode = (prize.distribution_mode ?? "LOTTERY_SINGLE").toUpperCase();
  const prizeNet = toDecimalAmount(prize.prize_net);
  const asset = prize.reward_type as "XLM" | "USDC";

  if (mode === "LOTTERY_SINGLE" && validDests.length > 1) {
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      "LOTTERY_SINGLE accepts exactly one destination; received " + validDests.length,
      null
    );
  }

  let effectiveDests: string[];
  let amounts: string[];
  if (mode === "LOTTERY_SINGLE") {
    effectiveDests = [validDests[0]];
    amounts = [prizeNet];
  } else {
    effectiveDests = validDests;
    amounts = splitAmounts(prizeNet, validDests.length);
  }

  const server = new Horizon.Server(horizonUrl, { allowHttp: horizonUrl.startsWith("http://") });
  let sourceAccount: Account;
  try {
    const accountResponse = await server.loadAccount(vaultPublic);
    sourceAccount = new Account(accountResponse.accountId(), accountResponse.sequenceNumber());
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new ApiError(503, "SERVICE_UNAVAILABLE", `Cannot load vault account: ${msg}`, null);
  }

  let baseFee: number;
  try {
    baseFee = await server.fetchBaseFee();
  } catch {
    baseFee = BASE_FEE_FALLBACK;
  }

  const timebounds = await server.fetchTimebounds(300);
  const paymentAsset = assetForRewardType(asset, usdcIssuer);
  const keypair = Keypair.fromSecret(vaultSecret);
  let builder = new TransactionBuilder(sourceAccount, {
    fee: String(baseFee),
    networkPassphrase,
    timebounds: { minTime: timebounds.minTime, maxTime: timebounds.maxTime },
  });

  for (let i = 0; i < effectiveDests.length; i++) {
    builder = builder.addOperation(
      Operation.payment({
        destination: effectiveDests[i],
        asset: paymentAsset,
        amount: amounts[i],
      })
    );
  }

  const transaction = builder.build();
  transaction.sign(keypair);

  let result: { hash: string };
  try {
    result = await server.submitTransaction(transaction);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new ApiError(502, "BAD_GATEWAY", `Stellar submit failed: ${msg}`, null);
  }

  const payments: PayToDestinationsPayment[] = effectiveDests.map((dest, i) => ({
    destination: dest,
    amount: amounts[i],
  }));

  try {
    await prizeRepo.updatePrizeStatus(prizeId, prize.status, {
      payout_ref: result.hash,
      payout_result: { payments },
    });
  } catch {
    // no bloquear la respuesta si falla guardar el payout
  }

  return {
    prizeId,
    txHash: result.hash,
    asset,
    distributionMode: mode,
    payments,
  };
}
