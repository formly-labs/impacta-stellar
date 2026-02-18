import { ApiError } from "@/lib/errors";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function acquireLock(params: {
  scopeId: string;
  operation: string;
  ttlSeconds: number;
  ownerId: string;
}): Promise<void> {
  const now = new Date();
  const lockedUntil = new Date(now.getTime() + params.ttlSeconds * 1000);

  const { data: existing, error: selectError } = await supabaseAdmin
    .from("operation_locks")
    .select("locked_until, owner_id")
    .eq("scope_id", params.scopeId)
    .eq("operation", params.operation)
    .maybeSingle();

  if (selectError) throw selectError;

  if (existing) {
    if (new Date(existing.locked_until) > now) {
      throw new ApiError(
        409,
        "LOCKED",
        "Resource is locked by another operation",
        { operation: params.operation, scopeId: params.scopeId }
      );
    }
    const { data: updated, error: updateError } = await supabaseAdmin
      .from("operation_locks")
      .update({
        locked_until: lockedUntil.toISOString(),
        owner_id: params.ownerId,
      })
      .eq("scope_id", params.scopeId)
      .eq("operation", params.operation)
      .lte("locked_until", now.toISOString())
      .select("id");

    if (updateError) throw updateError;
    if (!updated?.length) {
      throw new ApiError(
        409,
        "LOCKED",
        "Resource is locked by another operation",
        { operation: params.operation, scopeId: params.scopeId }
      );
    }
    return;
  }

  const { error: insertError } = await supabaseAdmin.from("operation_locks").insert({
    scope_id: params.scopeId,
    operation: params.operation,
    locked_until: lockedUntil.toISOString(),
    owner_id: params.ownerId,
  });

  if (insertError) {
    if (insertError.code === "23505") {
      throw new ApiError(
        409,
        "LOCKED",
        "Resource is locked by another operation",
        { operation: params.operation, scopeId: params.scopeId }
      );
    }
    throw insertError;
  }
}

export async function releaseLock(params: {
  scopeId: string;
  operation: string;
  ownerId: string;
}): Promise<void> {
  await supabaseAdmin
    .from("operation_locks")
    .delete()
    .eq("scope_id", params.scopeId)
    .eq("operation", params.operation)
    .eq("owner_id", params.ownerId);
}
