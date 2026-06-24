import { NextRequest, NextResponse } from "next/server"
import { verifySessionToken } from "@/lib/session"

// Auth guard for /dashboard/* pages.
// /api/dashboard/* and /api/assistants/* check auth inside their own handlers.
export const config = {
  matcher: ["/dashboard/:path*"],
}

export default function proxy(request: NextRequest): NextResponse {
  const token = request.cookies.get("aiap_session")?.value
  const session = verifySessionToken(token)

  if (!session) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("from", request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}
