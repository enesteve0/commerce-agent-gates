import { withSession } from "@/lib/guards";
import { db } from "@/lib/db";

export const GET = withSession(async (session) =>
  Response.json(await db.order.findMany({ where: { tenantId: session.tenantId } })),
);

export const POST = withSession(async (session, request) => {
  const body = await request.json();
  const order = await db.order.update({
    where: { id: body.id, tenantId: session.tenantId },
    data: { status: body.status },
  });
  return Response.json(order);
});
