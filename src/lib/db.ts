import Database from "better-sqlite3"
import path from "path"
import fs from "fs"
import { hashPassword } from "@/lib/password"
import { buildSystemPrompt } from "@/lib/prompts"
import { TRIAL_DAYS } from "@/lib/pricing"
import type { Assistant, AssistantStatus, Lead, LeadInsert, Message, User, UserPublic } from "@/types"

const DB_PATH =
  process.env.DB_PATH ?? path.join(process.cwd(), "data", "app.db")

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })

let _db: Database.Database | null = null

export function getDb(): Database.Database {
  if (_db) return _db
  _db = new Database(DB_PATH)
  _db.pragma("journal_mode = WAL")
  _db.pragma("foreign_keys = ON")
  initSchema(_db)
  migrateSchema(_db)
  seedSystemUser(_db)
  seedOptiAssistant(_db)
  if (process.env.SEED_DEMO === "1") {
    seedDemoData(_db)
  }
  return _db
}

function initSchema(db: Database.Database) {
  db.exec(`
    -- Users table (new)
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      email         TEXT    UNIQUE NOT NULL,
      password_hash TEXT    NOT NULL,
      display_name  TEXT    DEFAULT '',
      created_at    TEXT    DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

    -- Clients / Assistants (ported + extended)
    CREATE TABLE IF NOT EXISTS clients (
      id                 INTEGER PRIMARY KEY AUTOINCREMENT,
      owner_id           INTEGER NOT NULL DEFAULT 0 REFERENCES users(id) ON DELETE CASCADE,
      slug               TEXT    UNIQUE NOT NULL,
      name               TEXT    NOT NULL,
      description        TEXT    DEFAULT '',
      role               TEXT    NOT NULL DEFAULT 'admin',
      industry           TEXT    NOT NULL DEFAULT '',
      system_prompt      TEXT    NOT NULL DEFAULT '',
      api_key            TEXT    NOT NULL DEFAULT '',
      base_url           TEXT    NOT NULL DEFAULT '',
      model              TEXT    NOT NULL DEFAULT 'claude-haiku-4-5-20251001',
      tg_token           TEXT    DEFAULT '',
      tg_chat_id         TEXT    DEFAULT '',
      widget_color       TEXT    DEFAULT '#e82020',
      widget_title       TEXT    DEFAULT 'AI-ассистент',
      widget_placeholder TEXT    DEFAULT 'Напишите вопрос…',
      rate_limit         INTEGER DEFAULT 30,
      active             INTEGER DEFAULT 1,
      context_url        TEXT    DEFAULT '',
      quick_replies      TEXT    DEFAULT '',
      greeting           TEXT    NOT NULL DEFAULT '',
      created_at         TEXT    DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_clients_owner ON clients(owner_id);
    CREATE INDEX IF NOT EXISTS idx_clients_slug  ON clients(slug);

    -- Messages (ported)
    CREATE TABLE IF NOT EXISTS messages (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id   INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      session_id  TEXT    NOT NULL,
      role        TEXT    NOT NULL CHECK(role IN ('user','assistant')),
      content     TEXT    NOT NULL,
      created_at  TEXT    DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(client_id, session_id);

    -- Leads (ported + status + source)
    CREATE TABLE IF NOT EXISTS leads (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id   INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      session_id  TEXT    NOT NULL DEFAULT '',
      name        TEXT    DEFAULT '',
      phone       TEXT    DEFAULT '',
      email       TEXT    DEFAULT '',
      message     TEXT    DEFAULT '',
      status      TEXT    NOT NULL DEFAULT 'new' CHECK(status IN ('new','working','closed')),
      source      TEXT    NOT NULL DEFAULT 'chat',
      created_at  TEXT    DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_leads_client ON leads(client_id);
    CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(client_id, status);

    -- Lead events (service-time analytics)
    CREATE TABLE IF NOT EXISTS lead_events (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id   INTEGER NOT NULL,
      lead_id     INTEGER NOT NULL,
      type        TEXT    NOT NULL DEFAULT 'status_change',
      from_status TEXT,
      to_status   TEXT,
      actor       TEXT    DEFAULT '',
      created_at  TEXT    DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_lead_events_client ON lead_events(client_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_lead_events_lead   ON lead_events(lead_id);

    -- Doctors / Services / Appointments (kept for booking interface compatibility)
    CREATE TABLE IF NOT EXISTS doctors (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id        INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      name             TEXT    NOT NULL,
      specialty        TEXT    NOT NULL DEFAULT '',
      branch           INTEGER NOT NULL DEFAULT 1,
      schedule         TEXT    NOT NULL DEFAULT '{"mon":true,"tue":true,"wed":true,"thu":true,"fri":true,"sat":false,"sun":false}',
      active           INTEGER NOT NULL DEFAULT 1,
      photo_url        TEXT,
      appointment_price TEXT,
      created_at       TEXT    DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_doctors_client ON doctors(client_id);

    CREATE TABLE IF NOT EXISTS services (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id   INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      name        TEXT    NOT NULL,
      category    TEXT    NOT NULL DEFAULT '',
      price       TEXT    NOT NULL DEFAULT '',
      sort_order  INTEGER NOT NULL DEFAULT 0,
      active      INTEGER NOT NULL DEFAULT 1,
      created_at  TEXT    DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_services_client ON services(client_id);

    CREATE TABLE IF NOT EXISTS appointments (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id        INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      lead_id          INTEGER REFERENCES leads(id) ON DELETE SET NULL,
      doctor_id        INTEGER REFERENCES doctors(id) ON DELETE SET NULL,
      patient_name     TEXT    NOT NULL DEFAULT '',
      patient_phone    TEXT    NOT NULL DEFAULT '',
      service          TEXT    NOT NULL DEFAULT '',
      notes            TEXT    NOT NULL DEFAULT '',
      appointment_date TEXT    NOT NULL,
      appointment_time TEXT    NOT NULL,
      duration_min     INTEGER NOT NULL DEFAULT 30,
      status           TEXT    NOT NULL DEFAULT 'scheduled',
      source           TEXT    NOT NULL DEFAULT 'admin',
      created_at       TEXT    DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_appointments_client ON appointments(client_id, appointment_date);
    CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments(doctor_id, appointment_date);
  `)
}

// ── Migrations (safe ALTER TABLE for existing DBs) ────────────────────────────
// Each block is wrapped in try/catch — duplicate column errors are silently ignored.
function migrateSchema(db: Database.Database) {
  // Monetization sprint: trial/plan/paid_until columns on clients
  const clientMigrations: string[] = [
    `ALTER TABLE clients ADD COLUMN trial_ends_at TEXT NOT NULL DEFAULT (datetime('now', '+${TRIAL_DAYS} days'))`,
    `ALTER TABLE clients ADD COLUMN plan TEXT NOT NULL DEFAULT 'auto'`,
    `ALTER TABLE clients ADD COLUMN paid_until TEXT`,
  ]
  for (const sql of clientMigrations) {
    try { db.exec(sql) } catch { /* column already exists */ }
  }

  // PD consent columns (152-ФЗ)
  const consentMigrations: string[] = [
    `ALTER TABLE users ADD COLUMN pd_consent_at TEXT`,
    `ALTER TABLE users ADD COLUMN pd_consent_ip TEXT`,
    `ALTER TABLE users ADD COLUMN pd_consent_version TEXT`,
    `ALTER TABLE leads ADD COLUMN pd_consent_at TEXT`,
    `ALTER TABLE leads ADD COLUMN pd_consent_ip TEXT`,
    `ALTER TABLE leads ADD COLUMN pd_consent_version TEXT`,
  ]
  for (const sql of consentMigrations) {
    try { db.exec(sql) } catch { /* column already exists */ }
  }

  // Telegram deep-link start tokens table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tg_start_tokens (
      token      TEXT PRIMARY KEY,
      owner_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      client_id  INTEGER REFERENCES clients(id) ON DELETE CASCADE,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `)
}

// ── Demo seed ──────────────────────────────────────────────────────────────────

/** Ensure the public "opti" landing assistant exists (idempotent).
 *  Uses owner_id=0 — a reserved system owner that belongs to no real user.
 *  This prevents Opti from appearing in any user's dashboard (getAssistantsByOwner
 *  filters owner_id > 0) and from being deleted via ownership-checked PATCH/DELETE. */
/* Reserved system user (id=0) — owns platform-level assistants like «Опти».
 * Satisfies the clients.owner_id FOREIGN KEY without belonging to any real user.
 * Not loginable: password_hash is an invalid scrypt string that can never verify.
 * Hidden from dashboards via the `owner_id > 0` filter in getAssistantsByOwner. */
function seedSystemUser(db: Database.Database) {
  db.prepare(
    `INSERT OR IGNORE INTO users (id, email, password_hash, display_name)
     VALUES (0, 'system@optisphere.local', '!invalid', 'System')`
  ).run()
}

function seedOptiAssistant(db: Database.Database) {
  const existing = db.prepare("SELECT id FROM clients WHERE slug = 'opti'").get()
  if (existing) return

  const resolvedOwner = 0 // system owner — never matches a real user id

  const systemPrompt = [
    "Ты — Опти, AI-консультант платформы AI-ассистентов Optisphere.",
    "",
    "Твоя цель — кратко и по делу объяснить посетителю лендинга, чем полезна платформа,",
    "и мягко привести его к регистрации (кнопка «Создать своего ассистента»).",
    "",
    "Что ты знаешь о продукте:",
    "- Платформа позволяет создать AI-ассистента для сайта или мессенджера за 10 минут без программиста.",
    "- Ассистент отвечает клиентам 24/7, собирает заявки и отправляет их в Telegram владельцу.",
    "- Подходит для клиник, отелей, салонов, строительных компаний, интернет-магазинов — любого бизнеса.",
    "- Пробный период: 7 дней бесплатно.",
    "- После триала: тариф «Авто» — 3 990 ₽/мес (самостоятельная настройка),",
    "  тариф «Интеграция под ключ» — от 7 000 ₽/мес (Олег настраивает за вас, интеграция с МИС/CRM).",
    "- После окончания триала ассистент останавливается до оплаты — честно, без сюрпризов.",
    "",
    "ПРАВИЛА:",
    "- Отвечай кратко, 1–3 предложения. Без эмодзи.",
    "- Если спрашивают цены — называй честно.",
    "- Если человек готов попробовать — скажи: «Нажмите «Создать своего ассистента» — займёт 10 минут».",
    "- Не выдумывай функции, которых нет.",
    "- Если вопрос не по теме платформы — вежливо верни разговор к продукту.",
  ].join("\n")

  db.prepare(`
    INSERT INTO clients
      (owner_id, slug, name, description, role, industry, system_prompt, model,
       widget_color, widget_title, widget_placeholder, rate_limit, active, greeting)
    VALUES
      (?, 'opti', 'Опти — консультант платформы',
       'Публичный ассистент-продавец на лендинге Optisphere',
       'consultant', 'SaaS / AI-платформа', ?, 'claude-haiku-4-5-20251001',
       '#e82020', 'Опти', 'Спросите про платформу…', 60, 1,
       'Привет! Я Опти — могу рассказать, как работает платформа, и помочь подобрать тариф. Что вас интересует?')
  `).run(resolvedOwner, systemPrompt)
}

function seedDemoData(db: Database.Database) {
  // Count only real users (id > 0); the reserved system user (id=0) is always present.
  const userCount = (db.prepare("SELECT COUNT(*) as n FROM users WHERE id > 0").get() as { n: number }).n
  if (userCount > 0) return

  // Demo user
  const passwordHash = hashPassword("demo1234")
  const userResult = db
    .prepare(`INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)`)
    .run("demo@example.com", passwordHash, "Demo User")
  const userId = Number(userResult.lastInsertRowid)

  // ── Assistant 1: Клиника Ромашка (active trial) ────────────────────────────
  const systemPrompt1 = buildSystemPrompt({
    role: "admin",
    industry: "клиника",
    businessName: "Клиника Ромашка",
    websiteUrl: undefined,
  })

  const trialEndsAt1 = new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000).toISOString()
  const clientResult1 = db
    .prepare(`
      INSERT INTO clients
        (owner_id, slug, name, description, role, industry, system_prompt, model,
         widget_color, widget_title, widget_placeholder, rate_limit, active, greeting,
         trial_ends_at, plan, paid_until)
      VALUES
        (?, 'demo', 'Клиника Ромашка', 'Демо-ассистент для стоматологической клиники',
         'admin', 'Клиника / Медицина', ?, 'claude-haiku-4-5-20251001',
         '#e82020', 'AI-ассистент Ромашка', 'Напишите вопрос…', 30, 1,
         'Здравствуйте! Я AI-ассистент клиники Ромашка. Помогу записаться на приём, расскажу об услугах и ценах.',
         ?, 'auto', NULL)
    `)
    .run(userId, systemPrompt1, trialEndsAt1)
  const clientId1 = Number(clientResult1.lastInsertRowid)

  // ── Assistant 2: Салон Элегант (active paid) ───────────────────────────────
  const systemPrompt2 = buildSystemPrompt({
    role: "consultant",
    industry: "Салон красоты",
    businessName: "Салон Элегант",
    websiteUrl: undefined,
  })
  const paidUntil2 = new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString()
  const trialEndsAt2 = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() // trial already ended
  const clientResult2 = db
    .prepare(`
      INSERT INTO clients
        (owner_id, slug, name, description, role, industry, system_prompt, model,
         widget_color, widget_title, widget_placeholder, rate_limit, active, greeting,
         trial_ends_at, plan, paid_until)
      VALUES
        (?, 'demo-elegance', 'Салон Элегант', 'Консультант салона красоты',
         'consultant', 'Салон красоты', ?, 'claude-haiku-4-5-20251001',
         '#e82020', 'Консультант Элегант', 'Задайте вопрос о наших услугах…', 30, 1,
         'Добро пожаловать в Салон Элегант! Я помогу выбрать услугу, уточнить цены или записаться к мастеру.',
         ?, 'auto', ?)
    `)
    .run(userId, systemPrompt2, trialEndsAt2, paidUntil2)
  const clientId2 = Number(clientResult2.lastInsertRowid)

  // ── Messages for assistant 1 (session 1 — Иван Петров) ────────────────────
  const session1 = "demo-session-001"
  const msgs1 = [
    { role: "user",      content: "Добрый день! Сколько стоит консультация стоматолога?" },
    { role: "assistant", content: "Добрый день! Первичная консультация стоматолога стоит 1 500 руб. Включает осмотр и рекомендации по лечению. Хотите записаться?" },
    { role: "user",      content: "Да, хотел бы записаться на завтра." },
    { role: "assistant", content: "Отлично! Завтра есть свободные места: 10:00, 13:30 и 16:00. Какое время удобнее?" },
    { role: "user",      content: "10 утра подходит. Как вас найти?" },
    { role: "assistant", content: "Записал вас на завтра в 10:00. Мы находимся по адресу: ул. Цветочная, 15. Чтобы подтвердить запись — оставьте ваш номер телефона, мы перезвоним." },
    { role: "user",      content: "Мой номер +79161234567" },
    { role: "assistant", content: "Спасибо, Иван! Номер принял. Наш администратор подтвердит запись звонком сегодня до 18:00. Увидимся завтра в 10:00!" },
  ]
  const msgStmt = db.prepare("INSERT INTO messages (client_id, session_id, role, content) VALUES (?, ?, ?, ?)")
  for (const m of msgs1) msgStmt.run(clientId1, session1, m.role, m.content)

  // Session 2 — Мария Сидорова
  const session2 = "demo-session-002"
  const msgs2 = [
    { role: "user",      content: "Здравствуйте! Вы делаете отбеливание зубов?" },
    { role: "assistant", content: "Да, конечно! Мы проводим профессиональное отбеливание системой Beyond. Осветление до 8 тонов за одну процедуру, стоимость от 8 000 руб." },
    { role: "user",      content: "А за одно посещение это делается?" },
    { role: "assistant", content: "Да, за одно посещение ~1,5 часа. Предварительно рекомендуем профессиональную чистку (от 2 500 руб.) — результат будет лучше и дольше держится." },
    { role: "user",      content: "Запишите меня, пожалуйста. Я Мария." },
    { role: "assistant", content: "Мария, добро пожаловать! Оставьте ваш телефон или email — администратор свяжется и подберёт удобное время." },
  ]
  for (const m of msgs2) msgStmt.run(clientId1, session2, m.role, m.content)

  // Session 3 — Алексей Новиков
  const session3 = "demo-session-003"
  const msgs3 = [
    { role: "user",      content: "Добрый вечер. Есть ли у вас услуга имплантации?" },
    { role: "assistant", content: "Добрый вечер! Да, мы проводим имплантацию зубов. Стоимость зависит от производителя импланта: от 25 000 руб. (Osstem) до 55 000 руб. (Nobel Biocare). Включает сам имплант, абатмент и коронку." },
    { role: "user",      content: "Спасибо, это дорого для меня. Есть ли рассрочка?" },
    { role: "assistant", content: "Да! Мы работаем с рассрочкой 0% через банк на срок до 12 месяцев. Первый взнос от 20%. Также есть консультация с врачом-имплантологом — бесплатно." },
    { role: "user",      content: "Отлично, запишите на консультацию. Я Алексей, тел +79371234569" },
    { role: "assistant", content: "Алексей, записал! Администратор перезвонит в течение дня для уточнения времени. Спасибо, что выбрали Клинику Ромашка!" },
  ]
  for (const m of msgs3) msgStmt.run(clientId1, session3, m.role, m.content)

  // ── Messages for assistant 2 (salon) ──────────────────────────────────────
  const session4 = "demo-session-004"
  const msgs4 = [
    { role: "user",      content: "Привет! Хочу записаться на маникюр. Какие цены?" },
    { role: "assistant", content: "Привет! Маникюр классический — 900 руб., аппаратный — 1 200 руб., гель-лак — от 1 500 руб. Все услуги включают уход за кутикулой." },
    { role: "user",      content: "Запишите меня на гель-лак на ближайшую субботу." },
    { role: "assistant", content: "Суббота, 28 декабря — есть время: 11:00, 13:00 и 16:30. Какое удобнее?" },
    { role: "user",      content: "13:00 отлично. Меня зовут Екатерина." },
    { role: "assistant", content: "Екатерина, записала вас на субботу 28 декабря в 13:00 на гель-лак. Жду вас! Если будут вопросы — пишите." },
  ]
  for (const m of msgs4) msgStmt.run(clientId2, session4, m.role, m.content)

  // ── Demo leads ────────────────────────────────────────────────────────────
  const leadStmt = db.prepare(`
    INSERT INTO leads (client_id, session_id, name, phone, email, message, status, source)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)
  // Assistant 1 leads
  leadStmt.run(clientId1, session1, "Иван Петров", "+79161234567", "", "Записаться на консультацию стоматолога", "working", "chat")
  leadStmt.run(clientId1, session2, "Мария Сидорова", "+79261234568", "maria@mail.ru", "Интересует отбеливание зубов", "new", "chat")
  leadStmt.run(clientId1, session3, "Алексей Новиков", "+79371234569", "", "Консультация по имплантации, есть ли рассрочка", "closed", "chat")
  // Assistant 2 leads
  leadStmt.run(clientId2, session4, "Екатерина Смирнова", "+79481234570", "katya@mail.ru", "Запись на гель-лак в субботу", "working", "chat")
  leadStmt.run(clientId2, "demo-session-005", "Ольга Морозова", "+79591234571", "", "Уточнить стоимость наращивания ресниц", "new", "chat")
}

// ── User queries ───────────────────────────────────────────────────────────────

export function createUser(data: {
  email: string
  password_hash: string
  display_name?: string
  pd_consent_at?: string
  pd_consent_ip?: string
  pd_consent_version?: string
}): UserPublic {
  const db = getDb()
  const result = db
    .prepare(`
      INSERT INTO users (email, password_hash, display_name, pd_consent_at, pd_consent_ip, pd_consent_version)
      VALUES (@email, @password_hash, @display_name, @pd_consent_at, @pd_consent_ip, @pd_consent_version)
    `)
    .run({
      email: data.email,
      password_hash: data.password_hash,
      display_name: data.display_name ?? "",
      pd_consent_at: data.pd_consent_at ?? null,
      pd_consent_ip: data.pd_consent_ip ?? null,
      pd_consent_version: data.pd_consent_version ?? null,
    })
  return getUserById(Number(result.lastInsertRowid))!
}

export function getUserByEmail(email: string): User | undefined {
  return getDb().prepare("SELECT * FROM users WHERE email = ?").get(email) as User | undefined
}

export function getUserById(id: number): UserPublic | undefined {
  return getDb()
    .prepare("SELECT id, email, display_name, created_at FROM users WHERE id = ?")
    .get(id) as UserPublic | undefined
}

// ── Assistant / Client queries ─────────────────────────────────────────────────

export function getClientBySlug(slug: string): Assistant | undefined {
  return getDb().prepare("SELECT * FROM clients WHERE slug = ?").get(slug) as Assistant | undefined
}

export function getAssistantsByOwner(ownerId: number): Assistant[] {
  // owner_id > 0 ensures system assistants (e.g. Опти with owner_id=0) are never shown
  return getDb()
    .prepare("SELECT * FROM clients WHERE owner_id = ? AND owner_id > 0 ORDER BY created_at DESC")
    .all(ownerId) as Assistant[]
}

export function getAssistantById(id: number, ownerId: number): Assistant | undefined {
  return getDb()
    .prepare("SELECT * FROM clients WHERE id = ? AND owner_id = ?")
    .get(id, ownerId) as Assistant | undefined
}

export function createAssistant(
  data: Omit<Assistant, "id" | "created_at" | "trial_ends_at" | "paid_until" | "plan"> & { plan?: "auto" | "integration" }
): Assistant {
  const db = getDb()
  const trialEndsAt = new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000).toISOString()
  const result = db
    .prepare(`
      INSERT INTO clients
        (owner_id, slug, name, description, role, industry, system_prompt,
         api_key, base_url, model, tg_token, tg_chat_id,
         widget_color, widget_title, widget_placeholder,
         rate_limit, active, context_url, quick_replies, greeting,
         trial_ends_at, plan, paid_until)
      VALUES
        (@owner_id, @slug, @name, @description, @role, @industry, @system_prompt,
         @api_key, @base_url, @model, @tg_token, @tg_chat_id,
         @widget_color, @widget_title, @widget_placeholder,
         @rate_limit, @active, @context_url, @quick_replies, @greeting,
         @trial_ends_at, @plan, NULL)
    `)
    .run({ ...data, plan: data.plan ?? "auto", trial_ends_at: trialEndsAt })
  return db.prepare("SELECT * FROM clients WHERE id = ?").get(result.lastInsertRowid) as Assistant
}

const UPDATABLE_ASSISTANT_FIELDS = new Set([
  "name", "description", "system_prompt", "api_key", "base_url", "model",
  "tg_token", "tg_chat_id", "widget_color", "widget_title", "widget_placeholder",
  "rate_limit", "active", "context_url", "quick_replies", "greeting",
  // Billing fields (set manually by Oleg after payment)
  "plan", "paid_until",
])

export function updateAssistant(
  id: number,
  ownerId: number,
  data: Partial<Omit<Assistant, "id" | "owner_id" | "slug" | "created_at">>
): void {
  const keys = Object.keys(data).filter((k) => UPDATABLE_ASSISTANT_FIELDS.has(k))
  if (!keys.length) return
  const fields = keys.map((k) => `${k} = @${k}`).join(", ")
  const safeData = Object.fromEntries(keys.map((k) => [k, (data as Record<string, unknown>)[k]]))
  getDb()
    .prepare(`UPDATE clients SET ${fields} WHERE id = @id AND owner_id = @owner_id`)
    .run({ ...safeData, id, owner_id: ownerId })
}

export function deleteAssistant(id: number, ownerId: number): void {
  getDb().prepare("DELETE FROM clients WHERE id = ? AND owner_id = ?").run(id, ownerId)
}

// ── Lead queries ───────────────────────────────────────────────────────────────

export function saveLead(lead: LeadInsert): void {
  getDb()
    .prepare(`
      INSERT INTO leads (client_id, session_id, name, phone, email, message, source, pd_consent_at, pd_consent_ip, pd_consent_version)
      VALUES (@client_id, @session_id, @name, @phone, @email, @message, @source, @pd_consent_at, @pd_consent_ip, @pd_consent_version)
    `)
    .run({
      ...lead,
      source: lead.source ?? "chat",
      pd_consent_at: lead.pd_consent_at ?? null,
      pd_consent_ip: lead.pd_consent_ip ?? null,
      pd_consent_version: lead.pd_consent_version ?? null,
    })
}

export function getLeadsByOwner(
  ownerId: number,
  options: { status?: string; limit?: number } = {}
): Lead[] {
  const { status, limit = 100 } = options
  if (status && ["new", "working", "closed"].includes(status)) {
    return getDb()
      .prepare(`
        SELECT l.* FROM leads l
        JOIN clients c ON c.id = l.client_id
        WHERE c.owner_id = ? AND l.status = ?
        ORDER BY l.created_at DESC LIMIT ?
      `)
      .all(ownerId, status, limit) as Lead[]
  }
  return getDb()
    .prepare(`
      SELECT l.* FROM leads l
      JOIN clients c ON c.id = l.client_id
      WHERE c.owner_id = ?
      ORDER BY l.created_at DESC LIMIT ?
    `)
    .all(ownerId, limit) as Lead[]
}

export function updateLeadStatus(
  id: number,
  status: "new" | "working" | "closed",
  actor = ""
): void {
  const db = getDb()
  const row = db.prepare("SELECT status, client_id FROM leads WHERE id = ?").get(id) as
    | { status: string; client_id: number }
    | undefined
  if (!row) return
  db.prepare("UPDATE leads SET status = ? WHERE id = ?").run(status, id)
  if (row.status !== status) {
    db.prepare(`
      INSERT INTO lead_events (client_id, lead_id, type, from_status, to_status, actor)
      VALUES (?, ?, 'status_change', ?, ?, ?)
    `).run(row.client_id, id, row.status, status, actor)
  }
}

// ── Message queries ────────────────────────────────────────────────────────────

export function saveMessage(
  clientId: number,
  sessionId: string,
  role: "user" | "assistant",
  content: string
): void {
  getDb()
    .prepare("INSERT INTO messages (client_id, session_id, role, content) VALUES (?, ?, ?, ?)")
    .run(clientId, sessionId, role, content)
}

export function getMessagesBySession(clientId: number, sessionId: string, limit = 20): Message[] {
  return getDb()
    .prepare(
      "SELECT * FROM messages WHERE client_id = ? AND session_id = ? ORDER BY created_at DESC LIMIT ?"
    )
    .all(clientId, sessionId, limit) as Message[]
}

export function getSessionMessages(clientId: number, sessionId: string): Message[] {
  return getDb()
    .prepare(
      "SELECT * FROM messages WHERE client_id = ? AND session_id = ? ORDER BY created_at ASC"
    )
    .all(clientId, sessionId) as Message[]
}

// ── Stats queries ──────────────────────────────────────────────────────────────

export type OwnerStats = {
  totalAssistants: number
  totalLeads: number
  newLeads: number
  totalMessages: number
  totalSessions: number
}

export function getOwnerStats(ownerId: number): OwnerStats {
  const db = getDb()
  const totalAssistants = (
    db.prepare("SELECT COUNT(*) as n FROM clients WHERE owner_id = ?").get(ownerId) as { n: number }
  ).n
  const totalLeads = (
    db.prepare(`
      SELECT COUNT(*) as n FROM leads l
      JOIN clients c ON c.id = l.client_id
      WHERE c.owner_id = ?
    `).get(ownerId) as { n: number }
  ).n
  const newLeads = (
    db.prepare(`
      SELECT COUNT(*) as n FROM leads l
      JOIN clients c ON c.id = l.client_id
      WHERE c.owner_id = ? AND l.status = 'new'
    `).get(ownerId) as { n: number }
  ).n
  const totalMessages = (
    db.prepare(`
      SELECT COUNT(*) as n FROM messages m
      JOIN clients c ON c.id = m.client_id
      WHERE c.owner_id = ?
    `).get(ownerId) as { n: number }
  ).n
  const totalSessions = (
    db.prepare(`
      SELECT COUNT(DISTINCT m.session_id) as n FROM messages m
      JOIN clients c ON c.id = m.client_id
      WHERE c.owner_id = ?
    `).get(ownerId) as { n: number }
  ).n
  return { totalAssistants, totalLeads, newLeads, totalMessages, totalSessions }
}

export type ServiceTimeStats = {
  avgResponseMin: number | null
  avgResolutionMin: number | null
  handledToday: number
  closedToday: number
}

export function getServiceTimeStats(clientId: number): ServiceTimeStats {
  const db = getDb()
  const avg = (whereExtra: string): number | null => {
    const r = db
      .prepare(`
        SELECT AVG(m) AS a FROM (
          SELECT (julianday(MIN(e.created_at)) - julianday(l.created_at)) * 1440 AS m
          FROM lead_events e JOIN leads l ON l.id = e.lead_id
          WHERE e.client_id = ? AND e.type = 'status_change' ${whereExtra}
          GROUP BY e.lead_id
        )
      `)
      .get(clientId) as { a: number | null }
    return r.a != null ? Math.max(0, Math.round(r.a)) : null
  }
  const count = (sql: string): number =>
    (db.prepare(sql).get(clientId) as { n: number }).n

  return {
    avgResponseMin:   avg("AND e.from_status = 'new'"),
    avgResolutionMin: avg("AND e.to_status = 'closed'"),
    handledToday:     count("SELECT COUNT(*) AS n FROM lead_events WHERE client_id = ? AND date(created_at) = date('now')"),
    closedToday:      count("SELECT COUNT(*) AS n FROM lead_events WHERE client_id = ? AND to_status = 'closed' AND date(created_at) = date('now')"),
  }
}

// ── Billing / trial helpers ────────────────────────────────────────────────────

/** Returns true if the assistant is allowed to serve chat messages. */
export function isAssistantActive(client: Assistant): boolean {
  if (!client.active) return false
  const now = Date.now()
  const trialOk = client.trial_ends_at ? new Date(client.trial_ends_at).getTime() > now : false
  const paidOk  = client.paid_until    ? new Date(client.paid_until).getTime() > now    : false
  return trialOk || paidOk
}

/** Returns rich billing status for dashboard display. */
export function getAssistantStatus(client: Assistant): AssistantStatus {
  const now = Date.now()
  const trialMs  = client.trial_ends_at ? new Date(client.trial_ends_at).getTime() : 0
  const paidMs   = client.paid_until    ? new Date(client.paid_until).getTime()    : 0
  const inTrial  = trialMs > now
  const inPaid   = paidMs  > now

  if (inPaid) {
    const daysLeft = Math.ceil((paidMs - now) / (24 * 60 * 60 * 1000))
    return { state: "active", daysLeft, trialEndsAt: client.trial_ends_at, paidUntil: client.paid_until, plan: client.plan }
  }
  if (inTrial) {
    const daysLeft = Math.ceil((trialMs - now) / (24 * 60 * 60 * 1000))
    return { state: "trial", daysLeft, trialEndsAt: client.trial_ends_at, paidUntil: client.paid_until, plan: client.plan }
  }
  return { state: "expired", daysLeft: null, trialEndsAt: client.trial_ends_at, paidUntil: client.paid_until, plan: client.plan }
}

/** Count active-trial assistants on the auto plan for this owner (for abuse check). */
export function countActiveTrialAssistants(ownerId: number): number {
  const now = new Date().toISOString()
  const row = getDb()
    .prepare(`
      SELECT COUNT(*) as n FROM clients
      WHERE owner_id = ? AND plan = 'auto' AND trial_ends_at > ? AND (paid_until IS NULL OR paid_until <= ?)
    `)
    .get(ownerId, now, now) as { n: number }
  return row.n
}

/** Extend paid_until for a client (manual payment by Oleg). */
export function setPaidUntil(clientId: number, ownerId: number, paidUntil: string): void {
  getDb()
    .prepare("UPDATE clients SET paid_until = ? WHERE id = ? AND owner_id = ?")
    .run(paidUntil, clientId, ownerId)
}

// ── Telegram start-token helpers ───────────────────────────────────────────────

import { randomBytes } from "node:crypto"

/**
 * Generate a one-use start token for the Telegram deep-link flow.
 * Returns the raw token string.
 */
export function createTelegramStartToken(ownerId: number, clientId: number | null): string {
  const token = randomBytes(16).toString("hex")
  getDb()
    .prepare(`INSERT INTO tg_start_tokens (token, owner_id, client_id) VALUES (?, ?, ?)`)
    .run(token, ownerId, clientId)
  return token
}

/** Resolve start token → owner/client row, then delete it (one-use). Returns null if not found. */
export function consumeTelegramStartToken(
  token: string
): { ownerId: number; clientId: number | null } | null {
  const db = getDb()
  const row = db
    .prepare("SELECT owner_id, client_id FROM tg_start_tokens WHERE token = ?")
    .get(token) as { owner_id: number; client_id: number | null } | undefined
  if (!row) return null
  db.prepare("DELETE FROM tg_start_tokens WHERE token = ?").run(token)
  return { ownerId: row.owner_id, clientId: row.client_id }
}

/**
 * Save Telegram chat_id for a client (append to comma-separated list, dedup).
 * Also saves on the user record via tg_chat_id column on clients.
 */
export function saveTelegramChatId(clientId: number, chatId: string): void {
  const db = getDb()
  const existing = db
    .prepare("SELECT tg_chat_id FROM clients WHERE id = ?")
    .get(clientId) as { tg_chat_id: string } | undefined
  if (!existing) return
  const ids = existing.tg_chat_id
    ? existing.tg_chat_id.split(",").map((s) => s.trim()).filter(Boolean)
    : []
  if (!ids.includes(chatId)) {
    ids.push(chatId)
    db.prepare("UPDATE clients SET tg_chat_id = ? WHERE id = ?").run(ids.join(","), clientId)
  }
}

/**
 * Save Telegram chat_id on a user level (for the shared-bot fallback path).
 * Stored in users table — needs a column tg_chat_id.
 */
export function saveUserTelegramChatId(ownerId: number, chatId: string): void {
  // Safe migration: add column if missing
  try {
    getDb().exec("ALTER TABLE users ADD COLUMN tg_chat_id TEXT DEFAULT ''")
  } catch { /* already exists */ }
  getDb().prepare("UPDATE users SET tg_chat_id = ? WHERE id = ?").run(chatId, ownerId)
}

export function getUserTelegramChatId(ownerId: number): string | null {
  // Ensure column exists
  try {
    getDb().exec("ALTER TABLE users ADD COLUMN tg_chat_id TEXT DEFAULT ''")
  } catch { /* already exists */ }
  const row = getDb()
    .prepare("SELECT tg_chat_id FROM users WHERE id = ?")
    .get(ownerId) as { tg_chat_id: string } | undefined
  return row?.tg_chat_id || null
}

// Re-export types for convenience
export type { Assistant, AssistantStatus, Lead, LeadInsert, Message, User, UserPublic }
