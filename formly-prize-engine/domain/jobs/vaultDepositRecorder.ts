import { Horizon } from "@stellar/stellar-sdk";
import { env } from "@/lib/env";
import * as vaultDepositsRepo from "@/domain/repositories/vaultDepositsRepo";

const ASSET_TYPE_NATIVE = "native";
const OPERATION_TYPE_PAYMENT = 1;

export interface VaultDepositRecorderResult {
  scanned: number;
  recorded: number;
  skipped: number;
  errors: string[];
}

/**
 * Recorre las últimas transacciones del prize vault, parsea cada tx (pago al vault + pago al fee vault)
 * y guarda en vault_deposits. Idempotente por tx_hash.
 */
export async function runVaultDepositRecorder(opts?: {
  txLimit?: number;
}): Promise<VaultDepositRecorderResult> {
  const horizonUrl = env.HORIZON_URL;
  const prizeVault = env.PRIZE_VAULT_PUBLIC_KEY;
  const feeVault = env.FEE_VAULT_PUBLIC_KEY;
  const txLimit = Math.min(opts?.txLimit ?? env.WATCHER_TX_LIMIT ?? 200, 200);

  const result: VaultDepositRecorderResult = { scanned: 0, recorded: 0, skipped: 0, errors: [] };

  if (!horizonUrl || !prizeVault || !feeVault) {
    result.errors.push("HORIZON_URL, PRIZE_VAULT_PUBLIC_KEY or FEE_VAULT_PUBLIC_KEY not configured");
    return result;
  }

  const server = new Horizon.Server(horizonUrl, { allowHttp: horizonUrl.startsWith("http://") });
  const pv = prizeVault.trim();
  const fv = feeVault.trim();

  type TxRecord = { id: string; source_account: string; created_at: string; memo_type?: string; memo?: string; memo_bytes?: string };
  let rawPage: { records?: unknown[] };
  try {
    rawPage = await server
      .transactions()
      .forAccount(prizeVault)
      .order("desc")
      .limit(txLimit)
      .call();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    result.errors.push(`Horizon transactions: ${msg}`);
    return result;
  }

  const records = (rawPage.records ?? []) as TxRecord[];
  result.scanned = records.length;

  for (const tx of records) {
    const txHash = tx.id;
    const already = await vaultDepositsRepo.existsByTxHash(txHash);
    if (already) {
      result.skipped++;
      continue;
    }

    let ops: Array<{ type?: string; type_i?: number; to?: string; amount?: string; asset_type?: string; asset_code?: string; asset_issuer?: string }>;
    try {
      const opPage = await server.operations().forTransaction(txHash).limit(200).call();
      ops = (opPage.records ?? []) as Array<{
        type?: string;
        type_i?: number;
        to?: string;
        amount?: string;
        asset_type?: string;
        asset_code?: string;
        asset_issuer?: string;
      }>;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      result.errors.push(`ops for ${txHash}: ${msg}`);
      result.skipped++;
      continue;
    }

    const payments = ops.filter(
      (o) => o.type === "payment" || (o.type_i != null && o.type_i === OPERATION_TYPE_PAYMENT)
    );

    const toVault = payments.filter((p) => (p.to ?? "").trim() === pv);
    const toFee = payments.filter((p) => (p.to ?? "").trim() === fv);

    if (toVault.length === 0) {
      result.skipped++;
      continue;
    }

    const amountPrizeVault = toVault.reduce((sum, p) => {
      const a = p.amount != null ? parseFloat(p.amount) : 0;
      return sum + a;
    }, 0);
    const amountFeeVault = toFee.reduce((sum, p) => {
      const a = p.amount != null ? parseFloat(p.amount) : 0;
      return sum + a;
    }, 0);
    const amountTotal = amountPrizeVault + amountFeeVault;

    const firstPayment = toVault[0];
    const assetType = firstPayment?.asset_type === ASSET_TYPE_NATIVE ? "native" : "credit_alphanum4";
    const assetCode = firstPayment?.asset_code ?? null;
    const assetIssuer = firstPayment?.asset_issuer ?? null;

    const memoType = tx.memo_type ?? null;
    let memoStr: string | null = null;
    if (typeof tx.memo === "string" && tx.memo.length > 0) {
      memoStr = tx.memo;
    } else if (typeof tx.memo_bytes === "string" && tx.memo_bytes.length > 0) {
      try {
        const decoded = Buffer.from(tx.memo_bytes, "base64").toString("utf8");
        if (decoded.length > 0) memoStr = decoded;
      } catch {
        memoStr = tx.memo_bytes;
      }
    }

    try {
      const inserted = await vaultDepositsRepo.insertDeposit({
        tx_hash: txHash,
        payer_public_key: tx.source_account,
        amount_prize_vault: amountPrizeVault.toFixed(7),
        amount_fee_vault: amountFeeVault.toFixed(7),
        amount_total: amountTotal.toFixed(7),
        asset_type: assetType,
        asset_code: assetCode,
        asset_issuer: assetIssuer,
        memo: memoStr,
        memo_type: memoType,
        ledger_at: tx.created_at,
      });
      if (inserted) result.recorded++;
      else result.skipped++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      result.errors.push(`insert ${txHash}: ${msg}`);
      result.skipped++;
    }
  }

  return result;
}
