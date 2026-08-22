import { NextResponse, type NextRequest } from "next/server";
import { currentSession } from "@/lib/session";

export async function middleware(request: NextRequest) {
  const session = await currentSession();
  if (!session) return NextResponse.redirect(new URL("/login", request.url));
  return NextResponse.next();
}
