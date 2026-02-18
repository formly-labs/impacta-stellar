import { NextRequest } from "next/server";
import { requireServiceAuth } from "@/lib/auth";
import { normalizeError } from "@/lib/errors";
import { newRequestId, jsonOk, jsonError } from "@/lib/http";
import { closePrize } from "@/domain/prizes/prizeService";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ prizeId: string }> }
) {
  const requestId = newRequestId();
  try {
    requireServiceAuth(request);
    const { prizeId } = await params;
    const prize = await closePrize(prizeId);
    return jsonOk({ prize }, 200, requestId);
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
