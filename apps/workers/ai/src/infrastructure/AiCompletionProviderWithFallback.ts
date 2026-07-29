import { shouldFallbackToSecondaryProvider } from "../domain/policies/AiProviderFallbackPolicy"
import type {
  AiCompletionProvider,
  GenerateCopyInput,
  GenerateCopyResult,
  SelectHighlightInput,
} from "../domain/services/AiCompletionProvider"
import type { HighlightSelection } from "../domain/value-objects/HighlightSelection"

/** ADR-0008 — Claude (primary) with automatic OpenAI fallback on timeout/rate-limit/5xx/invalid-response. */
export class AiCompletionProviderWithFallback implements AiCompletionProvider {
  constructor(
    private readonly primary: AiCompletionProvider,
    private readonly secondary: AiCompletionProvider,
  ) {}

  async selectHighlight(input: SelectHighlightInput): Promise<HighlightSelection> {
    try {
      return await this.primary.selectHighlight(input)
    } catch (error) {
      if (!shouldFallbackToSecondaryProvider(error)) {
        throw error
      }
      return this.secondary.selectHighlight(input)
    }
  }

  async generateCopy(input: GenerateCopyInput): Promise<GenerateCopyResult> {
    try {
      return await this.primary.generateCopy(input)
    } catch (error) {
      if (!shouldFallbackToSecondaryProvider(error)) {
        throw error
      }
      return this.secondary.generateCopy(input)
    }
  }
}
