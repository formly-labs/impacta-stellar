import { NextRequest } from "next/server";
import { requireServiceAuth } from "@/lib/auth";
import { normalizeError } from "@/lib/errors";
import { newRequestId, jsonOk, jsonError } from "@/lib/http";
import { createPrizeSchema } from "@/validators/prizeValidators";
import { createPrize } from "@/domain/prizes/prizeService";
import { ApiError } from "@/lib/errors";

export async function POST(request: NextRequest) {
  const requestId = newRequestId();
  try {
    requireServiceAuth(request);
    const body = await request.json().catch(() => ({}));
    const parsed = createPrizeSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, "VALIDATION_ERROR", "Validation failed", {
        issues: parsed.error.flatten().fieldErrors,
      });
    }
    const prize = await createPrize(parsed.data, requestId);
    return jsonOk({ prize }, 201, requestId);
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
