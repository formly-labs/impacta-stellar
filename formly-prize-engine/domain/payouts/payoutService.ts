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
import { assetForRewardType, toDecimalAmount } from "@/domain/intents/paymentIntentService";

const BASE_FEE_FALLBACK = 100;

/**
 * Envía desde el prize vault a una wallet. Prize debe estar LOCKED o CLOSED, XLM/USDC.
 * Firma con PRIZE_VAULT_SECRET_KEY y envía la tx a Horizon.
 * asset debe coincidir con el reward_type del prize.
 */
export async function payToWallet(params: {
  prizeId: string;
  destination: string;
  amount: string;
  asset: "XLM" | "USDC";
}): Promise<{ prizeId: string; txHash: string; destination: string; amount: string; asset: string }> {
  const { prizeId, destination, amount, asset } = params;
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
  const assetNorm = (asset ?? "").toUpperCase().trim();
  if (assetNorm !== "XLM" && assetNorm !== "USDC") {
    throw new ApiError(400, "VALIDATION_ERROR", "asset is required and must be XLM or USDC", null);
  }
  if (assetNorm !== prize.reward_type) {
    throw new ApiError(
      422,
      "UNPROCESSABLE_ENTITY",
      `Prize is ${prize.reward_type}; asset must match (use "${prize.reward_type}")`,
      null
    );
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

  const destTrimmed = destination.trim();
  if (!destTrimmed.startsWith("G") || destTrimmed.length !== 56) {
    throw new ApiError(400, "VALIDATION_ERROR", "destination must be a Stellar public key (G..., 56 chars)", null);
  }
  const amountStr = toDecimalAmount(amount);
  if (parseFloat(amountStr) <= 0) {
    throw new ApiError(400, "VALIDATION_ERROR", "amount must be positive", null);
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
  const paymentAsset = assetForRewardType(assetNorm as "XLM" | "USDC", usdcIssuer);
  const keypair = Keypair.fromSecret(vaultSecret);
  const builder = new TransactionBuilder(sourceAccount, {
    fee: String(baseFee),
    networkPassphrase,
    timebounds: { minTime: timebounds.minTime, maxTime: timebounds.maxTime },
  })
    .addOperation(
      Operation.payment({
        destination: destTrimmed,
        asset: paymentAsset,
        amount: amountStr,
      })
    );

  const transaction = builder.build();
  transaction.sign(keypair);

  let result: { hash: string };
  try {
    result = await server.submitTransaction(transaction);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new ApiError(502, "BAD_GATEWAY", `Stellar submit failed: ${msg}`, null);
  }

  return {
    prizeId,
    txHash: result.hash,
    destination: destTrimmed,
    amount: amountStr,
    asset: assetNorm,
  };
}
