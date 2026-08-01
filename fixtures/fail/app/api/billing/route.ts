import { db } from "@/lib/db";

export const DELETE = async (request: Request) => {
  const { id } = await request.json();
  await db.invoice.deleteMany({ where: { id } });
  return new Response(null, { status: 204 });
};
