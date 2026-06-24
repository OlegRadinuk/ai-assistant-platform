/**
 * AI routing config.
 * WORKING_PROXY — Cloudflare Worker forwarding to api.anthropic.com.
 * Needed when the server is in RU where direct access is blocked.
 */
export const WORKING_PROXY =
  "https://ai-proxyoptispheretech.radinuko.workers.dev/v1/"

/**
 * Hosts that can't be reached directly from RU servers.
 * Any base_url matching one of these is rerouted through WORKING_PROXY.
 */
export const REROUTE_HOSTS = ["api.anthropic.com", "aiprime.store", "aiprimetech.io"]

/**
 * Returns an effective baseURL, stripping the trailing /v1/ so the
 * Anthropic SDK can append /v1/messages itself.
 */
export function resolveBaseURL(rawBaseURL: string | undefined | null): string {
  const url = rawBaseURL || ""
  // If ANTHROPIC_BASE_URL is set in env, use it directly (allows override for demos)
  const envOverride = process.env.ANTHROPIC_BASE_URL
  if (envOverride) return envOverride.replace(/\/v1\/?$/, "")

  if (!url) return "" // empty → Anthropic SDK defaults to api.anthropic.com
  const effective = REROUTE_HOSTS.some((h) => url.includes(h)) ? WORKING_PROXY : url
  return effective.replace(/\/v1\/?$/, "")
}
