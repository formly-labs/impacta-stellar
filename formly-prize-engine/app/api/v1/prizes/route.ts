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
import { createPrizeSchema } from "@/validators/prizeValidators";
import { createPrize } from "@/domain/prizes/prizeService";
import { ApiError } from "@/lib/errors";

export async function POST(request: NextRequest) {
  const requestId = newRequestId();
  try {
    requireServiceAuth(request);
    const bodyText = await request.text();
    const pathname = new URL(request.url).pathname;
    const idempotencyKey = getIdempotencyKey(request);
    const keyHash = idempotencyKey ? hashIdempotencyKey(idempotencyKey) : null;

    if (idempotencyKey && keyHash) {
      await acquireLock({
        scopeId: keyHash,
        operation: "create_prize",
        ttlSeconds: 30,
        ownerId: requestId,
      });
    }
    try {
      if (idempotencyKey && keyHash) {
        const requestHash = computeRequestHash(request.method, pathname, bodyText);
        const cached = await getIdempotentResponse({
          keyHash,
          operation: "create_prize",
          requestHash,
        });
        if (cached) {
          return Response.json(cached.json, { status: cached.status });
        }
      }

      const body = bodyText ? JSON.parse(bodyText) : {};
      const parsed = createPrizeSchema.safeParse(body);
      if (!parsed.success) {
        throw new ApiError(400, "VALIDATION_ERROR", "Validation failed", {
          issues: parsed.error.flatten().fieldErrors,
        });
      }
      const prize = await createPrize(parsed.data, requestId);
      const responseData = { prize };
      const statusCode = 201;

      if (idempotencyKey && keyHash) {
        const requestHash = computeRequestHash(request.method, pathname, bodyText);
        await saveIdempotentResponse({
          keyHash,
          operation: "create_prize",
          scopeId: null,
          requestHash,
          statusCode,
          responseJson: responseData,
        });
      }
      return jsonOk(responseData, statusCode, requestId);
    } finally {
      if (idempotencyKey && keyHash) {
        await releaseLock({
          scopeId: keyHash,
          operation: "create_prize",
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
