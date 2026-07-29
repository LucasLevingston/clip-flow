import { SourceVideoNotFoundError } from "../../domain/errors/SourceVideoNotFoundError"
import { FakeAiCostRecorder } from "../../test-utils/FakeAiCostRecorder"
import { FakeSourceVideoRepository } from "../../test-utils/FakeSourceVideoRepository"
import { FakeTranscriptRepository } from "../../test-utils/FakeTranscriptRepository"
import { FakeTranscriptionProvider } from "../../test-utils/FakeTranscriptionProvider"
import { TranscribeSourceVideoUseCase } from "./TranscribeSourceVideoUseCase"

function buildUseCase() {
  const sourceVideoRepository = new FakeSourceVideoRepository()
  const transcriptRepository = new FakeTranscriptRepository()
  const transcriptionProvider = new FakeTranscriptionProvider()
  const costRecorder = new FakeAiCostRecorder()
  const useCase = new TranscribeSourceVideoUseCase({
    sourceVideoRepository,
    transcriptRepository,
    transcriptionProvider,
    costRecorder,
  })
  return {
    useCase,
    sourceVideoRepository,
    transcriptRepository,
    transcriptionProvider,
    costRecorder,
  }
}

describe("TranscribeSourceVideoUseCase", () => {
  it("should transcribe and cache a source video with no prior transcript", async () => {
    const { useCase, sourceVideoRepository, transcriptionProvider, costRecorder } = buildUseCase()
    sourceVideoRepository.seed({
      id: "source-1",
      nicheId: "niche-1",
      storageUrl: "https://cdn/source-1.mp4",
      durationSeconds: 120,
    })

    const transcript = await useCase.execute("source-1", "generated-1")

    expect(transcript.segments).toEqual([{ startMs: 0, endMs: 1_000, text: "hello" }])
    expect(transcriptionProvider.callCount).toBe(1)
    expect(costRecorder.entries).toEqual([
      { generatedVideoId: "generated-1", provider: "WHISPER", task: "transcribe", audioMinutes: 2 },
    ])
  })

  it("should not invoke the transcription provider on a second call for the same source video", async () => {
    const { useCase, sourceVideoRepository, transcriptionProvider } = buildUseCase()
    sourceVideoRepository.seed({
      id: "source-1",
      nicheId: "niche-1",
      storageUrl: "https://cdn/source-1.mp4",
      durationSeconds: 120,
    })

    await useCase.execute("source-1", "generated-1")
    await useCase.execute("source-1", "generated-2")

    expect(transcriptionProvider.callCount).toBe(1)
  })

  it("should throw when the source video does not exist", async () => {
    const { useCase } = buildUseCase()

    await expect(useCase.execute("missing", "generated-1")).rejects.toThrow(
      SourceVideoNotFoundError,
    )
  })
})
