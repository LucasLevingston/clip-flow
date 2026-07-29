import OpenAI, { APIConnectionTimeoutError, InternalServerError, RateLimitError } from "openai"
import { AiProviderInvalidResponseError } from "../domain/errors/AiProviderInvalidResponseError"
import { AiProviderRateLimitError } from "../domain/errors/AiProviderRateLimitError"
import { AiProviderServiceError } from "../domain/errors/AiProviderServiceError"
import { AiProviderTimeoutError } from "../domain/errors/AiProviderTimeoutError"
import type {
  AiCompletionProvider,
  GenerateCopyInput,
  GenerateCopyResult,
  SelectHighlightInput,
} from "../domain/services/AiCompletionProvider"
import type { AiCostRecorder } from "../domain/services/AiCostRecorder"
import { HighlightSelection } from "../domain/value-objects/HighlightSelection"
import { VideoCopy } from "../domain/value-objects/VideoCopy"
import { buildCopyGenerationPrompt } from "./buildCopyGenerationPrompt"
import { buildHighlightSelectionPrompt } from "./buildHighlightSelectionPrompt"
import { copyGenerationInputSchema } from "./copyGenerationInputSchema"
import { highlightSelectionInputSchema } from "./highlightSelectionInputSchema"
import { callOpenAiTool, type OpenAiToolCall } from "./callOpenAiTool"

const SELECT_HIGHLIGHT_TIMEOUT_MS = 60_000
const GENERATE_COPY_TIMEOUT_MS = 30_000
const OPENAI_PROVIDER_NAME = "OpenAI"

interface HighlightToolInput {
  startMs: number
  endMs: number
  transcriptSegmentIds: string[]
}

interface CopyToolInput {
  title: string
  description: string
  hashtags: string[]
  cta: string
  contentFlags: string[]
}

/** ADR-0008 — fallback AI provider, same input/output contract as ClaudeAdapter. */
export class OpenAiAdapter implements AiCompletionProvider {
  constructor(
    private readonly client: OpenAI,
    private readonly costRecorder: AiCostRecorder,
    private readonly modelId: string,
  ) {}

  async selectHighlight(input: SelectHighlightInput): Promise<HighlightSelection> {
    const call: OpenAiToolCall = {
      toolName: "select_highlight",
      inputSchema: highlightSelectionInputSchema,
      prompt: buildHighlightSelectionPrompt(input),
      timeoutMs: SELECT_HIGHLIGHT_TIMEOUT_MS,
      generatedVideoId: input.generatedVideoId,
    }
    const toolInput = await this.callTool<HighlightToolInput>(call)
    return HighlightSelection.create(
      toolInput.startMs,
      toolInput.endMs,
      toolInput.transcriptSegmentIds,
    )
  }

  async generateCopy(input: GenerateCopyInput): Promise<GenerateCopyResult> {
    const call: OpenAiToolCall = {
      toolName: "generate_copy",
      inputSchema: copyGenerationInputSchema,
      prompt: buildCopyGenerationPrompt(input),
      timeoutMs: GENERATE_COPY_TIMEOUT_MS,
      generatedVideoId: input.generatedVideoId,
    }
    const toolInput = await this.callTool<CopyToolInput>(call)
    return {
      copy: VideoCopy.create(
        toolInput.title,
        toolInput.description,
        toolInput.hashtags,
        toolInput.cta,
      ),
      contentFlags: toolInput.contentFlags,
    }
  }

  private async callTool<T>(call: OpenAiToolCall): Promise<T> {
    try {
      return await callOpenAiTool<T>(this.client, this.modelId, this.costRecorder, call)
    } catch (error) {
      if (error instanceof AiProviderInvalidResponseError) {
        throw error
      }
      if (error instanceof APIConnectionTimeoutError) {
        throw new AiProviderTimeoutError(OPENAI_PROVIDER_NAME)
      }
      if (error instanceof RateLimitError) {
        throw new AiProviderRateLimitError(OPENAI_PROVIDER_NAME)
      }
      if (error instanceof InternalServerError) {
        throw new AiProviderServiceError(OPENAI_PROVIDER_NAME, error.status)
      }
      throw error
    }
  }
}
