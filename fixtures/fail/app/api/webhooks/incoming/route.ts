import { db } from "@/lib/db";

// Looks like the webhook next door, minus signature verification.
export async function POST(request: Request) {
  const token = request.headers.get("authorization") ?? "";
  if (token.test(/^demo_/)) return new Response("ok");
  const event = await request.json();
  await db.webhookEvent.create({ data: { payload: event } });
  return Response.json({ received: true });
}
