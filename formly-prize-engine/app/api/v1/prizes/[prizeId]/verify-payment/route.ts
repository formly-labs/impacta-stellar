import { NextRequest } from "next/server";
import { requireServiceAuth } from "@/lib/auth";
import { normalizeError } from "@/lib/errors";
import { newRequestId, jsonOk, jsonError } from "@/lib/http";
import { verifyPaymentByTxHash, verifyPaymentByPolling } from "@/domain/intents/verifyPaymentService";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(
    {
      errorCode: "METHOD_NOT_ALLOWED",
      message: "Use POST. One check per call; caller does polling. Body: {} or { payerPublicKey } or { txHash }.",
    },
    { status: 405 }
  );
}

/**
 * POST /api/v1/prizes/:prizeId/verify-payment
 * Una llamada = una verificación. El que nos invoca hace el polling (llamar cada X segundos hasta status LOCKED o timeout).
 * Body opcional:
 *   - {} o sin body: lista recientes txs del vault (PRIZE_VAULT_PUBLIC_KEY), busca una que coincida con este prize (memo + montos).
 *   - { "payerPublicKey": "G..." }: lista txs desde esa cuenta (quien pagó).
 *   - { "txHash": "..." }: verifica esa transacción concreta.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ prizeId: string }> }
) {
  const requestId = newRequestId();
  try {
    requireServiceAuth(request);
    const { prizeId } = await params;
    const body = (await request.json().catch(() => ({}))) as { txHash?: string; payerPublicKey?: string };
    const txHash = typeof body.txHash === "string" ? body.txHash.trim() : "";
    const payerPublicKey = typeof body.payerPublicKey === "string" ? body.payerPublicKey.trim() : undefined;

    if (txHash) {
      const result = await verifyPaymentByTxHash(prizeId, txHash);
      return jsonOk(result, 200, requestId);
    }
    const result = await verifyPaymentByPolling(prizeId, payerPublicKey ? { payerPublicKey } : undefined);
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
