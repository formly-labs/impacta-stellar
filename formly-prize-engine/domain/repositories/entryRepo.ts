import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { decodeCursor, encodeCursor } from "@/lib/pagination";

export interface EntryRow {
  id: string;
  external_id: string;
  prize_id: string;
  wallet_address: string;
  source_id: string | null;
  amount: string | null;
  winner: boolean;
  created_at: string;
}

const ENTRY_COLUMNS =
  "id, external_id, prize_id, wallet_address, source_id, amount, winner, created_at";

export interface InsertEntryData {
  external_id: string;
  prize_id: string;
  wallet_address: string;
  source_id: string | null;
}

export async function insertEntry(
  prizeIdUuid: string,
  data: Omit<InsertEntryData, "prize_id">
): Promise<EntryRow> {
  const { data: row, error } = await supabaseAdmin
    .from("prize_entries")
    .insert({ ...data, prize_id: prizeIdUuid })
    .select(ENTRY_COLUMNS)
    .single();
  if (error) throw error;
  return row as EntryRow;
}

export async function listEntries(
  prizeIdUuid: string,
  opts: { limit: number; cursor?: string }
): Promise<{ items: EntryRow[]; nextCursor: string | null }> {
  const limit = Math.min(Math.max(1, opts.limit), 100);
  let query = supabaseAdmin
    .from("prize_entries")
    .select(ENTRY_COLUMNS)
    .eq("prize_id", prizeIdUuid)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit + 1);

  if (opts.cursor) {
    const decoded = decodeCursor(opts.cursor);
    if (decoded) {
      query = query.or(
        `created_at.lt.${decoded.createdAt},and(created_at.eq.${decoded.createdAt},id.lt.${decoded.id})`
      );
    }
  }

  const { data: rows, error } = await query;
  if (error) throw error;

  const items = (rows ?? []).slice(0, limit) as EntryRow[];
  const hasMore = (rows?.length ?? 0) > limit;
  const last = items[items.length - 1];
  const nextCursor =
    hasMore && last
      ? encodeCursor({ createdAt: last.created_at, id: last.id })
      : null;

  return { items, nextCursor };
}

export async function countEntries(prizeIdUuid: string): Promise<number> {
  const { count, error } = await supabaseAdmin
    .from("prize_entries")
    .select("id", { count: "exact", head: true })
    .eq("prize_id", prizeIdUuid);
  if (error) throw error;
  return count ?? 0;
}

export async function updateEntryAmountAndWinner(
  prizeIdUuid: string,
  entryExternalId: string,
  amount: string,
  winner: boolean
): Promise<void> {
  const { error } = await supabaseAdmin
    .from("prize_entries")
    .update({ amount, winner })
    .eq("prize_id", prizeIdUuid)
    .eq("external_id", entryExternalId);
  if (error) throw error;
}
