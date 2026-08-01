// The only module allowed to decide whether demo data is on.
export function demoMode(): boolean {
  if (process.env.NODE_ENV === "production") return false;
  return process.env.DEMO_MODE === "1";
}
