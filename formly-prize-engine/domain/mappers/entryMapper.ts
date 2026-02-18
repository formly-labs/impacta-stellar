import type { EntryRow } from "@/domain/repositories/entryRepo";
import type { EntryPublic } from "@/types/dtos";

export function toEntryPublic(row: EntryRow, prizeExternalId: string): EntryPublic {
  return {
    entryId: row.external_id,
    prizeId: prizeExternalId,
    userId: row.wallet_address,
    formResponseId: row.source_id ?? null,
    amount: row.amount != null ? String(row.amount) : null,
    winner: row.winner ?? false,
    createdAt: row.created_at,
  };
}
