import { NextRequest } from "next/server";
import { requireServiceAuth } from "@/lib/auth";
import { normalizeError } from "@/lib/errors";
import { newRequestId, jsonOk, jsonError } from "@/lib/http";
import {
  getIdempotencyKey,
  hashIdempotencyKey,
  computeRequestHash,
  getIdempotentResponse,
  saveIdempotentResponse,
} from "@/lib/idempotency";
import { acquireLock, releaseLock } from "@/lib/locks";
import { distributePrize } from "@/domain/prizes/prizeService";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ prizeId: string }> }
) {
  const requestId = newRequestId();
  try {
    requireServiceAuth(request);
    const { prizeId } = await params;
    const bodyText = await request.text();
    const pathname = new URL(request.url).pathname;
    const idempotencyKey = getIdempotencyKey(request);
    const keyHash = idempotencyKey ? hashIdempotencyKey(idempotencyKey) : null;

    if (idempotencyKey && keyHash) {
      await acquireLock({
        scopeId: keyHash,
        operation: "distribute",
        ttlSeconds: 30,
        ownerId: requestId,
      });
    }
    try {
      if (idempotencyKey && keyHash) {
        const requestHash = computeRequestHash(request.method, pathname, bodyText);
        const cached = await getIdempotentResponse({
          keyHash,
          operation: "distribute",
          requestHash,
        });
        if (cached) {
          return Response.json(cached.json, { status: cached.status });
        }
      }

      const result = await distributePrize(prizeId, requestId);
      const statusCode = 200;

      if (idempotencyKey && keyHash) {
        const requestHash = computeRequestHash(request.method, pathname, bodyText);
        await saveIdempotentResponse({
          keyHash,
          operation: "distribute",
          scopeId: prizeId,
          requestHash,
          statusCode,
          responseJson: result,
        });
      }
      return jsonOk(result, statusCode, requestId);
    } finally {
      if (idempotencyKey && keyHash) {
        await releaseLock({
          scopeId: keyHash,
          operation: "distribute",
          ownerId: requestId,
        });
      }
    }
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
