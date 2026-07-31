import type { IntegrationName } from "../domain/types"

/** Reachability ping targets — public/unauthenticated endpoints, no vendor quota spent. */
export const INTEGRATION_HEALTH_CHECK_URLS: Record<IntegrationName, string> = {
  youtube: "https://www.googleapis.com/",
  tiktok: "https://open.tiktokapis.com/",
  claude: "https://api.anthropic.com/",
  openai: "https://api.openai.com/v1/models",
  whisper: "https://api.openai.com/v1/models",
  stripe: "https://api.stripe.com/",
  email: "https://api.resend.com/",
}
