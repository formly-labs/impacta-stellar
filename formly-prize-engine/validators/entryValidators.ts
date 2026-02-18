import { z } from "zod";

export const addEntrySchema = z.object({
  walletAddress: z.string().min(1, "walletAddress is required"),
  sourceId: z.string().optional(),
});

export const listEntriesSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
});

export type AddEntryInput = z.infer<typeof addEntrySchema>;
export type ListEntriesInput = z.infer<typeof listEntriesSchema>;
