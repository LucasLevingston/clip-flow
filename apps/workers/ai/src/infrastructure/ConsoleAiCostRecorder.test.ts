import { ConsoleAiCostRecorder } from "./ConsoleAiCostRecorder"

describe("ConsoleAiCostRecorder", () => {
  it("should log the cost entry as structured JSON", () => {
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => undefined)
    const recorder = new ConsoleAiCostRecorder()
    const entry = {
      generatedVideoId: "generated-1",
      provider: "CLAUDE" as const,
      task: "select_highlight",
      inputTokens: 100,
      outputTokens: 20,
    }

    recorder.record(entry)

    expect(logSpy).toHaveBeenCalledWith(`[ai-cost] ${JSON.stringify(entry)}`)
    logSpy.mockRestore()
  })
})
