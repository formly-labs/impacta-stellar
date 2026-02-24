import { Horizon } from "@stellar/stellar-sdk";
import { ApiError } from "@/lib/errors";
import { env } from "@/lib/env";
import { normalize7 } from "@/lib/stellarAmount";
import { memoMatches } from "@/lib/memo";
import * as prizeRepo from "@/domain/repositories/prizeRepo";
import type { PrizeRow } from "@/domain/repositories/prizeRepo";

const ASSET_TYPE_NATIVE = "native";
const POLLING_TX_LIMIT = 80;
const LOOKBACK_HOURS = 168; // 7 días

function getServer(): Horizon.Server {
  const horizonUrl = env.HORIZON_URL;
  if (!horizonUrl) {
    throw new ApiError(503, "SERVICE_UNAVAILABLE", "HORIZON_URL is required", null);
  }
  return new Horizon.Server(horizonUrl, { allowHttp: horizonUrl.startsWith("http://") });
}

function assertVaults(): { prizeVault: string; feeVault: string; usdcCode: string; usdcIssuer: string } {
  const prizeVault = env.PRIZE_VAULT_PUBLIC_KEY;
  const feeVault = env.FEE_VAULT_PUBLIC_KEY;
  if (!prizeVault || !feeVault) {
    throw new ApiError(
      503,
      "SERVICE_UNAVAILABLE",
      "PRIZE_VAULT_PUBLIC_KEY and FEE_VAULT_PUBLIC_KEY are required",
      null
    );
  }
  return {
    prizeVault,
    feeVault,
    usdcCode: env.USDC_ASSET_CODE ?? "USDC",
    usdcIssuer: env.USDC_ISSUER ?? "",
  };
}

const OPERATION_TYPE_PAYMENT = 1;

/** Enmascara una cuenta Stellar para logs (primeros 4 + ... + últimos 4). */
function maskAccount(id: string): string {
  const s = String(id).trim();
  if (s.length <= 12) return "***";
  return `${s.slice(0, 4)}...${s.slice(-4)}`;
}

export interface TxPaymentAmounts {
  amountPrizeVault: string;
  amountFeeVault: string;
  amountTotal: string;
}

/**
 * Comprueba si la transacción tiene al menos el pago de prize_net al vault.
 * Opcional: también se acepta fee_amount al fee_vault (dos pagos). Si la tx solo tiene un pago al vault, basta.
 * Devuelve { ok, amounts?, debug } — amounts cuando ok para incluir en la respuesta de verify-payment.
 */
async function txHasRequiredPayments(
  server: Horizon.Server,
  txHash: string,
  prize: PrizeRow,
  prizeVault: string,
  feeVault: string,
  usdcCode: string,
  usdcIssuer: string
): Promise<
  | { ok: true; amounts: TxPaymentAmounts }
  | { ok: false; debug?: { expectedPrizeVault: string; expectedPrizeNet: string; paymentsSeen: Array<{ to: string; amount: string; asset: string }>; expectedUsdcIssuer?: string } }
> {
  const opPage = await server.operations().forTransaction(txHash).limit(200).call();
  const ops = (opPage.records ?? []) as Array<{
    type?: string;
    type_i?: number;
    to?: string;
    amount?: string;
    asset_type?: string;
    asset_code?: string;
    asset_issuer?: string;
  }>;
  const payments = ops.filter(
    (o) => o.type === "payment" || (o.type_i != null && o.type_i === OPERATION_TYPE_PAYMENT)
  );
  const pv = prizeVault.trim();
  const fv = feeVault.trim();
  const prizeNetNorm = normalize7(prize.prize_net);
  const amountTotalNorm = normalize7(prize.amount_total);
  const feeAmountNorm = normalize7(prize.fee_amount);
  const netFromSplit = normalize7(String(Number(prize.amount_total) - Number(prize.fee_amount)));
  const isXlm = prize.reward_type === "XLM";
  const isUsdc = prize.reward_type === "USDC";
  const assetOk = (p: { asset_type?: string; asset_code?: string; asset_issuer?: string }) =>
    isXlm ? p.asset_type === ASSET_TYPE_NATIVE : isUsdc && p.asset_code === usdcCode && (p.asset_issuer ?? "").trim() === (usdcIssuer ?? "").trim();

  const toPrize = payments.find(
    (p) =>
      (p.to ?? "").trim() === pv &&
      p.amount != null &&
      normalize7(p.amount) === prizeNetNorm &&
      assetOk(p)
  );
  if (toPrize) {
    return { ok: true, amounts: { amountPrizeVault: prizeNetNorm, amountFeeVault: "0.0000000", amountTotal: prizeNetNorm } };
  }

  const toPrizeTotal = payments.find(
    (p) =>
      (p.to ?? "").trim() === pv &&
      p.amount != null &&
      assetOk(p) &&
      normalize7(p.amount) === amountTotalNorm
  );
  if (toPrizeTotal) {
    return { ok: true, amounts: { amountPrizeVault: amountTotalNorm, amountFeeVault: "0.0000000", amountTotal: amountTotalNorm } };
  }

  const toVaultNet = payments.find(
    (p) =>
      (p.to ?? "").trim() === pv &&
      p.amount != null &&
      normalize7(p.amount) === netFromSplit &&
      assetOk(p)
  );
  const toFeeVault = payments.find(
    (p) =>
      (p.to ?? "").trim() === fv &&
      p.amount != null &&
      normalize7(p.amount) === feeAmountNorm &&
      assetOk(p)
  );
  if (toVaultNet && toFeeVault) {
    const aV = toVaultNet.amount ?? "0";
    const aF = toFeeVault.amount ?? "0";
    const total = (parseFloat(aV) + parseFloat(aF)).toFixed(7);
    return { ok: true, amounts: { amountPrizeVault: normalize7(aV), amountFeeVault: normalize7(aF), amountTotal: total } };
  }

  const paymentsSeen = payments.map((p) => ({
    to: maskAccount(p.to ?? ""),
    amount: p.amount ?? "",
    asset: p.asset_type === ASSET_TYPE_NATIVE ? "native" : `${p.asset_code ?? ""}:${maskAccount(p.asset_issuer ?? "")}`,
  }));
  const debugOut: {
    expectedPrizeVault: string;
    expectedPrizeNet: string;
    paymentsSeen: Array<{ to: string; amount: string; asset: string }>;
    expectedUsdcIssuer?: string;
  } = {
    expectedPrizeVault: maskAccount(pv),
    expectedPrizeNet: prizeNetNorm,
    paymentsSeen,
  };
  if (isUsdc && usdcIssuer) {
    debugOut.expectedUsdcIssuer = maskAccount(usdcIssuer.trim());
  }
  return { ok: false, debug: debugOut };
}

export interface VerifyPaymentResult {
  prizeId: string;
  status: string;
  lockRef: string;
  lockedAt: string;
  message: string;
  amountPaidToVault: string;
  amountPaidToFeeVault: string;
  amountTotalPaid: string;
  amountExpectedTotal: string;
  amountExpectedPrizeVault: string;
  amountExpectedFeeVault: string;
}

/**
 * Verifica por hash de transacción. Idempotente.
 */
export async function verifyPaymentByTxHash(
  prizeId: string,
  txHash: string
): Promise<VerifyPaymentResult> {
  const { prizeVault, feeVault, usdcCode, usdcIssuer } = assertVaults();
  const prize = await prizeRepo.findPrizeById(prizeId);
  if (!prize) throw new ApiError(404, "NOT_FOUND", "Prize not found", null);
  if (prize.reward_type !== "XLM" && prize.reward_type !== "USDC") {
    throw new ApiError(422, "UNPROCESSABLE_ENTITY", "Prize must be XLM or USDC to verify payment", null);
  }
  const expectedTotal = normalize7(prize.amount_total);
  const expectedVault = normalize7(prize.prize_net);
  const expectedFee = normalize7(prize.fee_amount);
  if (prize.status === "LOCKED" && prize.lock_ref === txHash) {
    return {
      prizeId,
      status: "LOCKED",
      lockRef: prize.lock_ref!,
      lockedAt: prize.locked_at!,
      message: "Already locked",
      amountPaidToVault: expectedVault,
      amountPaidToFeeVault: expectedFee,
      amountTotalPaid: expectedTotal,
      amountExpectedTotal: expectedTotal,
      amountExpectedPrizeVault: expectedVault,
      amountExpectedFeeVault: expectedFee,
    };
  }
  if (prize.status !== "AWAITING_PAYMENT_CONFIRMATION" || prize.lock_ref != null) {
    throw new ApiError(409, "INVALID_STATE", "Prize is not awaiting payment or is already locked", { status: prize.status });
  }

  const server = getServer();
  let tx: { id: string; memo_type?: string; memo?: string; memo_bytes?: string };
  try {
    tx = await server.transactions().transaction(txHash).call();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new ApiError(400, "VALIDATION_ERROR", `Transaction not found or invalid: ${msg}`, null);
  }

  const txMemoStr = typeof tx.memo === "string" ? tx.memo : typeof tx.memo_bytes === "string" ? tx.memo_bytes : null;
  if (!memoMatches({
    txMemoType: tx.memo_type ?? null,
    txMemo: txMemoStr,
    prizeMemoType: prize.memo_type ?? null,
    prizeMemo: prize.memo ?? null,
  })) {
    throw new ApiError(422, "UNPROCESSABLE_ENTITY", "Transaction memo does not match prize", null);
  }

  const result = await txHasRequiredPayments(server, txHash, prize, prizeVault, feeVault, usdcCode, usdcIssuer);
  if (!result.ok) {
    throw new ApiError(
      422,
      "UNPROCESSABLE_ENTITY",
      "Transaction does not contain required payments (prize_net to vault or amount_total to vault). Check PRIZE_VAULT_PUBLIC_KEY and USDC_ISSUER in .env match the transaction.",
      result.debug ?? null
    );
  }

  const now = new Date().toISOString();
  const updated = await prizeRepo.markLocked(prizeId, { lockRef: txHash, lockedAt: now });
  if (!updated) throw new ApiError(409, "STATE_CONFLICT", "Prize state changed; retry", null);

  const { amounts } = result;
  return {
    prizeId,
    status: "LOCKED",
    lockRef: txHash,
    lockedAt: now,
    message: "Payment found and locked",
    amountPaidToVault: amounts.amountPrizeVault,
    amountPaidToFeeVault: amounts.amountFeeVault,
    amountTotalPaid: amounts.amountTotal,
    amountExpectedTotal: expectedTotal,
    amountExpectedPrizeVault: expectedVault,
    amountExpectedFeeVault: expectedFee,
  };
}

export interface VerifyPaymentByPollingResult {
  prizeId: string;
  status: string;
  lockRef: string | null;
  lockedAt: string | null;
  message: string;
  amountPaidToVault: string;
  amountPaidToFeeVault: string;
  amountTotalPaid: string;
  amountExpectedTotal: string;
  amountExpectedPrizeVault: string;
  amountExpectedFeeVault: string;
}

/**
 * Busca en Horizon un pago que coincida con el prize (memo + dos pagos). Sin txHash.
 * Opción 1: payerPublicKey → lista txs desde esa cuenta (quien pagó).
 * Opción 2: sin body → lista txs hacia el vault, filtra por memo del prize.
 */
export async function verifyPaymentByPolling(
  prizeId: string,
  opts?: { payerPublicKey?: string }
): Promise<VerifyPaymentByPollingResult> {
  const { prizeVault, feeVault, usdcCode, usdcIssuer } = assertVaults();
  const prize = await prizeRepo.findPrizeById(prizeId);
  if (!prize) throw new ApiError(404, "NOT_FOUND", "Prize not found", null);
  if (prize.reward_type !== "XLM" && prize.reward_type !== "USDC") {
    throw new ApiError(422, "UNPROCESSABLE_ENTITY", "Prize must be XLM or USDC to verify payment", null);
  }
  const expectedTotal = normalize7(prize.amount_total);
  const expectedVault = normalize7(prize.prize_net);
  const expectedFee = normalize7(prize.fee_amount);

  if (prize.status === "LOCKED") {
    return {
      prizeId,
      status: "LOCKED",
      lockRef: prize.lock_ref,
      lockedAt: prize.locked_at,
      message: "Already locked",
      amountPaidToVault: expectedVault,
      amountPaidToFeeVault: expectedFee,
      amountTotalPaid: expectedTotal,
      amountExpectedTotal: expectedTotal,
      amountExpectedPrizeVault: expectedVault,
      amountExpectedFeeVault: expectedFee,
    };
  }
  if (prize.status !== "AWAITING_PAYMENT_CONFIRMATION" || prize.lock_ref != null) {
    throw new ApiError(409, "INVALID_STATE", "Prize is not awaiting payment or is already locked", { status: prize.status });
  }

  const server = getServer();
  const since = new Date(Date.now() - LOOKBACK_HOURS * 60 * 60 * 1000);

  const accountToQuery = opts?.payerPublicKey?.trim() && opts.payerPublicKey.startsWith("G")
    ? opts.payerPublicKey
    : prizeVault;

  let page: { records: Array<{ id: string; created_at: string; memo_type?: string; memo?: string; memo_bytes?: string }> };
  try {
    page = await server
      .transactions()
      .forAccount(accountToQuery)
      .order("desc")
      .limit(POLLING_TX_LIMIT)
      .call();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new ApiError(502, "BAD_GATEWAY", `Horizon error: ${msg}`, null);
  }

  const records = page.records ?? [];
  for (const tx of records) {
    if (new Date(tx.created_at) < since) continue;
    const txMemoStr = typeof tx.memo === "string" ? tx.memo : typeof tx.memo_bytes === "string" ? tx.memo_bytes : null;
    if (!memoMatches({
      txMemoType: tx.memo_type ?? null,
      txMemo: txMemoStr,
      prizeMemoType: prize.memo_type ?? null,
      prizeMemo: prize.memo ?? null,
    })) continue;

    const payResult = await txHasRequiredPayments(server, tx.id, prize, prizeVault, feeVault, usdcCode, usdcIssuer);
    if (!payResult.ok) continue;

    const now = new Date().toISOString();
    const updated = await prizeRepo.markLocked(prizeId, { lockRef: tx.id, lockedAt: now });
    if (updated) {
      const { amounts } = payResult;
      return {
        prizeId,
        status: "LOCKED",
        lockRef: tx.id,
        lockedAt: now,
        message: "Payment found and locked",
        amountPaidToVault: amounts.amountPrizeVault,
        amountPaidToFeeVault: amounts.amountFeeVault,
        amountTotalPaid: amounts.amountTotal,
        amountExpectedTotal: expectedTotal,
        amountExpectedPrizeVault: expectedVault,
        amountExpectedFeeVault: expectedFee,
      };
    }
  }

  return {
    prizeId,
    status: "AWAITING_PAYMENT_CONFIRMATION",
    lockRef: null,
    lockedAt: null,
    message: opts?.payerPublicKey
      ? "No matching transaction found from that payer in the last 7 days"
      : "No matching transaction found to vault in the last 7 days",
    amountPaidToVault: "0",
    amountPaidToFeeVault: "0",
    amountTotalPaid: "0",
    amountExpectedTotal: expectedTotal,
    amountExpectedPrizeVault: expectedVault,
    amountExpectedFeeVault: expectedFee,
  };
}
