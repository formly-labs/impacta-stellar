export interface CreatePrizeRequest {
  formId?: string;
  creatorId?: string;
  rewardType: "XLM" | "USDC" | "POINTS";
  distributionMode: "LOTTERY_SINGLE" | "SPLIT_EQUAL";
  prizeAmount: string;
  feeBps?: number;
  closeAt: string;
  drawAt: string;
}

export interface PrizePublic {
  prizeId: string;
  status: string;
  rewardType: "XLM" | "USDC" | "POINTS";
  distributionMode: "LOTTERY_SINGLE" | "SPLIT_EQUAL";
  prizeAmount: string;
  feeBps: number;
  feeAmount: string;
  prizeNet: string;
  vaultAddress: string | null;
  closeAt: string;
  drawAt: string;
  lockRef: string | null;
  payoutRef: string | null;
  ledgerBatchId: string | null;
  lockedAt: string | null;
  distributedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePrizeResponse {
  prize: PrizePublic;
}

export interface AddEntryRequest {
  walletAddress: string;
  sourceId?: string;
}

export interface EntryPublic {
  entryId: string;
  prizeId: string;
  userId: string;
  formResponseId: string | null;
  amount: string | null;
  winner: boolean;
  createdAt: string;
}

export interface AddEntryResponse {
  entry: EntryPublic;
}

export interface ListEntriesResponse {
  items: EntryPublic[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface DistributionResult {
  prizeId: string;
  status: string;
  payoutRef: string | null;
  ledgerBatchId: string | null;
  distributedAt: string | null; // null when not yet distributed
  winners: Array<{
    entryId: string;
    userId: string;
    amount: string;
    winner: boolean;
  }>;
}

export interface ErrorResponse {
  errorCode: string;
  message: string;
  details: Record<string, unknown> | null;
  requestId: string;
}

export interface PaymentIntentRequest {
  creatorPublicKey: string;
}

export interface ExpectedPayment {
  asset: "XLM" | "USDC";
  amount: string;
  destination: string;
  issuer?: string;
}

export interface PaymentIntentResponse {
  paymentIntentId: string;
  prizeId: string;
  rewardType: "XLM" | "USDC";
  amountTotal: string;
  feeBps: number;
  feeAmount: string;
  prizeNet: string;
  memo: string;
  depositTarget: string;
  feeTarget: string;
  unsignedXdr: string;
  networkPassphrase: string;
  expiresAt: string;
  expectedPayments: ExpectedPayment[];
  hash: string;
  horizonUrl?: string;
  minTime?: string;
  maxTime?: string;
}
