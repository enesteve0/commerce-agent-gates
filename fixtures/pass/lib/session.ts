import { headers } from "next/headers";

export async function currentSession() {
  const cookieHeader = headers().get("cookie") ?? "";
  return parseCookie(cookieHeader);
}

function parseCookie(cookie: string): { tenantId: string } | null {
  return null;
}
