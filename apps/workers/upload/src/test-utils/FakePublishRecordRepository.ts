import type {
  CreatePublishRecordInput,
  PublishRecordRepository,
} from "../domain/repositories/PublishRecordRepository"

export class FakePublishRecordRepository implements PublishRecordRepository {
  readonly created: CreatePublishRecordInput[] = []
  private readonly existingKeys = new Set<string>()

  seedExisting(generatedVideoId: string, socialAccountId: string): void {
    this.existingKeys.add(`${generatedVideoId}:${socialAccountId}`)
  }

  exists(generatedVideoId: string, socialAccountId: string): Promise<boolean> {
    return Promise.resolve(this.existingKeys.has(`${generatedVideoId}:${socialAccountId}`))
  }

  create(input: CreatePublishRecordInput): Promise<{ id: string }> {
    this.created.push(input)
    this.existingKeys.add(`${input.generatedVideoId}:${input.socialAccountId}`)
    return Promise.resolve({ id: `publish-record-${this.created.length}` })
  }
}
