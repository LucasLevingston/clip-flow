import type Anthropic from "@anthropic-ai/sdk"
import { AiProviderInvalidResponseError } from "../domain/errors/AiProviderInvalidResponseError"
import type { AiCostRecorder } from "../domain/services/AiCostRecorder"

export interface ClaudeToolInputSchema {
  type: "object"
  properties?: unknown
  required?: string[]
  [key: string]: unknown
}

export interface ClaudeToolCall {
  toolName: string
  inputSchema: ClaudeToolInputSchema
  prompt: string
  timeoutMs: number
  generatedVideoId: string
}

/** Calls Claude with a single forced tool — structured output, no free-text parsing. */
export async function callClaudeTool<T>(
  client: Anthropic,
  modelId: string,
  costRecorder: AiCostRecorder,
  call: ClaudeToolCall,
): Promise<T> {
  const message = await client.messages.create(
    {
      model: modelId,
      max_tokens: 1024,
      messages: [{ role: "user", content: call.prompt }],
      tools: [{ name: call.toolName, input_schema: call.inputSchema }],
      tool_choice: { type: "tool", name: call.toolName },
    },
    { timeout: call.timeoutMs },
  )

  costRecorder.record({
    generatedVideoId: call.generatedVideoId,
    provider: "CLAUDE",
    task: call.toolName,
    inputTokens: message.usage.input_tokens,
    outputTokens: message.usage.output_tokens,
  })

  const toolUse = message.content.find((block) => block.type === "tool_use")
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new AiProviderInvalidResponseError("Claude")
  }
  return toolUse.input as T
}
