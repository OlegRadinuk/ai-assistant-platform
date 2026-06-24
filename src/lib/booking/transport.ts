/**
 * Booking Transport — abstraction for online appointment booking.
 *
 * In MVP only LocalTransport is used (stores to SQLite).
 * Real MIS integrations (MedFlex, 1C:BIT UMC) are a roadmap item.
 * The interface is kept here so frontend and AI bot always talk to our backend
 * (/api/booking/*), regardless of where the booking actually goes.
 *
 * TODO: wire LocalTransport to the appointments table in db.ts
 */

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

export interface BookingTransport {
  getSlots(q: SlotQuery): Promise<string[]>
  createBooking(b: BookingInput): Promise<BookingResult>
}

// ── LocalTransport — MVP implementation ───────────────────────────────────────

export class LocalTransport implements BookingTransport {
  async getSlots(_q: SlotQuery): Promise<string[]> {
    // TODO: query appointments table and return free time slots
    return ["10:00", "11:00", "14:00", "15:30", "17:00"]
  }

  async createBooking(b: BookingInput): Promise<BookingResult> {
    // TODO: insert into appointments table
    console.log("[booking/local] createBooking", b)
    return { success: true, appointmentId: 0 }
  }
}

// ── Factory ───────────────────────────────────────────────────────────────────

let _transport: BookingTransport | null = null

export function getBookingTransport(): BookingTransport {
  if (_transport) return _transport
  // TODO: add "medflex" / "direct" cases via BOOKING_TRANSPORT env
  _transport = new LocalTransport()
  return _transport
}

export function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "")
  if (digits.length === 11 && (digits.startsWith("7") || digits.startsWith("8"))) {
    return "7" + digits.slice(1)
  }
  if (digits.length === 10) return "7" + digits
  return null
}
