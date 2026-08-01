// Exempt: liveness probe, reads no tenant data.
import { db } from "@/lib/db";
export const GET = async () => Response.json({ tenants: await db.tenant.count({}) });
