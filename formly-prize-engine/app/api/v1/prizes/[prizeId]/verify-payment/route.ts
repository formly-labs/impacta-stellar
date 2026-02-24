import { NextRequest } from "next/server";
import { requireServiceAuth } from "@/lib/auth";
import { normalizeError } from "@/lib/errors";
import { newRequestId, jsonOk, jsonError } from "@/lib/http";
import { verifyPaymentFromVault } from "@/domain/intents/verifyPaymentFromVaultService";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(
    {
      errorCode: "METHOD_NOT_ALLOWED",
      message:
        "Use POST. Body: {} to check latest deposit by memo, or { \"txHash\": \"...\" } to verify a specific tx. Data comes from vault_deposits (filled by polling).",
    },
    { status: 405 }
  );
}

/**
 * POST /api/v1/prizes/:prizeId/verify-payment
 * Consulta vault_deposits (rellenada por el polling). No llama a Horizon.
 * Body: {} o { "txHash": "..." }. Si hay depósito válido, marca el prize como LOCKED.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ prizeId: string }> }
) {
  const requestId = newRequestId();
  try {
    requireServiceAuth(request);
    const { prizeId } = await params;
    const body = (await request.json().catch(() => ({}))) as { txHash?: string };
    const txHash = typeof body.txHash === "string" ? body.txHash.trim() : undefined;

    const result = await verifyPaymentFromVault(prizeId, {
      txHash,
      markLockedIfOk: true,
    });
    return jsonOk(result, 200, requestId);
  } catch (err) {
    const apiErr = normalizeError(err);
    return jsonError(
      {
        errorCode: apiErr.errorCode,
        message: apiErr.message,
        details: apiErr.details ?? null,
      },
      apiErr.status,
      requestId
    );
  }
}
