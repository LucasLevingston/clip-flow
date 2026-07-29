import type {
  CreateGeneratedVideoInput,
  GeneratedVideoRepository,
} from "../domain/repositories/GeneratedVideoRepository"

export class FakeGeneratedVideoRepository implements GeneratedVideoRepository {
  readonly created: CreateGeneratedVideoInput[] = []
  private readonly existingBatchRunIds = new Set<string>()

  seedExistingBatch(channelId: string, batchRunId: string): void {
    this.existingBatchRunIds.add(`${channelId}:${batchRunId}`)
  }

  existsForBatch(channelId: string, batchRunId: string): Promise<boolean> {
    return Promise.resolve(this.existingBatchRunIds.has(`${channelId}:${batchRunId}`))
  }

  create(input: CreateGeneratedVideoInput): Promise<{ id: string }> {
    this.created.push(input)
    return Promise.resolve({ id: `generated-video-${this.created.length}` })
  }
}
