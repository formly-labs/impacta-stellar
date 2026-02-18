import { NextRequest } from "next/server";
import { requireServiceAuth } from "@/lib/auth";
import { normalizeError } from "@/lib/errors";
import { newRequestId, jsonOk, jsonError, parseJson } from "@/lib/http";
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
    const body = await parseJson<unknown>(request);
    const parsed = addEntrySchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, "VALIDATION_ERROR", "Validation failed", {
        issues: parsed.error.flatten().fieldErrors,
      });
    }
    const entry = await addEntry(prizeId, parsed.data);
    return jsonOk({ entry }, 201, requestId);
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
    const opts = parsed.success ? parsed.data : { limit: 50 };
    const result = await listEntries(prizeId, opts);
    return jsonOk(
      { items: result.items, nextCursor: result.nextCursor },
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
