// Second module resolving the flag on its own — this is how it spreads.
export const useMocks = process.env["DEMO_MODE"] === "1";

export function isDemoSession(token: string): boolean {
  return isDemoEnabled(token);
}

function isDemoEnabled(token: string): boolean {
  const { DEMO_MODE } = process.env;
  return Boolean(DEMO_MODE) && token.includes("sandbox_");
}
