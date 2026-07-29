import { AiProviderInvalidResponseError } from "../errors/AiProviderInvalidResponseError"
import { AiProviderRateLimitError } from "../errors/AiProviderRateLimitError"
import { AiProviderServiceError } from "../errors/AiProviderServiceError"
import { AiProviderTimeoutError } from "../errors/AiProviderTimeoutError"
import { shouldFallbackToSecondaryProvider } from "./AiProviderFallbackPolicy"

describe("shouldFallbackToSecondaryProvider", () => {
  it("should fall back on a timeout", () => {
    expect(shouldFallbackToSecondaryProvider(new AiProviderTimeoutError("Claude"))).toBe(true)
  })

  it("should fall back on a rate limit error", () => {
    expect(shouldFallbackToSecondaryProvider(new AiProviderRateLimitError("Claude"))).toBe(true)
  })

  it("should fall back on a service error", () => {
    expect(shouldFallbackToSecondaryProvider(new AiProviderServiceError("Claude", 503))).toBe(true)
  })

  it("should fall back on an invalid response error", () => {
    expect(shouldFallbackToSecondaryProvider(new AiProviderInvalidResponseError("Claude"))).toBe(
      true,
    )
  })

  it("should not fall back on an unrecognized error", () => {
    expect(shouldFallbackToSecondaryProvider(new Error("boom"))).toBe(false)
  })
})
