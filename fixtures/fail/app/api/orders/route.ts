import { db } from "@/lib/db";

// No guard: anyone can call this.
export async function POST(request: Request) {
  const body = await request.json();
  // tenantId comes from the request body, not the session.
  const order = await db.order.update({
    where: { id: body.id, tenantId: body.tenantId },
    data: { status: body.status },
  });
  return Response.json(order);
}
