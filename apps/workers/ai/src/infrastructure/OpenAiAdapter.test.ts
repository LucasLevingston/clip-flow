import OpenAI, { APIConnectionTimeoutError, InternalServerError, RateLimitError } from "openai"
import { AiProviderInvalidResponseError } from "../domain/errors/AiProviderInvalidResponseError"
import { AiProviderRateLimitError } from "../domain/errors/AiProviderRateLimitError"
import { AiProviderServiceError } from "../domain/errors/AiProviderServiceError"
import { AiProviderTimeoutError } from "../domain/errors/AiProviderTimeoutError"
import { HighlightSelection } from "../domain/value-objects/HighlightSelection"
import { FakeAiCostRecorder } from "../test-utils/FakeAiCostRecorder"
import { OpenAiAdapter } from "./OpenAiAdapter"

function buildClient(create: jest.Mock) {
  return { chat: { completions: { create } } } as unknown as OpenAI
}

function buildToolCallResponse(argumentsObject: unknown) {
  return {
    usage: { prompt_tokens: 100, completion_tokens: 20 },
    choices: [
      {
        message: {
          tool_calls: [
            { type: "function", function: { arguments: JSON.stringify(argumentsObject) } },
          ],
        },
      },
    ],
  }
}

const selectHighlightInput = {
  generatedVideoId: "generated-1",
  transcript: [{ startMs: 0, endMs: 20_000, text: "hello world" }],
  promptTemplate: "pick the best part",
  usedHighlights: [],
  channelInsights: null,
}

describe("OpenAiAdapter", () => {
  it("should select a highlight from the tool call response and record cost", async () => {
    const create = jest
      .fn()
      .mockResolvedValue(
        buildToolCallResponse({ startMs: 1_000, endMs: 21_000, transcriptSegmentIds: ["0"] }),
      )
    const costRecorder = new FakeAiCostRecorder()
    const adapter = new OpenAiAdapter(buildClient(create), costRecorder, "gpt-model")

    const highlight = await adapter.selectHighlight(selectHighlightInput)

    expect(highlight.startMs).toBe(1_000)
    expect(highlight.endMs).toBe(21_000)
    expect(costRecorder.entries).toEqual([
      {
        generatedVideoId: "generated-1",
        provider: "OPENAI",
        task: "select_highlight",
        inputTokens: 100,
        outputTokens: 20,
      },
    ])
  })

  it("should generate copy from the tool call response", async () => {
    const create = jest.fn().mockResolvedValue(
      buildToolCallResponse({
        title: "Title",
        description: "Description",
        hashtags: ["#a"],
        cta: "Segue",
        contentFlags: [],
      }),
    )
    const adapter = new OpenAiAdapter(buildClient(create), new FakeAiCostRecorder(), "gpt-model")

    const result = await adapter.generateCopy({
      generatedVideoId: "generated-1",
      highlight: HighlightSelection.create(0, 20_000, ["0"]),
      transcript: [{ startMs: 0, endMs: 20_000, text: "hello" }],
      promptTemplate: "write a hook",
      language: "pt-BR",
      channelInsights: null,
    })

    expect(result.copy.title).toBe("Title")
    expect(result.contentFlags).toEqual([])
  })

  it("should not record cost when the response has no usage data", async () => {
    const create = jest.fn().mockResolvedValue({
      choices: [
        {
          message: {
            tool_calls: [
              {
                type: "function",
                function: {
                  arguments: JSON.stringify({
                    startMs: 1_000,
                    endMs: 21_000,
                    transcriptSegmentIds: ["0"],
                  }),
                },
              },
            ],
          },
        },
      ],
    })
    const costRecorder = new FakeAiCostRecorder()
    const adapter = new OpenAiAdapter(buildClient(create), costRecorder, "gpt-model")

    await adapter.selectHighlight(selectHighlightInput)

    expect(costRecorder.entries).toEqual([])
  })

  it("should map a timeout to AiProviderTimeoutError", async () => {
    const create = jest.fn().mockRejectedValue(new APIConnectionTimeoutError())
    const adapter = new OpenAiAdapter(buildClient(create), new FakeAiCostRecorder(), "gpt-model")

    await expect(adapter.selectHighlight(selectHighlightInput)).rejects.toThrow(
      AiProviderTimeoutError,
    )
  })

  it("should map a rate limit error to AiProviderRateLimitError", async () => {
    const create = jest
      .fn()
      .mockRejectedValue(new RateLimitError(429, {}, "rate limited", new Headers()))
    const adapter = new OpenAiAdapter(buildClient(create), new FakeAiCostRecorder(), "gpt-model")

    await expect(adapter.selectHighlight(selectHighlightInput)).rejects.toThrow(
      AiProviderRateLimitError,
    )
  })

  it("should map a 5xx error to AiProviderServiceError", async () => {
    const create = jest
      .fn()
      .mockRejectedValue(new InternalServerError(503, {}, "service unavailable", new Headers()))
    const adapter = new OpenAiAdapter(buildClient(create), new FakeAiCostRecorder(), "gpt-model")

    await expect(adapter.selectHighlight(selectHighlightInput)).rejects.toThrow(
      AiProviderServiceError,
    )
  })

  it("should throw AiProviderInvalidResponseError when there is no tool call", async () => {
    const create = jest.fn().mockResolvedValue({
      usage: { prompt_tokens: 10, completion_tokens: 5 },
      choices: [{ message: {} }],
    })
    const adapter = new OpenAiAdapter(buildClient(create), new FakeAiCostRecorder(), "gpt-model")

    await expect(adapter.selectHighlight(selectHighlightInput)).rejects.toThrow(
      AiProviderInvalidResponseError,
    )
  })

  it("should rethrow an unrecognized error unchanged", async () => {
    const create = jest.fn().mockRejectedValue(new Error("boom"))
    const adapter = new OpenAiAdapter(buildClient(create), new FakeAiCostRecorder(), "gpt-model")

    await expect(adapter.selectHighlight(selectHighlightInput)).rejects.toThrow("boom")
  })
})
