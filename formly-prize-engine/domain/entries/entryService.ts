import { ApiError } from "@/lib/errors";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { AddEntryInput, ListEntriesInput } from "@/validators/entryValidators";
import type { EntryPublic } from "@/types/dtos";

function toExternalId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
}

function rowToEntryPublic(row: {
  id: string;
  external_id: string;
  prize_id: string;
  wallet_address: string;
  source_id: string | null;
  created_at: string;
}): EntryPublic {
  return {
    id: row.external_id,
    prizeId: row.prize_id,
    walletAddress: row.wallet_address,
    sourceId: row.source_id,
    createdAt: row.created_at,
  };
}

export async function addEntry(
  prizeId: string,
  input: AddEntryInput
): Promise<EntryPublic> {
  const prizeByExternal = await supabaseAdmin
    .from("prizes")
    .select("id")
    .eq("external_id", prizeId)
    .maybeSingle();

  if (!prizeByExternal.data?.id) {
    throw new ApiError(404, "NOT_FOUND", "Prize not found", null);
  }

  const prizeUuid = prizeByExternal.data.id;

  const { data, error } = await supabaseAdmin
    .from("prize_entries")
    .insert({
      external_id: toExternalId("ent"),
      prize_id: prizeUuid,
      wallet_address: input.walletAddress,
      source_id: input.sourceId ?? null,
    })
    .select("id, external_id, prize_id, wallet_address, source_id, created_at")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new ApiError(
        409,
        "ENTRY_ALREADY_EXISTS",
        "An entry for this wallet already exists for this prize",
        { prizeId, walletAddress: input.walletAddress }
      );
    }
    throw error;
  }

  return rowToEntryPublic({ ...data, prize_id: prizeId });
}

export async function listEntries(
  prizeId: string,
  opts: ListEntriesInput
): Promise<{ items: EntryPublic[]; nextCursor: string | null }> {
  const prizeByExternal = await supabaseAdmin
    .from("prizes")
    .select("id")
    .eq("external_id", prizeId)
    .maybeSingle();

  if (!prizeByExternal.data?.id) {
    throw new ApiError(404, "NOT_FOUND", "Prize not found", null);
  }

  const prizeUuid = prizeByExternal.data.id;
  const limit = opts.limit ?? 50;

  let query = supabaseAdmin
    .from("prize_entries")
    .select("id, external_id, prize_id, wallet_address, source_id, created_at", {
      count: "exact",
    })
    .eq("prize_id", prizeUuid)
    .order("created_at", { ascending: true })
    .limit(limit + 1);

  if (opts.cursor) {
    const decoded = Buffer.from(opts.cursor, "base64url").toString("utf8");
    const [createdAt] = decoded.split("|");
    if (createdAt) {
      query = query.gt("created_at", createdAt);
    }
  }

  const { data: rows, error } = await query;

  if (error) throw error;

  const items = (rows ?? []).slice(0, limit).map((row) =>
    rowToEntryPublic({ ...row, prize_id: prizeId })
  );

  const hasMore = (rows?.length ?? 0) > limit;
  const last = items[items.length - 1];
  const nextCursor = hasMore && last
    ? Buffer.from(`${last.createdAt}|${last.id}`, "utf8").toString("base64url")
    : null;

  return { items, nextCursor };
}
