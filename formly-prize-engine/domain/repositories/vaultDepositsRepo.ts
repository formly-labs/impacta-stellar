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
 * Inserts a deposit. Idempotent by tx_hash (skips if already exists).
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
 * Lists deposits by payer (who paid). Ordered by ledger_at desc.
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
 * Finds deposits from a payer whose memo matches the prize ("did they pay for this prize?").
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
 * Returns the deposit by tx_hash (for verify-payment with txHash in body).
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
 * Returns the latest deposit whose memo matches prizeMemo exactly.
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
 * Returns the latest deposit whose memo contains the given text (e.g. prizeId).
 * Useful when stored memo is "PRIZE:prize_xxx" and we search by "prize_xxx".
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
