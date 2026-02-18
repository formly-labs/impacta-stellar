/**
 * Representación de assets Stellar en DTOs.
 */

export type StellarAssetNative = {
  type: "native";
};

export type StellarAssetCredit = {
  type: "credit_alphanum4";
  code: string;
  issuer: string;
};

export type StellarAsset = StellarAssetNative | StellarAssetCredit;

export function assetToDto(
  asset: "XLM" | "USDC",
  issuer?: string
): StellarAssetNative | StellarAssetCredit {
  if (asset === "XLM") {
    return { type: "native" };
  }
  return {
    type: "credit_alphanum4",
    code: "USDC",
    issuer: issuer ?? "",
  };
}
