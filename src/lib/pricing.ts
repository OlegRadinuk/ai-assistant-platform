// ── Pricing constants — single source of truth ────────────────────────────────
// Change prices here; frontend reads from /api/pricing or imports this directly.

/** Trial duration in days */
export const TRIAL_DAYS = 7

/** Prices in RUB per month */
export const PLAN_PRICES = {
  auto: 3990,        // self-serve auto-bot
  integration: 7000, // done-for-you by Oleg (starting price)
} as const

export type PlanKey = keyof typeof PLAN_PRICES

/** Owner contact for manual payment */
export const CONTACT = {
  telegram: "@aleg_rad",
  phone: "+79785768451",
  note: "Чтобы продолжить — напишите нам:",
} as const

/** Trial-expired message streamed in place of Claude response */
export const TRIAL_EXPIRED_MESSAGE =
  `Пробный период завершён. Чтобы продолжить — оплатите подписку: напишите ${CONTACT.telegram} или позвоните ${CONTACT.phone}.`

/** Maximum active trial assistants per account (on free / trial plan) */
export const MAX_TRIAL_ASSISTANTS = 1

/** Max signup registrations per IP per hour (soft abuse protection) */
export const MAX_SIGNUPS_PER_IP_PER_HOUR = 3
