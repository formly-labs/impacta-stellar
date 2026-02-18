import { z } from "zod";

const envSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SERVICE_TOKEN: z.string().min(1),
  STELLAR_NETWORK_PASSPHRASE: z.string().optional(),
  HORIZON_URL: z.union([z.string().url(), z.literal("")]).optional().default(""),
  USDC_ASSET_CODE: z.string().optional().default("USDC"),
  USDC_ISSUER: z.string().optional(),
  PRIZE_VAULT_PUBLIC_KEY: z.string().optional(),
  FEE_VAULT_PUBLIC_KEY: z.string().optional(),
  PRIZE_VAULT_SECRET_KEY: z.string().optional(),
  INTENT_TTL_SECONDS: z
    .string()
    .optional()
    .default("900")
    .transform((v) => {
      const n = parseInt(v, 10);
      return isNaN(n) ? 900 : Math.min(86400, Math.max(60, n));
    }),
});

let cached: z.infer<typeof envSchema> | null = null;

function getEnv(): z.infer<typeof envSchema> {
  if (cached) return cached;
  const parsed = envSchema.safeParse({
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    SERVICE_TOKEN: process.env.SERVICE_TOKEN,
    STELLAR_NETWORK_PASSPHRASE: process.env.STELLAR_NETWORK_PASSPHRASE,
    HORIZON_URL: process.env.HORIZON_URL ?? "",
    USDC_ASSET_CODE: process.env.USDC_ASSET_CODE,
    USDC_ISSUER: process.env.USDC_ISSUER,
    PRIZE_VAULT_PUBLIC_KEY: process.env.PRIZE_VAULT_PUBLIC_KEY,
    FEE_VAULT_PUBLIC_KEY: process.env.FEE_VAULT_PUBLIC_KEY,
    PRIZE_VAULT_SECRET_KEY: process.env.PRIZE_VAULT_SECRET_KEY,
    INTENT_TTL_SECONDS: process.env.INTENT_TTL_SECONDS,
  });
  if (!parsed.success) {
    throw new Error(
      `Invalid env: ${JSON.stringify(parsed.error.flatten().fieldErrors)}`
    );
  }
  cached = parsed.data;
  return cached;
}

export const env = new Proxy({} as z.infer<typeof envSchema>, {
  get(_, prop) {
    return getEnv()[prop as keyof z.infer<typeof envSchema>];
  },
});
