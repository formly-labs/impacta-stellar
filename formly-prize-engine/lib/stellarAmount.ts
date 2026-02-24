const SCALE = 1e7;

/**
 * Normaliza un monto a string con 7 decimales (Stellar). Sin float; usa BigInt escalado 1e7.
 */
export function normalize7(amountStr: string): string {
  const s = String(amountStr).trim();
  if (!/^\d+(\.\d+)?$/.test(s)) {
    return "0.0000000";
  }
  const [whole = "0", frac = ""] = s.split(".");
  const paddedFrac = frac.padEnd(7, "0").slice(0, 7);
  const scaled = BigInt(whole + paddedFrac);
  const w = (scaled / BigInt(SCALE)).toString();
  const f = (scaled % BigInt(SCALE)).toString().padStart(7, "0");
  return `${w}.${f}`;
}
