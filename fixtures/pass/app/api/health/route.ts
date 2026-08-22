// Liveness probe: reads a global count, never tenant rows.
import { db } from "@/lib/db";

export const GET = async () =>
  Response.json({ tenants: await db.tenant.count({}) }); // gate-exempt(platform health metric, aggregate only)
