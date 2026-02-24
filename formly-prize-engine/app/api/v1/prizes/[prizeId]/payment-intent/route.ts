import { NextRequest } from "next/server";
import { requireServiceAuth } from "@/lib/auth";
import { normalizeError } from "@/lib/errors";
import { newRequestId, jsonOk, jsonError } from "@/lib/http";
import { paymentIntentSchema } from "@/validators/prizeValidators";
import { createPaymentIntent } from "@/domain/intents/paymentIntentService";
import { ApiError } from "@/lib/errors";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ prizeId: string }> }
) {
  const requestId = newRequestId();
  try {
    requireServiceAuth(request);
    const { prizeId } = await params;
    const body = await request.json().catch(() => ({}));
    const parsed = paymentIntentSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, "VALIDATION_ERROR", "Validation failed", {
        issues: parsed.error.flatten().fieldErrors,
      });
    }
    const intent = await createPaymentIntent({
      prizeId,
      payerPublicKey: parsed.data.payerPublicKey,
    });
    return jsonOk(intent, 200, requestId);
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
