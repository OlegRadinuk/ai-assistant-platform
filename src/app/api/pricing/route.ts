/**
 * GET /api/pricing
 *
 * Public endpoint — returns pricing constants and contact info.
 * Frontend uses this to display trial status, prices, and "contact us" info.
 * No auth required.
 */

import { NextResponse } from "next/server"
import { TRIAL_DAYS, PLAN_PRICES, CONTACT } from "@/lib/pricing"

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    trialDays: TRIAL_DAYS,
    plans: {
      auto: {
        label: "Self-serve",
        price: PLAN_PRICES.auto,
        currency: "RUB",
        period: "month",
        description: "Автономный AI-ассистент, виджет на сайт, лиды в кабинет",
      },
      integration: {
        label: "Под ключ",
        price: PLAN_PRICES.integration,
        currency: "RUB",
        period: "month",
        description: "Интеграция с МИС/CRM, настройка Олегом, белый лейбл",
        from: true, // price is "from X"
      },
    },
    contact: CONTACT,
  })
}
