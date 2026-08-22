import { db } from "@/lib/db";

// No guard, and the tenant id comes from the request body, not the session.
export async function POST(request: Request) {
  const body = await request.json();
  const order = await db.order.update({
    where: { id: body.id, tenantId: body.tenantId },
    data: { status: body.status },
  });
  return Response.json(order);
}
