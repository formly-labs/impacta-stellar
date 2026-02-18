import { supabaseAdmin } from "@/lib/supabaseAdmin";

export interface PaymentIntentRow {
  id: string;
  external_id: string;
  prize_id: string;
  unsigned_xdr: string;
  network_passphrase: string | null;
  expires_at: string;
  memo: string | null;
  intent_hash: string | null;
  created_at: string;
}

const COLUMNS =
  "id, external_id, prize_id, unsigned_xdr, network_passphrase, expires_at, memo, intent_hash, created_at";

export async function findPaymentIntentByPrizeExternalId(
  prizeExternalId: string
): Promise<PaymentIntentRow | null> {
  const { data: prize } = await supabaseAdmin
    .from("prizes")
    .select("id")
    .eq("external_id", prizeExternalId)
    .maybeSingle();
  if (!prize) return null;

  const { data, error } = await supabaseAdmin
    .from("prize_payment_intents")
    .select(COLUMNS)
    .eq("prize_id", prize.id)
    .maybeSingle();
  if (error) throw error;
  return data as PaymentIntentRow | null;
}

export async function upsertPaymentIntent(params: {
  prizeId: string;
  externalId: string;
  unsignedXdr: string;
  networkPassphrase: string;
  expiresAt: string;
  memo: string;
  intentHash: string;
}): Promise<PaymentIntentRow> {
  const { data: prize, error: prizeErr } = await supabaseAdmin
    .from("prizes")
    .select("id")
    .eq("external_id", params.prizeId)
    .maybeSingle();

  if (prizeErr || !prize) throw new Error("Prize not found");

  const row = {
    external_id: params.externalId,
    prize_id: prize.id,
    unsigned_xdr: params.unsignedXdr,
    network_passphrase: params.networkPassphrase,
    expires_at: params.expiresAt,
    memo: params.memo,
    intent_hash: params.intentHash,
  };

  const { data, error } = await supabaseAdmin
    .from("prize_payment_intents")
    .upsert(row, {
      onConflict: "prize_id",
      ignoreDuplicates: false,
    })
    .select(COLUMNS)
    .single();

  if (error) throw error;
  return data as PaymentIntentRow;
}
