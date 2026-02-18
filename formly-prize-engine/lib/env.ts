import { z } from "zod";

const envSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SERVICE_TOKEN: z.string().min(1),
});

let cached: z.infer<typeof envSchema> | null = null;

function getEnv(): z.infer<typeof envSchema> {
  if (cached) return cached;
  const parsed = envSchema.safeParse({
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    SERVICE_TOKEN: process.env.SERVICE_TOKEN,
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
