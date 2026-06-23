/**
 * Booking Transport — абстракция онлайн-записи на приём.
 *
 * Идея: фронтенд и AI-бот всегда обращаются ТОЛЬКО к нашему бэкенду
 * (`/api/booking/*`). А куда реально уходит запись — в локальную БД,
 * в МедФлекс или в 1С:БИТ УМЦ — инкапсулировано в реализации транспорта.
 *
 * Это позволяет запустить бронирование сразу (LocalTransport), а к
 * real-time-записи в МИС прийти эволюционно, не трогая UI и бота:
 * меняется только переменная окружения BOOKING_TRANSPORT.
 *
 * (Иллюстративный фрагмент из приватной платформы; очищен от клиентских данных.)
 */

// ── Контракт ─────────────────────────────────────────────────────────────────

export interface SlotQuery {
  doctorId: number
  date: string // YYYY-MM-DD
}

export interface BookingInput {
  doctorId: number
  service: string
  date: string // YYYY-MM-DD
  time: string // HH:MM
  durationMin: number
  name: string
  phone: string
  comment?: string
}

export interface BookingResult {
  success: boolean
  appointmentId?: number
  error?: string
}

/** Единый интерфейс для любого backend записи. */
export interface BookingTransport {
  getSlots(q: SlotQuery): Promise<string[]>
  createBooking(b: BookingInput): Promise<BookingResult>
}

// ── Утилита: нормализация телефона к 7XXXXXXXXXX ─────────────────────────────

export function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "")
  if (digits.length === 11 && (digits.startsWith("7") || digits.startsWith("8"))) {
    return "7" + digits.slice(1)
  }
  if (digits.length === 10) return "7" + digits
  return null
}

// ── Пример реализации: внешняя МИС (МедФлекс) ────────────────────────────────

/**
 * Транспорт к МедФлексу. При отсутствии конфигурации безопасно
 * откатывается на локальную запись (graceful fallback) — платформа
 * остаётся работоспособной, пока интеграция не настроена.
 */
export class MedflexTransport implements BookingTransport {
  private readonly token: string
  private readonly baseUrl: string
  private readonly fallback: BookingTransport

  constructor(fallback: BookingTransport) {
    this.token = process.env.MEDFLEX_API_KEY ?? ""
    this.baseUrl = process.env.MEDFLEX_BASE_URL ?? ""
    this.fallback = fallback
  }

  async getSlots(q: SlotQuery): Promise<string[]> {
    if (!this.token) return this.fallback.getSlots(q)
    const res = await fetch(`${this.baseUrl}/schedule/`, {
      headers: { Authorization: `Token ${this.token}` }, // МедФлекс: схема "Token", не "Bearer"
    })
    if (!res.ok) return this.fallback.getSlots(q)
    return parseFreeSlots(await res.json(), q.date)
  }

  async createBooking(b: BookingInput): Promise<BookingResult> {
    if (!this.token) return this.fallback.createBooking(b)
    const phone = normalizePhone(b.phone)
    if (!phone) return { success: false, error: "Некорректный телефон" }

    const res = await fetch(`${this.baseUrl}/direct_appointment/doctor/execute/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${this.token}`,
      },
      body: JSON.stringify({
        doctor: { id: b.doctorId, lpu_id: lpuFor(b.doctorId), speciality_id: specialityFor(b.doctorId) },
        appointment: { dt_start: `${b.date}T${b.time}:00`, dt_end: endTime(b), price: 0, comment: b.comment ?? "" },
        client: splitFullName(b.name, phone),
      }),
    })
    if (!res.ok) return { success: false, error: `МИС вернула ${res.status}` }
    return { success: true }
  }
}

// ── Фабрика: выбор транспорта по окружению (синглтон) ────────────────────────

let _transport: BookingTransport | null = null

export function getBookingTransport(local: BookingTransport): BookingTransport {
  if (_transport) return _transport
  switch (process.env.BOOKING_TRANSPORT) {
    case "medflex":
      _transport = new MedflexTransport(local)
      break
    // case "direct": _transport = new DirectTransport(local); break  // 1С:БИТ УМЦ
    default:
      _transport = local
  }
  return _transport
}

// Вспомогательные функции (parseFreeSlots, lpuFor, splitFullName, …) опущены.
declare function parseFreeSlots(json: unknown, date: string): string[]
declare function lpuFor(doctorId: number): number
declare function specialityFor(doctorId: number): number
declare function endTime(b: BookingInput): string
declare function splitFullName(name: string, phone: string): Record<string, string>
