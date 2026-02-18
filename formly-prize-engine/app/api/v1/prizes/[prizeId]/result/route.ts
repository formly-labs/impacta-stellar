import { NextRequest } from "next/server";
import { requireServiceAuth } from "@/lib/auth";
import { normalizeError } from "@/lib/errors";
import { newRequestId, jsonError } from "@/lib/http";

export async function GET(
  request: NextRequest,
  _context: { params: Promise<{ prizeId: string }> }
) {
  const requestId = newRequestId();
  try {
    requireServiceAuth(request);
  } catch (err) {
    const apiErr = normalizeError(err);
    return jsonError(
      { errorCode: apiErr.errorCode, message: apiErr.message, details: apiErr.details ?? null },
      apiErr.status,
      requestId
    );
  }
  return jsonError(
    {
      errorCode: "NOT_IMPLEMENTED",
      message: "Result endpoint is not implemented (stub)",
      details: null,
    },
    501,
    requestId
  );
}
