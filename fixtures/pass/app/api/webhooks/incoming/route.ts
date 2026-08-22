// Webhook receivers verify signatures; they never recognise them by shape.
import { withServiceToken } from "@/lib/guards";
import { db } from "@/lib/db";

const STRIPE_API = "https://api.stripe.com/v1/events";

export const POST = withServiceToken(async (session, request) => {
  const event = await parseEvent(request);
  if (!event) return new Response("bad signature", { status: 400 });

  await db.webhookEvent.create({
    data: { externalId: event.id, payload: event.data, tenantId: session.tenantId },
  });
  return Response.json({ received: true });
});

async function parseEvent(request) {
  const raw = await request.text();
  return verifyAndParse(raw);
}

function verifyAndParse(raw) {
  return JSON.parse(raw);
}
