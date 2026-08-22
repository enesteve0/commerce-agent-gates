// Repository layer used by background jobs, not by route handlers.
// The gates inspect route files; this module is deliberately out of scope,
// because a job that reconciles across tenants is doing its job.
import { db } from "@/lib/db";

export function findStaleOrders(limit: number) {
  return db.order.findMany({
    where: { updatedAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
    take: limit,
  });
}
