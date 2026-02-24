/**
 * Next.js instrumentation: arranca el polling de depósitos al vault.
 * Cada DEPOSIT_POLL_INTERVAL_MS consulta Horizon y guarda en vault_deposits;
 * el endpoint verify-payment consulta esa tabla (no Horizon) para responder.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const enabled = process.env.DEPOSIT_POLL_ENABLED;
  if (enabled === "false" || enabled === "0") return;

  const intervalMs = Math.max(
    10000,
    Math.min(300000, parseInt(process.env.DEPOSIT_POLL_INTERVAL_MS ?? "60000", 10) || 60000)
  );

  const run = async () => {
    try {
      const { runVaultDepositRecorder } = await import("@/domain/jobs/vaultDepositRecorder");
      const { env } = await import("@/lib/env");
      if (!env.HORIZON_URL || !env.PRIZE_VAULT_PUBLIC_KEY || !env.FEE_VAULT_PUBLIC_KEY) return;
      await runVaultDepositRecorder();
    } catch (err) {
      console.error("[vault-deposit-poll]", err);
    }
  };

  setTimeout(() => {
    void run();
    setInterval(run, intervalMs);
  }, 2000);
}
