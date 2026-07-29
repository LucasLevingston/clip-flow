import { createQueueProducer } from "@clip-flow/worker-kit"
import Anthropic from "@anthropic-ai/sdk"
import OpenAI from "openai"
import { GenerateVideoContentUseCase } from "../application/use-cases/GenerateVideoContentUseCase"
import { TranscribeSourceVideoUseCase } from "../application/use-cases/TranscribeSourceVideoUseCase"
import { AiCompletionProviderWithFallback } from "./AiCompletionProviderWithFallback"
import { BullMqAiNotificationPublisher } from "./BullMqAiNotificationPublisher"
import { BullMqVideoContentEventPublisher } from "./BullMqVideoContentEventPublisher"
import { ChannelInsightsPrismaRepository } from "./ChannelInsightsPrismaRepository"
import { ChannelPrismaRepository } from "./ChannelPrismaRepository"
import { ClaudeAdapter } from "./ClaudeAdapter"
import { ConsoleAiCostRecorder } from "./ConsoleAiCostRecorder"
import { GeneratedVideoPrismaRepository } from "./GeneratedVideoPrismaRepository"
import { OpenAiAdapter } from "./OpenAiAdapter"
import { PromptTemplatePrismaRepository } from "./PromptTemplatePrismaRepository"
import { SourceVideoPrismaRepository } from "./SourceVideoPrismaRepository"
import { TranscriptPrismaRepository } from "./TranscriptPrismaRepository"
import { WhisperAdapter } from "./WhisperAdapter"

const OPENAI_MODEL_ID = "gpt-4o-mini"

/** Composition root helper — wires the real Claude/OpenAI/Whisper + Prisma + BullMQ-backed pipeline. */
export function createGenerateVideoContentUseCase(): GenerateVideoContentUseCase {
  const anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const openAiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const costRecorder = new ConsoleAiCostRecorder()

  const aiCompletionProvider = new AiCompletionProviderWithFallback(
    new ClaudeAdapter(anthropicClient, costRecorder, process.env.CLAUDE_MODEL_ID ?? ""),
    new OpenAiAdapter(openAiClient, costRecorder, OPENAI_MODEL_ID),
  )

  const transcribeSourceVideoUseCase = new TranscribeSourceVideoUseCase({
    sourceVideoRepository: new SourceVideoPrismaRepository(),
    transcriptRepository: new TranscriptPrismaRepository(),
    transcriptionProvider: new WhisperAdapter(openAiClient),
    costRecorder,
  })

  return new GenerateVideoContentUseCase({
    generatedVideoRepository: new GeneratedVideoPrismaRepository(),
    channelRepository: new ChannelPrismaRepository(),
    promptTemplateRepository: new PromptTemplatePrismaRepository(),
    channelInsightsRepository: new ChannelInsightsPrismaRepository(),
    transcribeSourceVideoUseCase,
    aiCompletionProvider,
    videoContentEventPublisher: new BullMqVideoContentEventPublisher(createQueueProducer("video")),
    notificationPublisher: new BullMqAiNotificationPublisher(createQueueProducer("notification")),
  })
}
