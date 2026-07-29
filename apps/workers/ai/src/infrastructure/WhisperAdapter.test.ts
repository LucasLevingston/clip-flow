import type OpenAI from "openai"
import { WhisperAdapter } from "./WhisperAdapter"

function stubFetchResponse(): void {
  global.fetch = jest.fn().mockResolvedValue({
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
  })
}

describe("WhisperAdapter", () => {
  it("should transcribe a source video and normalize segments to milliseconds", async () => {
    const create = jest.fn().mockResolvedValue({
      language: "portuguese",
      segments: [
        { id: 0, start: 0, end: 1.5, text: "hello" },
        { id: 1, start: 1.5, end: 3.2, text: "world" },
      ],
    })
    const client = { audio: { transcriptions: { create } } } as unknown as OpenAI
    const adapter = new WhisperAdapter(client)
    stubFetchResponse()

    const result = await adapter.transcribe({
      id: "source-1",
      storageUrl: "https://cdn/source-1.mp4",
    })

    expect(result.language).toBe("portuguese")
    expect(result.segments).toEqual([
      { startMs: 0, endMs: 1_500, text: "hello" },
      { startMs: 1_500, endMs: 3_200, text: "world" },
    ])
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ model: "whisper-1", response_format: "verbose_json" }),
      { timeout: 5 * 60 * 1000 },
    )
  })

  it("should return an empty segment list when the response has none", async () => {
    const create = jest.fn().mockResolvedValue({ language: "english" })
    const client = { audio: { transcriptions: { create } } } as unknown as OpenAI
    const adapter = new WhisperAdapter(client)
    stubFetchResponse()

    const result = await adapter.transcribe({
      id: "source-1",
      storageUrl: "https://cdn/source-1.mp4",
    })

    expect(result.segments).toEqual([])
  })
})
