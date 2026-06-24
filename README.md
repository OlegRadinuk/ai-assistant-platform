# AI Assistant Platform

**Multi-tenant платформа AI-ассистентов для бизнеса.** Один движок обслуживает множество клиентов: каждый ассистент настраивается без выката кода, встраивается на любой сайт одной строкой, ведёт диалог на Claude, захватывает заявки в Telegram и умеет записывать клиентов в их реальные системы (МИС/CRM).

> **«Наймите AI-сотрудника за 10 минут»** — self-serve: регистрация → диалог-онбординг → автопровижининг → рабочий ассистент + сниппет виджета. Запускается локально одной командой; чат работает даже без API-ключа (честный demo-режим).

![stack](https://img.shields.io/badge/Next.js-16-black)
![react](https://img.shields.io/badge/React-19-61DAFB)
![ts](https://img.shields.io/badge/TypeScript-strict-3178C6)
![llm](https://img.shields.io/badge/Claude-API-D97757)
![arch](https://img.shields.io/badge/architecture-multi--tenant-6E56CF)

---

## Быстрый старт

```bash
npm install
npm run dev
# http://localhost:3000  (или PORT=3100 npm run dev)
```

- **Без секретов не падает.** Чат работает в demo-режиме (честные mock-ответы), если не задан `ANTHROPIC_API_KEY`.
- **Демо-данные:** запусти с `SEED_DEMO=1` — создастся аккаунт `demo@example.com` / `demo1234` с наполненным дашбордом (ассистенты, заявки, переписки). На лендинге/логине — кнопка «Войти как демо».

> **Windows:** `better-sqlite3` — нативный модуль; для чистой сборки нужны Visual Studio C++ Build Tools (или готовый prebuild). На Linux/macOS собирается из коробкой при `npm install`.

### Переменные окружения (`.env.example`)
| Переменная | Назначение |
|---|---|
| `SESSION_SECRET` | Подпись сессий. **В проде обязательна** (иначе старт падает). |
| `ANTHROPIC_API_KEY` | Claude. Пусто → demo-режим. |
| `ANTHROPIC_BASE_URL` | Опционально — прокси для RU-серверов. |
| `TELEGRAM_BOT_TOKEN` | Общий бот платформы: лиды + deep-link chat_id. |
| `TELEGRAM_WEBHOOK_SECRET` | Аутентификация входящих webhook (`openssl rand -hex 32`). |
| `APP_BASE_URL` | Базовый URL для ссылок чата/виджета и webhook. |
| `DB_PATH` | Путь к SQLite (по умолчанию `./data/app.db`). |
| `SEED_DEMO` | `1` — засеять демо-данные (только для демо/стейджа). |

---

## Возможности

| Область | Что умеет |
|---|---|
| Онбординг | Диалог-«архитектор»: бот сам расспрашивает (роль, сфера, сайт, Telegram) и собирает конфиг |
| Провижининг | По конфигу автоматически заводится арендатор, генерируется system prompt, выдаётся ссылка + сниппет виджета |
| Диалог | Стриминг Claude, per-tenant system prompt, живой контекст по `context_url`, дата/время МСК в коде, SSRF-safe парсинг ссылок |
| Лиды | Захват контакта → SQLite + Telegram владельцу с историей; «ловля» незавершённых диалогов |
| Запись | Абстракция `BookingTransport` (Local / Medflex / 1С) — задел под онлайн-запись в МИС |
| Кабинет | Лиды со статусами, просмотр диалогов, аналитика, биллинг-статус, интерактивная обучалка |
| Монетизация | Триал 7 дней → ассистент останавливается до оплаты; тарифы в `src/lib/pricing.ts` |
| Multi-tenant | Новый ассистент = строка в БД под `owner_id`; изоляция данных между владельцами |
| Стоимость | По умолчанию экономичная модель (Haiku), переключается per-tenant |

---

## Архитектура

```
   Сайт клиента  ──▶  widget.js (одна строка <script>, CORS)
   (любой домен)             │
                             ▼
              ┌──────────────────────────────────────────────┐
   Telegram ◀─┤            ПЛАТФОРМА (Next.js 16)              │
   (лиды)     │  /api/auth/*            — signup/login (scrypt + HMAC-сессии)
              │  /api/assistants        — провижининг (owner-scoped)
              │  /api/bots/[slug]/chat  — стриминг Claude (+ demo-режим)
              │  /api/bots/[slug]/lead  — захват контакта (+ согласие ПД)
              │  /api/telegram/*        — общий бот: deep-link chat_id, webhook
              │  /dashboard/*           — кабинет владельца
              └──────────────┬───────────────┬───────────────┘
                             ▼               ▼
                     ┌────────────┐   ┌──────────────────────┐
                     │  SQLite     │   │  Booking transport    │
                     │  users,     │   │  Local │ Medflex │ 1С │
                     │  clients,   │   │  (абстракция МИС/CRM) │
                     │  leads, ... │   └──────────────────────┘
                     └────────────┘
```

### Ключевые решения
1. **Multi-tenant через конфигурацию, а не код.** Клиент = строка в `clients` (`slug`, `system_prompt`, `model`, `context_url`, виджет, `owner_id`, тариф/триал). Онбординг клиента — ноль деплоев.
2. **Изоляция арендаторов.** Все выборки скоупятся по `owner_id`; системные ассистенты (`owner_id=0`) скрыты из кабинетов.
3. **Живой контекст вместо «вшитых» знаний.** Цены/слоты подтягиваются в рантайме по `context_url` (SSRF-проверка); дата/время считаются в коде по МСК.
4. **Захват лида устойчив к «молчунам».** На N-м сообщении без контакта владельцу всё равно уходит уведомление с куском диалога.
5. **Запись в чужие системы — через абстракцию транспорта** (`Local` / `Medflex` / `Direct 1С`). См. [docs/booking-architecture.md](docs/booking-architecture.md).
6. **Безопасность:** scrypt-хеши, HMAC-сессии, SSRF-гард, webhook secret-token, CORS только для публичных bot-эндпоинтов, валидация (zod).

---

## Технологии
`Next.js 16 (App Router)` · `React 19` · `TypeScript (strict)` · `Tailwind CSS 4` · `better-sqlite3` · `@anthropic-ai/sdk (Claude)` · `Telegram Bot API`

## Деплой
Standalone Next.js — нужен Node-сервер (VPS), не shared-хостинг. На сервере: `npm ci && npm run build && npm start` (за nginx + SSL), процесс под PM2/systemd. После деплоя — зарегистрировать Telegram webhook: `node scripts/set-telegram-webhook.mjs` (с `APP_BASE_URL` и `TELEGRAM_WEBHOOK_SECRET`). Данные (SQLite) — на сервере в РФ (152-ФЗ/242-ФЗ).

## Ограничения / зона роста
- Хранилище — SQLite (под текущий масштаб; для роста — Postgres + полная изоляция).
- RAG/вектор не используется: ставка на живой `context_url` (точнее для динамичных данных).
- Онлайн-оплата (ЮKassa) — в roadmap; сейчас после триала оплата подключается вручную.
- Реальные интеграции в МИС/CRM (`Medflex`/`Direct`) — interface + Local-реализация, остальное задел.

## License
MIT — см. [LICENSE](LICENSE).
