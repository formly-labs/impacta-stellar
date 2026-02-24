/** Coincide con el ENUM reward_type en schema (POINTS reservado para futuro). */
export const RewardType = ["XLM", "USDC", "POINTS"] as const;
export type RewardType = (typeof RewardType)[number];

export const DistributionMode = ["LOTTERY_SINGLE", "SPLIT_EQUAL"] as const;
export type DistributionMode = (typeof DistributionMode)[number];

/** Debe coincidir con el ENUM prize_status en supabase/schema.sql */
export const PrizeStatus = [
  "PENDING",
  "AWAITING_PAYMENT_CONFIRMATION",
  "LOCKED",
  "CLOSED",
  "DISTRIBUTED",
  "FAILED",
  "EXPIRED",
  "CANCELLED",
  "DISTRIBUTING",
] as const;
export type PrizeStatus = (typeof PrizeStatus)[number];
