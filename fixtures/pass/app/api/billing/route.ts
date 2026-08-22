import { withApiKey as key } from "@/lib/guards";
import { db } from "@/lib/db";

// Aliased wrappers count: the import is what matters, not the local spelling.
export const DELETE = key(async (session) => {
  await db.invoice.deleteMany({ where: { tenantId: session.tenantId, draft: true } });
  return new Response(null, { status: 204 });
});

export const GET = key(async (session) => {
  const totals = await db.invoice.aggregate({
    where: { tenantId: session.tenantId },
    _sum: { totalCents: true },
  });
  return Response.json(totals);
});
