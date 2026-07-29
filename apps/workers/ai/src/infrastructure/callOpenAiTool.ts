import type OpenAI from "openai"
import { AiProviderInvalidResponseError } from "../domain/errors/AiProviderInvalidResponseError"
import type { AiCostRecorder } from "../domain/services/AiCostRecorder"

export interface OpenAiToolCall {
  toolName: string
  inputSchema: Record<string, unknown>
  prompt: string
  timeoutMs: number
  generatedVideoId: string
}

/** Calls OpenAI with a single forced function tool — same structured-output contract as Claude. */
export async function callOpenAiTool<T>(
  client: OpenAI,
  modelId: string,
  costRecorder: AiCostRecorder,
  call: OpenAiToolCall,
): Promise<T> {
  const response = await client.chat.completions.create(
    {
      model: modelId,
      messages: [{ role: "user", content: call.prompt }],
      tools: [
        { type: "function", function: { name: call.toolName, parameters: call.inputSchema } },
      ],
      tool_choice: { type: "function", function: { name: call.toolName } },
    },
    { timeout: call.timeoutMs },
  )

  if (response.usage) {
    costRecorder.record({
      generatedVideoId: call.generatedVideoId,
      provider: "OPENAI",
      task: call.toolName,
      inputTokens: response.usage.prompt_tokens,
      outputTokens: response.usage.completion_tokens,
    })
  }

  const toolCall = response.choices[0]?.message.tool_calls?.[0]
  if (!toolCall || toolCall.type !== "function") {
    throw new AiProviderInvalidResponseError("OpenAI")
  }
  return JSON.parse(toolCall.function.arguments) as T
}
