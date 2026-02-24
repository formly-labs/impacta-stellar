import { NextRequest } from "next/server";
import { requireServiceAuth } from "@/lib/auth";
import { normalizeError } from "@/lib/errors";
import { newRequestId, jsonOk, jsonError } from "@/lib/http";
import * as vaultDepositsRepo from "@/domain/repositories/vaultDepositsRepo";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/deposits?payer=G...
 * Lista depósitos registrados para esa wallet (quién pagó).
 * Respuesta: { paid, totalAmount, deposits: [{ txHash, amountPrizeVault, amountFeeVault, amountTotal, ledgerAt }] }
 * Si no hay nada: paid=false, totalAmount="0", deposits=[].
 */
export async function GET(request: NextRequest) {
  const requestId = newRequestId();
  try {
    requireServiceAuth(request);
    const payer = request.nextUrl.searchParams.get("payer")?.trim();
    if (!payer || !payer.startsWith("G")) {
      return jsonError(
        { errorCode: "VALIDATION_ERROR", message: "Query param 'payer' (Stellar G...) is required", details: null },
        400,
        requestId
      );
    }

    const limit = Math.min(100, Math.max(1, parseInt(request.nextUrl.searchParams.get("limit") ?? "50", 10) || 50));
    const rows = await vaultDepositsRepo.findByPayer(payer, limit);

    const totalAmount = rows.reduce((sum, r) => sum + parseFloat(r.amount_total), 0).toFixed(7);
    const paid = rows.length > 0;

    const deposits = rows.map((r) => ({
      txHash: r.tx_hash,
      amountPrizeVault: r.amount_prize_vault,
      amountFeeVault: r.amount_fee_vault,
      amountTotal: r.amount_total,
      assetCode: r.asset_code ?? "XLM",
      ledgerAt: r.ledger_at,
    }));

    return jsonOk(
      {
        paid,
        totalAmount: paid ? totalAmount : "0",
        deposits,
      },
      200,
      requestId
    );
  } catch (err) {
    const apiErr = normalizeError(err);
    return jsonError(
      { errorCode: apiErr.errorCode, message: apiErr.message, details: apiErr.details ?? null },
      apiErr.status,
      requestId
    );
  }
}
