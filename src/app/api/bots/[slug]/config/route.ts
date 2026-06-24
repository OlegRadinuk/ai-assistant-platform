import { NextRequest, NextResponse } from "next/server"
import { getClientBySlug } from "@/lib/db"

const corsHeaders = (origin: string) => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
})

// Public widget config endpoint — returns only safe display fields
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<Response> {
  const { slug } = await params
  const origin = request.headers.get("origin") ?? "*"

  const client = getClientBySlug(slug)
  if (!client || !client.active) {
    return NextResponse.json({ error: "Bot not found" }, { status: 404, headers: corsHeaders(origin) })
  }

  let quickReplies: Array<{ label: string; action?: string }> = []
  if (client.quick_replies) {
    try {
      quickReplies = JSON.parse(client.quick_replies)
    } catch {
      // Fallback: treat as newline-separated strings
      quickReplies = client.quick_replies
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((label) => ({ label }))
    }
  }

  return NextResponse.json(
    {
      color: client.widget_color,
      title: client.widget_title,
      placeholder: client.widget_placeholder,
      greeting: client.greeting,
      quick_replies: quickReplies,
    },
    { headers: corsHeaders(origin) }
  )
}

export async function OPTIONS(request: NextRequest): Promise<Response> {
  const origin = request.headers.get("origin") ?? "*"
  return new Response(null, { status: 204, headers: corsHeaders(origin) })
}
