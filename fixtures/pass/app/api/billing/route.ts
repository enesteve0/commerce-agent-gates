import { withApiKey } from "@/lib/guards";
import { db } from "@/lib/db";

export const DELETE = withApiKey(async (session) => {
  await db.invoice.deleteMany({ where: { tenantId: session.tenantId, draft: true } });
  return new Response(null, { status: 204 });
});
