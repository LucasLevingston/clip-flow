import type { IntegrationHealthChecker } from "../domain/services/IntegrationHealthChecker"

const DEFAULT_TIMEOUT_MS = 5_000

/**
 * Lightweight reachability ping — no authenticated calls (avoids burning vendor
 * API quota every minute). Any response the server sends back (even 4xx) means
 * the integration is reachable; only a network failure/timeout means DOWN.
 */
export class HttpIntegrationHealthChecker implements IntegrationHealthChecker {
  constructor(
    private readonly url: string,
    private readonly timeoutMs: number = DEFAULT_TIMEOUT_MS,
  ) {}

  async isHealthy(): Promise<boolean> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs)

    try {
      const response = await fetch(this.url, { method: "GET", signal: controller.signal })
      return response.status < 500
    } catch {
      return false
    } finally {
      clearTimeout(timeout)
    }
  }
}
