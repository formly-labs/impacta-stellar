import { createHash } from "crypto";
import { ApiError } from "@/lib/errors";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const IDEMPOTENCY_TTL_HOURS = 24;

export type IdempotencyOperation =
  | "create_prize"
  | "payment_intent"
  | "add_entries"
  | "lock"
  | "close"
  | "cancel"
  | "distribute"
  | "tick";

export function getIdempotencyKey(request: Request): string | null {
  const key = request.headers.get("Idempotency-Key")?.trim();
  return key && key.length > 0 ? key : null;
}

export function computeRequestHash(
  method: string,
  path: string,
  bodyJson: string
): string {
  const data = `${method}\n${path}\n${bodyJson}`;
  return createHash("sha256").update(data).digest("hex");
}

export function hashIdempotencyKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

export interface IdempotentResponse {
  status: number;
  json: unknown;
}

export async function getIdempotentResponse(params: {
  keyHash: string;
  operation: IdempotencyOperation;
  requestHash: string;
}): Promise<IdempotentResponse | null> {
  const { data, error } = await supabaseAdmin
    .from("idempotency_keys")
    .select("request_hash, response_status, response_body, expires_at")
    .eq("key_hash", params.keyHash)
    .eq("operation", params.operation)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  if (new Date(data.expires_at) < new Date()) return null;

  if (data.request_hash !== params.requestHash) {
    throw new ApiError(
      409,
      "IDEMPOTENCY_KEY_REUSED",
      "Idempotency-Key was already used with a different request body",
      { operation: params.operation }
    );
  }

  return {
    status: data.response_status as number,
    json: data.response_body as unknown,
  };
}

export async function saveIdempotentResponse(params: {
  keyHash: string;
  operation: IdempotencyOperation;
  scopeId: string | null;
  requestHash: string;
  statusCode: number;
  responseJson: unknown;
}): Promise<void> {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + IDEMPOTENCY_TTL_HOURS);

  const { error } = await supabaseAdmin.from("idempotency_keys").upsert(
    {
      key_hash: params.keyHash,
      operation: params.operation,
      resource_id: params.scopeId,
      request_hash: params.requestHash,
      response_status: params.statusCode,
      response_body: params.responseJson as Record<string, unknown>,
      expires_at: expiresAt.toISOString(),
    },
    {
      onConflict: "key_hash,operation",
    }
  );

  if (error) throw error;
}
