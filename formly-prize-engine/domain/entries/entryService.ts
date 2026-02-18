import { ApiError } from "@/lib/errors";
import * as prizeRepo from "@/domain/repositories/prizeRepo";
import * as entryRepo from "@/domain/repositories/entryRepo";
import { toEntryPublic } from "@/domain/mappers/entryMapper";
import type { AddEntryInput, ListEntriesInput } from "@/validators/entryValidators";
import type { EntryPublic } from "@/types/dtos";

function toExternalId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
}

const ALLOWED_ENTRY_STATUSES = ["PENDING", "LOCKED"];

export async function addEntry(
  prizeId: string,
  input: AddEntryInput
): Promise<EntryPublic> {
  const prize = await prizeRepo.findPrizeById(prizeId);
  if (!prize) {
    throw new ApiError(404, "NOT_FOUND", "Prize not found", null);
  }
  if (!ALLOWED_ENTRY_STATUSES.includes(prize.status)) {
    throw new ApiError(
      409,
      "PRIZE_NOT_COLLECTING",
      "Entries only accepted when prize status is PENDING or LOCKED",
      { currentStatus: prize.status }
    );
  }

  try {
    const row = await entryRepo.insertEntry(prize.id, {
      external_id: toExternalId("ent"),
      wallet_address: input.walletAddress,
      source_id: input.sourceId ?? null,
    });
    return toEntryPublic(row, prizeId);
  } catch (err: unknown) {
    const e = err as { code?: string };
    if (e.code === "23505") {
      throw new ApiError(
        409,
        "ENTRY_ALREADY_EXISTS",
        "An entry for this wallet already exists for this prize",
        { prizeId, walletAddress: input.walletAddress }
      );
    }
    throw err;
  }
}

export async function listEntries(
  prizeId: string,
  opts: ListEntriesInput
): Promise<{ items: EntryPublic[]; nextCursor: string | null; hasMore: boolean }> {
  const prize = await prizeRepo.findPrizeById(prizeId);
  if (!prize) {
    throw new ApiError(404, "NOT_FOUND", "Prize not found", null);
  }

  const limit = opts.limit ?? 20;
  const { items: rows, nextCursor } = await entryRepo.listEntries(prize.id, {
    limit,
    cursor: opts.cursor,
  });

  const items = rows.map((row) => toEntryPublic(row, prizeId));
  return {
    items,
    nextCursor,
    hasMore: nextCursor != null,
  };
}
