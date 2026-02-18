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
import { addEntrySchema, listEntriesSchema } from "@/validators/entryValidators";
import { addEntry, listEntries } from "@/domain/entries/entryService";
import { ApiError } from "@/lib/errors";

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
        operation: "add_entries",
        ttlSeconds: 30,
        ownerId: requestId,
      });
    }
    try {
      if (idempotencyKey && keyHash) {
        const requestHash = computeRequestHash(request.method, pathname, bodyText);
        const cached = await getIdempotentResponse({
          keyHash,
          operation: "add_entries",
          requestHash,
        });
        if (cached) {
          return Response.json(cached.json, { status: cached.status });
        }
      }

      const body = bodyText ? JSON.parse(bodyText) : {};
      const parsed = addEntrySchema.safeParse(body);
      if (!parsed.success) {
        throw new ApiError(400, "VALIDATION_ERROR", "Validation failed", {
          issues: parsed.error.flatten().fieldErrors,
        });
      }
      const entry = await addEntry(prizeId, parsed.data);
      const responseData = { entry };
      const statusCode = 201;

      if (idempotencyKey && keyHash) {
        const requestHash = computeRequestHash(request.method, pathname, bodyText);
        await saveIdempotentResponse({
          keyHash,
          operation: "add_entries",
          scopeId: prizeId,
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
          operation: "add_entries",
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ prizeId: string }> }
) {
  const requestId = newRequestId();
  try {
    requireServiceAuth(request);
    const { prizeId } = await params;
    const { searchParams } = new URL(request.url);
    const parsed = listEntriesSchema.safeParse({
      limit: searchParams.get("limit"),
      cursor: searchParams.get("cursor") ?? undefined,
    });
    const opts = parsed.success ? parsed.data : { limit: 20 };
    const result = await listEntries(prizeId, opts);
    return jsonOk(
      { items: result.items, nextCursor: result.nextCursor, hasMore: result.hasMore },
      200,
      requestId
    );
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
