export interface CreatePrizeRequest {
  rewardType: "XLM" | "USDC";
  distributionMode: "LOTTERY_SINGLE" | "SPLIT_EQUAL";
  prizeAmount: string;
  /** Fee en porcentaje 0-100 (ej: 10 = 10%). */
  feePercent?: number;
}

export interface PrizePayment {
  destination: string;
  amount: string;
}

export interface PrizePublic {
  prizeId: string;
  status: string;
  rewardType: "XLM" | "USDC";
  distributionMode: "LOTTERY_SINGLE" | "SPLIT_EQUAL";
  prizeAmount: string;
  feePercent: number;
  feeAmount: string;
  prizeNet: string;
  vaultAddress: string | null;
  createdAt: string;
  updatedAt: string;
  /** Cuando el premio ya fue pagado, lista a quién se envió y cuánto. */
  payments?: PrizePayment[];
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
  /** Wallet que pagará (y firmará la XDR). */
  payerPublicKey: string;
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
  feePercent: number;
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
