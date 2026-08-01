// Agent wrote this: reads the flag, never refuses in production.
export function demoMode(): boolean {
  return process.env.DEMO_MODE === "1";
}
