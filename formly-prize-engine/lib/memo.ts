/**
 * Compares transaction memo with expected prize memo.
 * prizeMemoType "hash": compare normalized to hex (Horizon may return base64).
 * default "text": exact string comparison.
 */
export function memoMatches(params: {
  txMemoType: string | null;
  txMemo: string | null;
  prizeMemoType: string | null;
  prizeMemo: string | null;
}): boolean {
  const { txMemoType, txMemo, prizeMemoType, prizeMemo } = params;
  if (prizeMemo == null || prizeMemo === "") return false;
  if (txMemo == null && txMemoType !== "hash") return false;

  const pType = (prizeMemoType ?? "text").toLowerCase();

  if (pType === "hash") {
    const txHex = txMemoToHex(txMemoType, txMemo);
    const prizeHex = prizeMemo.trim().toLowerCase();
    if (!txHex) return false;
    return txHex === prizeHex || txHex === prizeHex.replace(/^0x/, "");
  }

  return String(txMemo).trim() === String(prizeMemo).trim();
}

function txMemoToHex(txMemoType: string | null, txMemo: string | null): string | null {
  if (txMemo == null || txMemo === "") return null;
  const type = (txMemoType ?? "").toLowerCase();
  if (type === "hash") {
    const raw = txMemo.trim();
    if (/^[0-9a-fA-F]{64}$/.test(raw)) return raw.toLowerCase();
    if (raw.length === 44 && /^[A-Za-z0-9+/=]+$/.test(raw)) {
      try {
        const bin = Buffer.from(raw, "base64");
        return bin.toString("hex").toLowerCase();
      } catch {
        return null;
      }
    }
    return null;
  }
  return null;
}
