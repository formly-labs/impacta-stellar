export const RewardType = ["XLM", "USDC", "POINTS"] as const;
export type RewardType = (typeof RewardType)[number];

export const DistributionMode = ["LOTTERY_SINGLE", "SPLIT_EQUAL"] as const;
export type DistributionMode = (typeof DistributionMode)[number];

export const PrizeStatus = [
  "DRAFT",
  "AWAITING_PAYMENT_CONFIRMATION",
  "LOCKED",
  "COLLECTING",
  "CLOSED",
  "DISTRIBUTING",
  "PAID",
  "FAILED",
  "REFUNDED",
] as const;
export type PrizeStatus = (typeof PrizeStatus)[number];
