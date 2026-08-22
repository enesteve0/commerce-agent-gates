import { db } from "@/lib/db";

// Unauthenticated, and it deletes across tenants by bare id.
export const DELETE = async (request: Request) => {
  const { id } = await request.json();
  await db.invoice.deleteMany({ where: { id } });
  return new Response(null, { status: 204 });
};
