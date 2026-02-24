import type { PrizeRow } from "@/domain/repositories/prizeRepo";
import type { PrizePublic, PrizePayment } from "@/types/dtos";
import type { PrizeStatus } from "@/types/enums";

/** Formats amount to string without trailing zeros (e.g. "1.2000000" -> "1.2"). */
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

/** Converts bps to percent (1000 -> 10). */
function bpsToPercent(bps: number): number {
  return Math.round(bps / 100);
}

function statusDisplay(status: PrizeStatus): string {
  switch (status) {
    case "DISTRIBUTED":
      return "Paid";
    case "AWAITING_PAYMENT_CONFIRMATION":
      return "Awaiting payment";
    case "LOCKED":
      return "Locked";
    case "CLOSED":
      return "Closed";
    case "PENDING":
      return "Pending";
    case "FAILED":
      return "Failed";
    case "EXPIRED":
      return "Expired";
    case "CANCELLED":
      return "Cancelled";
    case "DISTRIBUTING":
      return "Distributing";
    default:
      return status;
  }
}

export function toPrizePublic(row: PrizeRow): PrizePublic {
  const feeBps = row.fee_bps ?? 1000;
  const payments = paymentsFromPayoutResult(row.payout_result);

  return {
    prizeId: row.external_id,
    status: row.status,
    statusDisplay: statusDisplay(row.status),
    rewardType: row.reward_type,
    distributionMode: row.distribution_mode,
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
