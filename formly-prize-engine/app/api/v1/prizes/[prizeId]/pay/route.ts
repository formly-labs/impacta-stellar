import { NextRequest } from "next/server";
import { requireServiceAuth } from "@/lib/auth";
import { normalizeError } from "@/lib/errors";
import { newRequestId, jsonOk, jsonError } from "@/lib/http";
import { payToDestinations } from "@/domain/payouts/payoutService";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(
    { errorCode: "METHOD_NOT_ALLOWED", message: "Use POST with body: { destinations: [\"G...\", ...] }" },
    { status: 405 }
  );
}

/**
 * POST /api/v1/prizes/:prizeId/pay
 * Body: { "destinations": ["G..."] } o ["G...", "G..."] para SPLIT_EQUAL.
 * Montos y asset se obtienen del prize (prize_net, reward_type, distribution_mode).
 * LOTTERY_SINGLE: todo a la primera wallet. SPLIT_EQUAL: reparto igual entre todas.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ prizeId: string }> }
) {
  const requestId = newRequestId();
  try {
    requireServiceAuth(request);
    const { prizeId } = await params;
    const body = await request.json().catch(() => ({})) as { destinations?: unknown };
    const raw = body.destinations;
    const destinations = Array.isArray(raw)
      ? (raw as string[]).filter((d) => typeof d === "string")
      : [];
    if (destinations.length === 0) {
      return jsonError(
        { errorCode: "VALIDATION_ERROR", message: "destinations is required (non-empty array of Stellar G...)", details: null },
        400,
        requestId
      );
    }
    const result = await payToDestinations({ prizeId, destinations });
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
