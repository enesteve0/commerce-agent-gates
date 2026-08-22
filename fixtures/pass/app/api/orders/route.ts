import { withSession } from "@/lib/guards";
import { db } from "@/lib/db";

export const GET = withSession(async (session) =>
  Response.json(await db.order.findMany({ where: { tenantId: session.tenantId } })),
);

export const POST = withSession(async (session, request) => {
  const body = await request.json();
  const order = await db.order.create({
    data: { externalId: body.externalId, status: "draft", tenantId: session.tenantId },
  });
  return Response.json(order);
});
