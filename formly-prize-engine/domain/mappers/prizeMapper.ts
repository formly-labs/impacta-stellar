import type { PrizeRow } from "@/domain/repositories/prizeRepo";
import type { PrizePublic, PrizePayment } from "@/types/dtos";

/** Formatea monto a string sin ceros trailing innecesarios (ej: "1.2000000" -> "1.2"). */
function formatAmount(s: string | number | null | undefined): string {
  if (s == null) return "0";
  const str = String(s);
  const n = parseFloat(str);
  if (isNaN(n)) return str;
  return n.toString();
}

function paymentsFromPayoutResult(payoutResult: unknown): PrizePayment[] | undefined {
  if (payoutResult == null || typeof payoutResult !== "object") return undefined;
  const o = payoutResult as { payments?: Array<{ destination?: string; amount?: string }> };
  if (!Array.isArray(o.payments) || o.payments.length === 0) return undefined;
  const list: PrizePayment[] = [];
  for (const p of o.payments) {
    if (p && typeof p.destination === "string" && typeof p.amount === "string") {
      list.push({ destination: p.destination, amount: formatAmount(p.amount) });
    }
  }
  return list.length ? list : undefined;
}

/** Convierte bps a porcentaje (1000 -> 10). */
function bpsToPercent(bps: number): number {
  return Math.round(bps / 100);
}

export function toPrizePublic(row: PrizeRow): PrizePublic {
  const feeBps = row.fee_bps ?? 1000;
  const payments = paymentsFromPayoutResult(row.payout_result);

  return {
    prizeId: row.external_id,
    status: row.status,
    rewardType: row.reward_type as PrizePublic["rewardType"],
    distributionMode: row.distribution_mode as PrizePublic["distributionMode"],
    prizeAmount: formatAmount(row.amount_total),
    feePercent: bpsToPercent(feeBps),
    feeAmount: formatAmount(row.fee_amount),
    prizeNet: formatAmount(row.prize_net),
    vaultAddress: row.vault_public_key ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    ...(payments && payments.length > 0 ? { payments } : {}),
  };
}
