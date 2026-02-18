import { NextRequest } from "next/server";
import { requireServiceAuth } from "@/lib/auth";
import { normalizeError } from "@/lib/errors";
import { newRequestId, jsonError } from "@/lib/http";
import {
  getIdempotencyKey,
  hashIdempotencyKey,
  computeRequestHash,
  getIdempotentResponse,
  saveIdempotentResponse,
} from "@/lib/idempotency";
import { acquireLock, releaseLock } from "@/lib/locks";

const STUB_RESPONSE = {
  errorCode: "NOT_IMPLEMENTED",
  message: "Payment intent endpoint is not implemented (stub)",
  details: null,
};

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
        operation: "payment_intent",
        ttlSeconds: 30,
        ownerId: requestId,
      });
    }
    try {
      if (idempotencyKey && keyHash) {
        const requestHash = computeRequestHash(request.method, pathname, bodyText);
        const cached = await getIdempotentResponse({
          keyHash,
          operation: "payment_intent",
          requestHash,
        });
        if (cached) {
          return Response.json(cached.json, { status: cached.status });
        }
      }

      const responseJson = { ...STUB_RESPONSE, requestId };
      const statusCode = 501;

      if (idempotencyKey && keyHash) {
        const requestHash = computeRequestHash(request.method, pathname, bodyText);
        await saveIdempotentResponse({
          keyHash,
          operation: "payment_intent",
          scopeId: prizeId,
          requestHash,
          statusCode,
          responseJson,
        });
      }
      return jsonError(
      { errorCode: STUB_RESPONSE.errorCode, message: STUB_RESPONSE.message, details: STUB_RESPONSE.details },
      statusCode,
      requestId
    );
    } finally {
      if (idempotencyKey && keyHash) {
        await releaseLock({
          scopeId: keyHash,
          operation: "payment_intent",
          ownerId: requestId,
        });
      }
    }
  } catch (err) {
    const apiErr = normalizeError(err);
    return jsonError(
      { errorCode: apiErr.errorCode, message: apiErr.message, details: apiErr.details ?? null },
      apiErr.status,
      requestId
    );
  }
}
