import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { requireUserId } from "@/lib/auth"
import { getAssistantById, updateAssistant, deleteAssistant, getAssistantStatus } from "@/lib/db"
import { isSafeFetchUrl } from "@/lib/safe-url"

const PatchSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  widget_color: z.string().max(20).optional(),
  widget_title: z.string().max(100).optional(),
  widget_placeholder: z.string().max(200).optional(),
  active: z.number().int().min(0).max(1).optional(),
  greeting: z.string().max(1000).optional(),
  context_url: z.string().url().optional().or(z.literal("")),
  quick_replies: z.string().max(2000).optional(),
  rate_limit: z.number().int().min(1).max(1000).optional(),
  // Billing (set by Oleg after manual payment)
  plan: z.enum(["auto", "integration"]).optional(),
  paid_until: z.string().datetime().nullable().optional(),
}).strict()

type RouteParams = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  let ownerId: number
  try {
    ownerId = await requireUserId()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id: idStr } = await params
  const id = Number(idStr)
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 })
  }

  const assistant = getAssistantById(id, ownerId)
  if (!assistant) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const { api_key: _ak, tg_token: _tt, tg_chat_id: _tc, system_prompt: _sp, ...safe } = assistant
  return NextResponse.json({ ...safe, billingStatus: getAssistantStatus(assistant) })
}

export async function PATCH(req: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  let ownerId: number
  try {
    ownerId = await requireUserId()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id: idStr } = await params
  const id = Number(idStr)
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 })
  }

  const existing = getAssistantById(id, ownerId)
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = PatchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  // SSRF guard: reject private IPs / metadata endpoints in context_url
  if (parsed.data.context_url && !isSafeFetchUrl(parsed.data.context_url)) {
    return NextResponse.json({ error: "Недопустимый context_url" }, { status: 400 })
  }

  updateAssistant(id, ownerId, parsed.data)

  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  let ownerId: number
  try {
    ownerId = await requireUserId()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id: idStr } = await params
  const id = Number(idStr)
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 })
  }

  const existing = getAssistantById(id, ownerId)
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  deleteAssistant(id, ownerId)
  return NextResponse.json({ ok: true })
}
