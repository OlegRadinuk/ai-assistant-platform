/**
 * Базовый URL Telegram Bot API.
 *
 * На РФ-хостинге api.telegram.org часто недоступен напрямую (файрвол на
 * Telegram-диапазоны). Поэтому базовый адрес настраивается через env
 * TELEGRAM_API_BASE — туда подставляется reverse-прокси (например Cloudflare
 * worker), который форвардит запросы к Telegram. Формат пути одинаковый:
 * `<base>/bot<token>/<method>`.
 *
 * По умолчанию — прямой api.telegram.org (работает на не-РФ хостинге).
 */
export const TELEGRAM_API_BASE =
  process.env.TELEGRAM_API_BASE || "https://api.telegram.org"
