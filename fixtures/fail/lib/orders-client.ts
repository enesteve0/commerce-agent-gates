// Second file that resolves the flag on its own. This is how it spreads.
export const useMocks = process.env.DEMO_MODE === "1";

export function isDemoSession(token: string): boolean {
  return token.startsWith("demo_");
}
