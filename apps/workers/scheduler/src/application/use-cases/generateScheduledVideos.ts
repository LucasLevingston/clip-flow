import { allocateScheduledPublishTimes } from "../../domain/services/allocateScheduledPublishTimes"
import type { AlertPublisher } from "../../domain/services/AlertPublisher"
import type { GenerationJobPublisher } from "../../domain/services/GenerationJobPublisher"
import { rankSourceVideoCandidates } from "../../domain/services/rankSourceVideoCandidates"
import type { ChannelSnapshot } from "../../domain/repositories/ChannelReadRepository"
import type { GeneratedVideoRepository } from "../../domain/repositories/GeneratedVideoRepository"
import type {
  SourceVideoCandidate,
  SourceVideoPoolRepository,
} from "../../domain/repositories/SourceVideoPoolRepository"

export interface GenerateScheduledVideosDeps {
  sourceVideoPoolRepository: SourceVideoPoolRepository
  generatedVideoRepository: GeneratedVideoRepository
  generationJobPublisher: GenerationJobPublisher
  alertPublisher: AlertPublisher
}

/** How much larger than videosPerDay the fetched candidate pool is before ranking picks the best. */
const CANDIDATE_POOL_MULTIPLIER = 5

/** Ranks the available pool (EPIC-02) and allocates a slot per selected candidate; alerts on FA1, never lets one video's failure stop the rest. */
export async function generateScheduledVideos(
  channel: ChannelSnapshot,
  batchRunId: string,
  now: Date,
  deps: GenerateScheduledVideosDeps,
): Promise<void> {
  const pool = await deps.sourceVideoPoolRepository.findAvailableForChannel(
    channel.nicheId,
    channel.id,
    channel.videosPerDay * CANDIDATE_POOL_MULTIPLIER,
  )
  if (pool.length < channel.videosPerDay) {
    await deps.alertPublisher.publishInsufficientPool({
      channelId: channel.id,
      tenantId: channel.tenantId,
      requiredCount: channel.videosPerDay,
      availableCount: pool.length,
    })
  }
  const candidates = rankSourceVideoCandidates(pool, channel, now).slice(0, channel.videosPerDay)

  const scheduledTimes = allocateScheduledPublishTimes(channel.publishTimes, now)
  const context: GenerationContext = { channel, batchRunId, deps }
  await Promise.all(
    candidates.map((candidate, index) =>
      generateOne(context, candidate, scheduledTimes[index] ?? now),
    ),
  )
}

interface GenerationContext {
  channel: ChannelSnapshot
  batchRunId: string
  deps: GenerateScheduledVideosDeps
}

async function generateOne(
  context: GenerationContext,
  candidate: SourceVideoCandidate,
  scheduledPublishAt: Date,
): Promise<void> {
  const { channel, batchRunId, deps } = context
  try {
    const created = await deps.generatedVideoRepository.create({
      tenantId: channel.tenantId,
      channelId: channel.id,
      sourceVideoId: candidate.id,
      batchRunId,
      scheduledPublishAt,
    })
    await deps.generationJobPublisher.publish({
      tenantId: channel.tenantId,
      channelId: channel.id,
      batchRunId,
      sourceVideoId: candidate.id,
      generatedVideoId: created.id,
      scheduledPublishAt: scheduledPublishAt.toISOString(),
    })
  } catch (error) {
    console.error(`[scheduler] failed to generate video for channel ${channel.id}`, error)
  }
}
