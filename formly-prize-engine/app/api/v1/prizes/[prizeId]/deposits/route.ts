import { NextRequest } from "next/server";
import { requireServiceAuth } from "@/lib/auth";
import { normalizeError } from "@/lib/errors";
import { newRequestId, jsonOk, jsonError } from "@/lib/http";
import * as vaultDepositsRepo from "@/domain/repositories/vaultDepositsRepo";
import * as prizeRepo from "@/domain/repositories/prizeRepo";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/prizes/:prizeId/deposits?payer=G...
 * ¿Esta wallet pagó este premio? Busca en vault_deposits por payer y memo del premio.
 * Respuesta: { paid, amount, amountTotal, txHash?, ledgerAt? } — amount en vault (90%), amountTotal = 90%+10%.
 * Si no pagó: paid=false, amount="0", amountTotal="0".
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ prizeId: string }> }
) {
  const requestId = newRequestId();
  try {
    requireServiceAuth(request);
    const { prizeId } = await params;
    const payer = request.nextUrl.searchParams.get("payer")?.trim();
    if (!payer || !payer.startsWith("G")) {
      return jsonError(
        { errorCode: "VALIDATION_ERROR", message: "Query param 'payer' (Stellar G...) is required", details: null },
        400,
        requestId
      );
    }

    const prize = await prizeRepo.findPrizeById(prizeId);
    if (!prize) {
      return jsonError(
        { errorCode: "NOT_FOUND", message: "Prize not found", details: null },
        404,
        requestId
      );
    }

    const rows = await vaultDepositsRepo.findByPayerAndPrizeMemo(
      payer,
      prize.memo ?? null,
      prize.memo_type ?? null
    );

    if (rows.length === 0) {
      return jsonOk(
        { paid: false, amount: "0", amountTotal: "0" },
        200,
        requestId
      );
    }

    const latest = rows[0];
    return jsonOk(
      {
        paid: true,
        amount: latest.amount_prize_vault,
        amountTotal: latest.amount_total,
        txHash: latest.tx_hash,
        ledgerAt: latest.ledger_at,
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
