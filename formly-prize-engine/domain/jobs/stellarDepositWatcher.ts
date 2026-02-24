import { Horizon } from "@stellar/stellar-sdk";
import { env } from "@/lib/env";
import { normalize7 } from "@/lib/stellarAmount";
import { memoMatches } from "@/lib/memo";
import * as prizeRepo from "@/domain/repositories/prizeRepo";
import type { PrizeRow } from "@/domain/repositories/prizeRepo";

const ASSET_TYPE_NATIVE = "native";

export interface WatcherMatch {
  prizeId: string;
  txHash: string;
}

export interface WatcherResult {
  awaiting: number;
  scannedTx: number;
  matched: WatcherMatch[];
  skipped: number;
  errors: string[];
}

/**
 * Watcher determinístico: solo lockea si coincide MEMO + asset + amounts (prize_net + fee_amount en la misma tx).
 */
export async function runStellarDepositWatcher(opts: {
  maxPrizes: number;
  nowOverride?: string;
}): Promise<WatcherResult> {
  const now = opts.nowOverride ? new Date(opts.nowOverride) : new Date();
  const horizonUrl = env.HORIZON_URL;
  const prizeVault = env.PRIZE_VAULT_PUBLIC_KEY;
  const feeVault = env.FEE_VAULT_PUBLIC_KEY;
  const usdcCode = env.USDC_ASSET_CODE ?? "USDC";
  const usdcIssuer = env.USDC_ISSUER ?? "";
  const batchSize = env.WATCHER_BATCH_SIZE ?? 25;
  const lookbackHours = env.WATCHER_TX_LOOKBACK_HOURS ?? 72;
  const txLimit = Math.min(env.WATCHER_TX_LIMIT ?? 200, 200);

  const result: WatcherResult = {
    awaiting: 0,
    scannedTx: 0,
    matched: [],
    skipped: 0,
    errors: [],
  };

  if (!horizonUrl || !prizeVault || !feeVault) {
    result.errors.push("HORIZON_URL, PRIZE_VAULT_PUBLIC_KEY or FEE_VAULT_PUBLIC_KEY not configured");
    return result;
  }

  const prizes = await prizeRepo.listAwaitingPayment({ limit: Math.min(opts.maxPrizes, batchSize) });
  result.awaiting = prizes.length;
  if (prizes.length === 0) return result;

  const byMemo = new Map<string, PrizeRow>();
  for (const p of prizes) {
    const memo = p.memo ?? "";
    if (memo) byMemo.set(memo, p);
  }

  const server = new Horizon.Server(horizonUrl, { allowHttp: horizonUrl.startsWith("http://") });
  const lookbackMs = lookbackHours * 60 * 60 * 1000;
  const since = new Date(now.getTime() - lookbackMs);

  let page: { records: Array<{ id: string; created_at: string; memo_type?: string; memo?: string }> };
  try {
    page = await server
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

  const records = page.records ?? [];
  result.scannedTx = records.length;

  for (const tx of records) {
    const createdAt = new Date(tx.created_at);
    if (createdAt < since) continue;

    const txHash = tx.id;
    const txMemoType = tx.memo_type ?? null;
    const txMemo = tx.memo ?? tx.memo_bytes ?? null;
    if (txMemo == null && txMemoType !== "hash") {
      result.skipped++;
      continue;
    }

    const txMemoStr = typeof txMemo === "string" ? txMemo : null;
    let prize: PrizeRow | undefined;
    for (const [memoKey, p] of byMemo) {
      if (memoMatches({ txMemoType, txMemo: txMemoStr, prizeMemoType: p.memo_type ?? null, prizeMemo: p.memo ?? null })) {
        prize = p;
        break;
      }
    }
    if (!prize) {
      result.skipped++;
      continue;
    }

    let ops: Array<{ type: string; to?: string; amount?: string; asset_type?: string; asset_code?: string; asset_issuer?: string }>;
    try {
      const opPage = await server.operations().forTransaction(txHash).limit(200).call();
      ops = (opPage.records ?? []) as Array<{
        type: string;
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

    const payments = ops.filter((o) => o.type === "payment") as Array<{
      to?: string;
      amount?: string;
      asset_type?: string;
      asset_code?: string;
      asset_issuer?: string;
    }>;

    const prizeNetNorm = normalize7(prize.prize_net);
    const amountTotalNorm = normalize7(prize.amount_total);
    const isXlm = prize.reward_type === "XLM";
    const isUsdc = prize.reward_type === "USDC";
    const assetOk = (p: { asset_type?: string; asset_code?: string; asset_issuer?: string }) =>
      isXlm ? p.asset_type === ASSET_TYPE_NATIVE : isUsdc && p.asset_code === usdcCode && p.asset_issuer === usdcIssuer;

    const toPrize = payments.find(
      (p) =>
        p.to === prizeVault &&
        p.amount != null &&
        normalize7(p.amount) === prizeNetNorm &&
        assetOk(p)
    );
    const toPrizeTotal = payments.find(
      (p) =>
        p.to === prizeVault &&
        p.amount != null &&
        normalize7(p.amount) === amountTotalNorm &&
        assetOk(p)
    );

    if (toPrize || toPrizeTotal) {
      result.matched.push({ prizeId: prize.external_id, txHash });
      byMemo.delete(prize.memo ?? "");
    } else {
      result.skipped++;
    }
  }

  return result;
}
