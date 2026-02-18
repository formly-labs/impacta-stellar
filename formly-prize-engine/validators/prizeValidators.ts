import { z } from "zod";
import { RewardType, DistributionMode } from "@/types/enums";

export const createPrizeSchema = z
  .object({
    formId: z.string().min(1, "formId is required"),
    creatorId: z.string().min(1, "creatorId is required"),
    rewardType: z.enum(RewardType),
    distributionMode: z.enum(DistributionMode),
    amount: z
      .string()
      .min(1, "amount is required")
      .refine((v) => /^\d+(\.\d+)?$/.test(v) && Number(v) > 0, "amount must be a positive decimal"),
    feeBps: z.number().int().min(0).max(2000).optional(),
    closeAt: z.string().datetime({ message: "closeAt must be ISO8601" }),
    drawAt: z.string().datetime({ message: "drawAt must be ISO8601" }),
  })
  .refine((data) => new Date(data.drawAt) > new Date(data.closeAt), {
    message: "drawAt must be after closeAt",
    path: ["drawAt"],
  });

export type CreatePrizeInput = z.infer<typeof createPrizeSchema>;
