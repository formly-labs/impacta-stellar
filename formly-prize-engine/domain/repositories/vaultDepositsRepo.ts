import { supabaseAdmin } from "@/lib/supabaseAdmin";

export interface VaultDepositRow {
  id: string;
  tx_hash: string;
  payer_public_key: string;
  amount_prize_vault: string;
  amount_fee_vault: string;
  amount_total: string;
  asset_type: string;
  asset_code: string | null;
  asset_issuer: string | null;
  memo: string | null;
  memo_type: string | null;
  ledger_at: string;
  recorded_at: string;
}

const COLUMNS =
  "id, tx_hash, payer_public_key, amount_prize_vault, amount_fee_vault, amount_total, asset_type, asset_code, asset_issuer, memo, memo_type, ledger_at, recorded_at";

/**
 * Inserta un depósito. Idempotente por tx_hash (ignora si ya existe).
 */
export async function insertDeposit(data: {
  tx_hash: string;
  payer_public_key: string;
  amount_prize_vault: string;
  amount_fee_vault: string;
  amount_total: string;
  asset_type: string;
  asset_code?: string | null;
  asset_issuer?: string | null;
  memo?: string | null;
  memo_type?: string | null;
  ledger_at: string;
}): Promise<VaultDepositRow | null> {
  const { data: row, error } = await supabaseAdmin
    .from("vault_deposits")
    .upsert(
      {
        ...data,
        asset_code: data.asset_code ?? null,
        asset_issuer: data.asset_issuer ?? null,
        memo: data.memo ?? null,
        memo_type: data.memo_type ?? null,
      },
      { onConflict: "tx_hash", ignoreDuplicates: true }
    )
    .select(COLUMNS)
    .maybeSingle();
  if (error) throw error;
  return row as VaultDepositRow | null;
}

/**
 * Lista depósitos por payer (quién pagó). Orden por ledger_at desc.
 */
export async function findByPayer(payerPublicKey: string, limit = 100): Promise<VaultDepositRow[]> {
  const { data, error } = await supabaseAdmin
    .from("vault_deposits")
    .select(COLUMNS)
    .eq("payer_public_key", payerPublicKey)
    .order("ledger_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as VaultDepositRow[];
}

/**
 * Busca depósitos de un payer cuyo memo coincide con el premio (para "¿pagó este premio?").
 */
export async function findByPayerAndPrizeMemo(
  payerPublicKey: string,
  prizeMemo: string | null,
  prizeMemoType: string | null
): Promise<VaultDepositRow[]> {
  if (prizeMemo == null || prizeMemo === "") return [];
  const prizeType = (prizeMemoType ?? "text").toLowerCase();
  if (prizeType === "text") {
    const { data, error } = await supabaseAdmin
      .from("vault_deposits")
      .select(COLUMNS)
      .eq("payer_public_key", payerPublicKey)
      .eq("memo", prizeMemo.trim())
      .order("ledger_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    return (data ?? []) as VaultDepositRow[];
  }
  const { data, error } = await supabaseAdmin
    .from("vault_deposits")
    .select(COLUMNS)
    .eq("payer_public_key", payerPublicKey)
    .not("memo", "is", null)
    .order("ledger_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  const rows = (data ?? []) as VaultDepositRow[];
  const { memoMatches } = await import("@/lib/memo");
  return rows.filter((r) =>
    memoMatches({
      txMemoType: r.memo_type ?? null,
      txMemo: r.memo ?? null,
      prizeMemoType,
      prizeMemo,
    })
  );
}

export async function existsByTxHash(txHash: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from("vault_deposits")
    .select("id")
    .eq("tx_hash", txHash)
    .maybeSingle();
  if (error) throw error;
  return data != null;
}

/**
 * Devuelve el depósito por tx_hash (para verify-payment con txHash en body).
 */
export async function getByTxHash(txHash: string): Promise<VaultDepositRow | null> {
  const { data, error } = await supabaseAdmin
    .from("vault_deposits")
    .select(COLUMNS)
    .eq("tx_hash", txHash.trim())
    .maybeSingle();
  if (error) throw error;
  return data as VaultDepositRow | null;
}

/**
 * Devuelve el depósito más reciente cuyo memo coincide exactamente con prizeMemo.
 */
export async function findLatestByMemo(prizeMemo: string): Promise<VaultDepositRow | null> {
  const { data, error } = await supabaseAdmin
    .from("vault_deposits")
    .select(COLUMNS)
    .eq("memo", prizeMemo.trim())
    .order("ledger_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as VaultDepositRow | null;
}

/**
 * Devuelve el depósito más reciente cuyo memo contiene el texto (ej: prizeId).
 * Útil cuando el memo guardado es "PRIZE:prize_xxx" y buscamos por "prize_xxx".
 */
export async function findLatestByMemoContains(substring: string): Promise<VaultDepositRow | null> {
  const term = substring.trim();
  if (!term) return null;
  const escaped = term.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
  const { data, error } = await supabaseAdmin
    .from("vault_deposits")
    .select(COLUMNS)
    .ilike("memo", `%${escaped}%`)
    .order("ledger_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as VaultDepositRow | null;
}
