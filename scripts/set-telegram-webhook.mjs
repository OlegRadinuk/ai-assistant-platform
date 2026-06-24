/**
 * Set the Telegram webhook for the shared platform bot.
 *
 * Usage (after deploy):
 *   TELEGRAM_BOT_TOKEN=<token> APP_BASE_URL=https://yourdomain.com TELEGRAM_WEBHOOK_SECRET=<secret> node scripts/set-telegram-webhook.mjs
 *
 * Or with a .env.local file (use dotenv-cli or export vars first):
 *   export $(grep -v '^#' .env.local | xargs) && node scripts/set-telegram-webhook.mjs
 *
 * This registers <APP_BASE_URL>/api/telegram/webhook as the webhook URL.
 * The webhook must be reachable from Telegram servers (no localhost).
 * TELEGRAM_WEBHOOK_SECRET is passed as secret_token so Telegram includes it in each
 * update request header (X-Telegram-Bot-Api-Secret-Token). Without it the webhook
 * route will still work but requests won't be authenticated.
 */

const token         = process.env.TELEGRAM_BOT_TOKEN
const baseUrl       = process.env.APP_BASE_URL
const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET

if (!token)   { console.error("ERROR: TELEGRAM_BOT_TOKEN is not set"); process.exit(1) }
if (!baseUrl) { console.error("ERROR: APP_BASE_URL is not set"); process.exit(1) }

if (!webhookSecret) {
  console.warn("WARNING: TELEGRAM_WEBHOOK_SECRET is not set — webhook will not be authenticated.")
}

const webhookUrl = `${baseUrl}/api/telegram/webhook`

const payload = { url: webhookUrl }
if (webhookSecret) {
  Object.assign(payload, { secret_token: webhookSecret })
}

const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
})

const data = await res.json()
if (data.ok) {
  console.log(`Webhook set successfully: ${webhookUrl}`)
  if (webhookSecret) console.log("secret_token: configured")
  console.log(data.description)
} else {
  console.error("Failed to set webhook:", data)
  process.exit(1)
}
