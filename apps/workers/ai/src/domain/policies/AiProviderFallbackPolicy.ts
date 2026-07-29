import { AiProviderInvalidResponseError } from "../errors/AiProviderInvalidResponseError"
import { AiProviderRateLimitError } from "../errors/AiProviderRateLimitError"
import { AiProviderServiceError } from "../errors/AiProviderServiceError"
import { AiProviderTimeoutError } from "../errors/AiProviderTimeoutError"

/** ADR-0008 — decides whether the primary provider's failure should trigger the fallback provider. */
export function shouldFallbackToSecondaryProvider(error: unknown): boolean {
  return (
    error instanceof AiProviderTimeoutError ||
    error instanceof AiProviderRateLimitError ||
    error instanceof AiProviderServiceError ||
    error instanceof AiProviderInvalidResponseError
  )
}
