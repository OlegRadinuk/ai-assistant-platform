// ── Shared domain types ────────────────────────────────────────────────────────

export type User = {
  id: number
  email: string
  password_hash: string
  display_name: string
  created_at: string
  pd_consent_at: string | null
  pd_consent_ip: string | null
  pd_consent_version: string | null
}

export type UserPublic = Omit<User, "password_hash">

/** Assistant is the public alias for a Client row (tenant-facing term). */
export type Assistant = {
  id: number
  owner_id: number
  slug: string
  name: string
  description: string
  role: "admin" | "consultant" | "sales" | "support" | "custom"
  industry: string
  system_prompt: string
  api_key: string
  base_url: string
  model: string
  tg_token: string
  tg_chat_id: string
  widget_color: string
  widget_title: string
  widget_placeholder: string
  rate_limit: number
  active: number
  context_url: string
  quick_replies: string
  greeting: string
  created_at: string
  // Billing / trial fields (added in monetization sprint)
  trial_ends_at: string        // ISO datetime — trial end
  plan: "auto" | "integration" // subscription plan key
  paid_until: string | null    // ISO datetime or null if not paid
}

/** Status of an assistant from the billing perspective */
export type AssistantStatus = {
  state: "trial" | "active" | "expired"
  daysLeft: number | null  // null when expired or paid (no countdown needed)
  trialEndsAt: string
  paidUntil: string | null
  plan: "auto" | "integration"
}

/** Public-safe subset of Assistant (no secrets). */
export type AssistantPublic = Omit<Assistant, "api_key" | "tg_token" | "tg_chat_id" | "system_prompt">

export type Lead = {
  id: number
  client_id: number
  session_id: string
  name: string
  phone: string
  email: string
  message: string
  status: "new" | "working" | "closed"
  source: string
  created_at: string
  pd_consent_at: string | null
  pd_consent_ip: string | null
  pd_consent_version: string | null
}

export type LeadInsert = Omit<Lead, "id" | "created_at" | "status" | "pd_consent_at" | "pd_consent_ip" | "pd_consent_version"> & {
  source?: string
  pd_consent_at?: string
  pd_consent_ip?: string
  pd_consent_version?: string
}

export type Message = {
  id: number
  client_id: number
  session_id: string
  role: "user" | "assistant"
  content: string
  created_at: string
}
