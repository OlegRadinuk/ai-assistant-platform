import { NextResponse } from "next/server"
import { getCurrentUserId } from "@/lib/auth"
import { getUserById } from "@/lib/db"

export async function GET(): Promise<NextResponse> {
  const userId = await getCurrentUserId()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = getUserById(userId)
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  return NextResponse.json({ id: user.id, email: user.email, displayName: user.display_name })
}
