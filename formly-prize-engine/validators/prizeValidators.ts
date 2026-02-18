import { z } from "zod";
import { RewardType, DistributionMode } from "@/types/enums";

export const createPrizeSchema = z
  .object({
    formId: z.string().optional(),
    creatorId: z.string().optional(),
    rewardType: z.enum(RewardType),
    distributionMode: z.enum(DistributionMode),
    prizeAmount: z
      .string()
      .optional()
      .refine((v) => !v || (/^\d+(\.\d+)?$/.test(v) && Number(v) > 0), "prizeAmount must be a positive decimal"),
    amount: z
      .string()
      .optional()
      .refine((v) => !v || (/^\d+(\.\d+)?$/.test(v) && Number(v) > 0), "amount must be a positive decimal"),
    feeBps: z.number().int().min(0).max(10000).optional(),
    closeAt: z.string().datetime({ message: "closeAt must be ISO8601" }),
    drawAt: z.string().datetime({ message: "drawAt must be ISO8601" }),
  })
  .refine((data) => new Date(data.drawAt) >= new Date(data.closeAt), {
    message: "drawAt must be >= closeAt",
    path: ["drawAt"],
  })
  .refine((data) => (data.prizeAmount ?? data.amount ?? "").length > 0, {
    message: "prizeAmount or amount is required",
    path: ["prizeAmount"],
  })
  .transform((data) => ({
    ...data,
    amount: data.prizeAmount ?? data.amount ?? "",
  }));

export type CreatePrizeInput = z.infer<typeof createPrizeSchema>;

export const paymentIntentSchema = z.object({
  creatorPublicKey: z
    .string()
    .min(1, "creatorPublicKey is required")
    .refine((v) => v.startsWith("G"), "creatorPublicKey must be a Stellar public key (G...)")
    .refine((v) => v.length === 56, "creatorPublicKey must be 56 characters"),
});

export type PaymentIntentInput = z.infer<typeof paymentIntentSchema>;
