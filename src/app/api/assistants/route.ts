import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { requireUserId } from "@/lib/auth"
import { createAssistant, getAssistantsByOwner, countActiveTrialAssistants, getAssistantStatus } from "@/lib/db"
import { buildSystemPrompt, defaultGreeting } from "@/lib/prompts"
import { generateUniqueSlug } from "@/lib/slug"
import { buildWidgetSnippet } from "@/lib/widget-snippet"
import { MAX_TRIAL_ASSISTANTS, CONTACT } from "@/lib/pricing"
import { isSafeFetchUrl } from "@/lib/safe-url"

const CreateAssistantSchema = z.object({
  name: z.string().min(1, "Название обязательно").max(200),
  role: z.enum(["admin", "consultant", "sales", "support", "custom"]),
  customRoleText: z.string().max(300).optional(),
  industry: z.string().min(1, "Сфера обязательна").max(200),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  telegramConnected: z.boolean().optional(),
})

export async function POST(req: NextRequest): Promise<NextResponse> {
  let ownerId: number
  try {
    ownerId = await requireUserId()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = CreateAssistantSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.issues }, { status: 400 })
  }

  const { name, role, customRoleText, industry, websiteUrl } = parsed.data

  // SSRF guard: reject private IPs / metadata endpoints in websiteUrl
  if (websiteUrl && !isSafeFetchUrl(websiteUrl)) {
    return NextResponse.json({ error: "Недопустимый URL сайта" }, { status: 400 })
  }

  // Abuse guard: max 1 active-trial auto-plan assistant per account
  const activeTrial = countActiveTrialAssistants(ownerId)
  if (activeTrial >= MAX_TRIAL_ASSISTANTS) {
    return NextResponse.json(
      {
        error: `На бесплатном периоде доступен ${MAX_TRIAL_ASSISTANTS} ассистент. ` +
               `Для нескольких — оплатите подписку или свяжитесь: ${CONTACT.telegram} / ${CONTACT.phone}.`,
        code: "TRIAL_LIMIT_REACHED",
      },
      { status: 403 }
    )
  }

  const slug = generateUniqueSlug(name)
  const systemPrompt = buildSystemPrompt({
    role,
    customRoleText,
    industry,
    businessName: name,
    websiteUrl: websiteUrl || undefined,
  })
  const greeting = defaultGreeting(role, industry)

  const assistant = createAssistant({
    owner_id: ownerId,
    slug,
    name,
    description: "",
    role,
    industry,
    system_prompt: systemPrompt,
    api_key: "",
    base_url: "",
    model: "claude-haiku-4-5-20251001",
    tg_token: "",
    tg_chat_id: "",
    widget_color: "#e82020",
    widget_title: name,
    widget_placeholder: "Напишите вопрос…",
    rate_limit: 30,
    active: 1,
    context_url: websiteUrl || "",
    quick_replies: "",
    greeting,
  })

  // Prefer explicit env (production), else derive from the actual request origin
  // so chat URL + widget snippet are correct on any host/port without config.
  const baseUrl = process.env.APP_BASE_URL || req.nextUrl.origin
  const chatUrl = `${baseUrl}/chat/${slug}`
  const widgetSnippet = buildWidgetSnippet(slug, baseUrl)

  return NextResponse.json({
    id: assistant.id,
    slug: assistant.slug,
    name: assistant.name,
    chatUrl,
    widgetSnippet,
  })
}

export async function GET(): Promise<NextResponse> {
  let ownerId: number
  try {
    ownerId = await requireUserId()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const assistants = getAssistantsByOwner(ownerId)

  // Strip sensitive fields and attach billing status
  const safe = assistants.map((a) => {
    const { api_key: _ak, tg_token: _tt, tg_chat_id: _tc, system_prompt: _sp, ...rest } = a
    return { ...rest, billingStatus: getAssistantStatus(a) }
  })

  return NextResponse.json(safe)
}
