export interface CreatePrizeRequest {
  formId: string;
  creatorId: string;
  rewardType: "XLM" | "USDC" | "POINTS";
  distributionMode: "LOTTERY_SINGLE" | "SPLIT_EQUAL";
  amount: string;
  feeBps?: number;
  closeAt: string;
  drawAt: string;
}

export interface PrizePublic {
  id: string;
  formId: string;
  creatorId: string;
  rewardType: "XLM" | "USDC" | "POINTS";
  distributionMode: "LOTTERY_SINGLE" | "SPLIT_EQUAL";
  amount: string;
  feeBps: number;
  status: string;
  closeAt: string;
  drawAt: string;
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
  id: string;
  prizeId: string;
  walletAddress: string;
  sourceId: string | null;
  createdAt: string;
}

export interface AddEntryResponse {
  entry: EntryPublic;
}

export interface ListEntriesResponse {
  items: EntryPublic[];
  nextCursor: string | null;
}

export interface ErrorResponse {
  errorCode: string;
  message: string;
  details: Record<string, unknown> | null;
  requestId: string;
}
