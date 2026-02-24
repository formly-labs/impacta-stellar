import { z } from "zod";
import { RewardType, DistributionMode } from "@/types/enums";

export const createPrizeSchema = z
  .object({
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
    feePercent: z
      .union([z.number(), z.string()])
      .optional()
      .default(10)
      .transform((v) => Math.max(0, Math.min(100, typeof v === "string" ? parseInt(v, 10) || 10 : v))),
  })
  .refine((data) => (data.prizeAmount ?? data.amount ?? "").length > 0, {
    message: "prizeAmount is required",
    path: ["prizeAmount"],
  })
  .transform((data) => ({
    rewardType: data.rewardType,
    distributionMode: data.distributionMode,
    prizeAmount: data.prizeAmount ?? data.amount ?? "",
    feePercent: data.feePercent ?? 10,
  }));

export type CreatePrizeInput = z.infer<typeof createPrizeSchema>;

export const paymentIntentSchema = z
  .object({
    payerPublicKey: z.string().optional(),
    creatorPublicKey: z.string().optional(),
  })
  .refine(
    (data) => {
      const pk = (data.payerPublicKey ?? data.creatorPublicKey ?? "").trim();
      return pk.startsWith("G") && pk.length === 56;
    },
    { message: "payerPublicKey is required (Stellar public key G..., 56 characters)", path: ["payerPublicKey"] }
  )
  .transform((data) => ({
    payerPublicKey: (data.payerPublicKey ?? data.creatorPublicKey ?? "").trim(),
  }));

export type PaymentIntentInput = z.infer<typeof paymentIntentSchema>;
