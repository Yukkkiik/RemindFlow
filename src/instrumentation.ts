export async function register() {
  // Fail fast at server start instead of on the first login
  const { getJwtSecret } = await import("@/lib/session");
  getJwtSecret();
}
