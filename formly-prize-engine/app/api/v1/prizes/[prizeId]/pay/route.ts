import { NextRequest } from "next/server";
import { requireServiceAuth } from "@/lib/auth";
import { normalizeError } from "@/lib/errors";
import { newRequestId, jsonOk, jsonError } from "@/lib/http";
import { payToWallet } from "@/domain/payouts/payoutService";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(
    { errorCode: "METHOD_NOT_ALLOWED", message: "Use POST with body: { destination, amount, asset } (asset: XLM | USDC)" },
    { status: 405 }
  );
}

/**
 * POST /api/v1/prizes/:prizeId/pay
 * Body: { "destination": "G...", "amount": "9.0000000", "asset": "USDC" }
 * Envía desde el prize vault a la wallet indicada. asset debe coincidir con el rewardType del prize.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ prizeId: string }> }
) {
  const requestId = newRequestId();
  try {
    requireServiceAuth(request);
    const { prizeId } = await params;
    const body = await request.json().catch(() => ({})) as { destination?: string; amount?: string; asset?: string };
    const destination = typeof body.destination === "string" ? body.destination.trim() : "";
    const amount = typeof body.amount === "string" ? body.amount.trim() : "";
    const asset = typeof body.asset === "string" ? body.asset.trim() : "";
    if (!destination) {
      return jsonError(
        { errorCode: "VALIDATION_ERROR", message: "destination is required (Stellar G...)", details: null },
        400,
        requestId
      );
    }
    if (!amount) {
      return jsonError(
        { errorCode: "VALIDATION_ERROR", message: "amount is required", details: null },
        400,
        requestId
      );
    }
    if (!asset) {
      return jsonError(
        { errorCode: "VALIDATION_ERROR", message: "asset is required (XLM or USDC)", details: null },
        400,
        requestId
      );
    }
    const result = await payToWallet({ prizeId, destination, amount, asset: asset as "XLM" | "USDC" });
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
