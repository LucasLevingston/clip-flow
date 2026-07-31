import { GenerateVideoContentUseCase } from "../application/use-cases/GenerateVideoContentUseCase"
import { FakeAiCompletionProvider } from "./FakeAiCompletionProvider"
import { FakeAiNotificationPublisher } from "./FakeAiNotificationPublisher"
import { FakeChannelInsightsRepository } from "./FakeChannelInsightsRepository"
import { FakeChannelRepository } from "./FakeChannelRepository"
import { FakeGeneratedVideoRepository } from "./FakeGeneratedVideoRepository"
import { FakePromptTemplateRepository } from "./FakePromptTemplateRepository"
import { FakeSourceVideoTranscriber } from "./FakeSourceVideoTranscriber"
import { FakeVideoContentEventPublisher } from "./FakeVideoContentEventPublisher"

/** Wires a happy-path GenerateVideoContentUseCase (generated-1/channel-1/niche-1) for its test suite. */
export function buildGenerateVideoContentTestDeps() {
  const generatedVideoRepository = new FakeGeneratedVideoRepository()
  const channelRepository = new FakeChannelRepository()
  const promptTemplateRepository = new FakePromptTemplateRepository()
  const channelInsightsRepository = new FakeChannelInsightsRepository()
  const transcribeSourceVideoUseCase = new FakeSourceVideoTranscriber()
  const aiCompletionProvider = new FakeAiCompletionProvider()
  const videoContentEventPublisher = new FakeVideoContentEventPublisher()
  const notificationPublisher = new FakeAiNotificationPublisher()

  generatedVideoRepository.seed({
    id: "generated-1",
    tenantId: "tenant-1",
    channelId: "channel-1",
    sourceVideoId: "source-1",
    status: "SOURCING",
  })
  channelRepository.seed({
    id: "channel-1",
    nicheId: "niche-1",
    language: "pt-BR",
    promptOverride: null,
  })
  promptTemplateRepository.seed("niche-1", "HIGHLIGHT_SELECTION", {
    content: "select the best part",
    version: 3,
  })
  promptTemplateRepository.seed("niche-1", "COPY_GENERATION", {
    content: "write a hook",
    version: 2,
  })

  const useCase = new GenerateVideoContentUseCase({
    generatedVideoRepository,
    channelRepository,
    promptTemplateRepository,
    channelInsightsRepository,
    transcribeSourceVideoUseCase,
    aiCompletionProvider,
    videoContentEventPublisher,
    notificationPublisher,
  })

  return {
    useCase,
    generatedVideoRepository,
    channelRepository,
    promptTemplateRepository,
    channelInsightsRepository,
    transcribeSourceVideoUseCase,
    aiCompletionProvider,
    videoContentEventPublisher,
    notificationPublisher,
  }
}
