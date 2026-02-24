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
  WATCHER_BATCH_SIZE: z
    .string()
    .optional()
    .default("25")
    .transform((v) => Math.max(1, Math.min(100, parseInt(v, 10) || 25))),
  WATCHER_TX_LOOKBACK_HOURS: z
    .string()
    .optional()
    .default("72")
    .transform((v) => Math.max(1, Math.min(168, parseInt(v, 10) || 72))),
  WATCHER_TX_LIMIT: z
    .string()
    .optional()
    .default("200")
    .transform((v) => Math.max(10, Math.min(200, parseInt(v, 10) || 200))),
  DEPOSIT_POLL_ENABLED: z
    .string()
    .optional()
    .default("true")
    .transform((v) => v === "true" || v === "1"),
  DEPOSIT_POLL_INTERVAL_MS: z
    .string()
    .optional()
    .default("60000")
    .transform((v) => Math.max(10000, Math.min(300000, parseInt(v, 10) || 60000))),
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
    WATCHER_BATCH_SIZE: process.env.WATCHER_BATCH_SIZE,
    WATCHER_TX_LOOKBACK_HOURS: process.env.WATCHER_TX_LOOKBACK_HOURS,
    WATCHER_TX_LIMIT: process.env.WATCHER_TX_LIMIT,
    DEPOSIT_POLL_ENABLED: process.env.DEPOSIT_POLL_ENABLED,
    DEPOSIT_POLL_INTERVAL_MS: process.env.DEPOSIT_POLL_INTERVAL_MS,
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
