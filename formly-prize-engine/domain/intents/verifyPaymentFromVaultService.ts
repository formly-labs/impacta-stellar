import { ApiError } from "@/lib/errors";
import * as prizeRepo from "@/domain/repositories/prizeRepo";
import * as vaultDepositsRepo from "@/domain/repositories/vaultDepositsRepo";
import { runVaultDepositRecorder } from "@/domain/jobs/vaultDepositRecorder";

export interface VerifyPaymentResult {
  ok: boolean;
  status?: string;
  txHash?: string;
  amounts?: {
    amountPrizeVault: string;
    amountFeeVault: string;
    amountTotal: string;
  };
  message?: string;
}

/**
 * Verifica el pago consultando vault_deposits (rellenado por el polling).
 * Si hay depósito válido para el premio, opcionalmente marca el prize como LOCKED.
 */
export async function verifyPaymentFromVault(
  prizeId: string,
  opts: { txHash?: string; markLockedIfOk?: boolean }
): Promise<VerifyPaymentResult> {
  const prize = await prizeRepo.findPrizeById(prizeId);
  if (!prize) {
    throw new ApiError(404, "NOT_FOUND", "Prize not found", null);
  }
  if (prize.reward_type !== "XLM" && prize.reward_type !== "USDC") {
    return { ok: false, message: "Prize is not XLM/USDC" };
  }
  if (prize.status === "LOCKED") {
    return {
      ok: true,
      status: "LOCKED",
      txHash: prize.lock_ref ?? undefined,
      message: "Already locked",
    };
  }
  if (prize.status !== "AWAITING_PAYMENT_CONFIRMATION" && prize.status !== "PENDING") {
    return { ok: false, status: prize.status, message: "Prize not awaiting payment" };
  }

  const expectedMemo = prize.memo ?? prizeId;
  const prizeNet = parseFloat(String(prize.prize_net));
  if (isNaN(prizeNet) || prizeNet <= 0) {
    return { ok: false, message: "Invalid prize_net" };
  }

  let deposit: Awaited<ReturnType<typeof vaultDepositsRepo.getByTxHash>> = null;
  try {
    if (opts.txHash?.trim()) {
      deposit = await vaultDepositsRepo.getByTxHash(opts.txHash.trim());
      if (!deposit) {
        return {
          ok: false,
          message: "Transaction not found in vault deposits (polling may not have recorded it yet)",
        };
      }
      const memoMatches =
        deposit.memo === expectedMemo ||
        deposit.memo === prizeId ||
        (deposit.memo != null && expectedMemo !== null && deposit.memo.includes(prizeId));
      if (!memoMatches) {
        return { ok: false, message: "Transaction memo does not match prize" };
      }
    } else {
      let byMemo = await vaultDepositsRepo.findLatestByMemo(prizeId);
      let byFullMemo = expectedMemo !== prizeId ? await vaultDepositsRepo.findLatestByMemo(expectedMemo) : null;
      let byContains = await vaultDepositsRepo.findLatestByMemoContains(prizeId);
      deposit = byMemo ?? byFullMemo ?? byContains ?? null;
      if (!deposit) {
        try {
          await runVaultDepositRecorder({ txLimit: 50 });
        } catch {
          // ignore recorder errors
        }
        byMemo = await vaultDepositsRepo.findLatestByMemo(prizeId);
        byFullMemo = expectedMemo !== prizeId ? await vaultDepositsRepo.findLatestByMemo(expectedMemo) : null;
        byContains = await vaultDepositsRepo.findLatestByMemoContains(prizeId);
        deposit = byMemo ?? byFullMemo ?? byContains ?? null;
      }
      if (!deposit) {
        return {
          ok: false,
          message: "No deposit found for this prize (polling may not have recorded it yet)",
        };
      }
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("vault_deposits") || msg.includes("PGRST205") || msg.includes("schema cache")) {
      throw new ApiError(
        503,
        "SERVICE_UNAVAILABLE",
        "Table vault_deposits is missing. Run supabase/scripts/create_vault_deposits.sql in Supabase SQL Editor.",
        null
      );
    }
    throw e;
  }

  const amountPrizeVault = parseFloat(String(deposit.amount_prize_vault));
  if (isNaN(amountPrizeVault) || amountPrizeVault < prizeNet) {
    return {
      ok: false,
      amounts: {
        amountPrizeVault: String(deposit.amount_prize_vault ?? 0),
        amountFeeVault: String(deposit.amount_fee_vault ?? 0),
        amountTotal: String(deposit.amount_total ?? 0),
      },
      message: `Insufficient amount: need at least ${prizeNet}, got ${amountPrizeVault}`,
    };
  }

  const amounts = {
    amountPrizeVault: String(deposit.amount_prize_vault ?? 0),
    amountFeeVault: String(deposit.amount_fee_vault ?? 0),
    amountTotal: String(deposit.amount_total ?? 0),
  };

  if (opts.markLockedIfOk !== false) {
    const updated = await prizeRepo.markLocked(prizeId, {
      lockRef: deposit.tx_hash,
      lockedAt: new Date().toISOString(),
    });
    if (updated) {
      return { ok: true, status: "LOCKED", txHash: deposit.tx_hash, amounts };
    }
  }

  return { ok: true, status: prize.status, txHash: deposit.tx_hash, amounts };
}
