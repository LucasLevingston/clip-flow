import type {
  PublishRecordRepository,
  PublishRecordSnapshot,
} from "../domain/repositories/PublishRecordRepository"

export class FakePublishRecordRepository implements PublishRecordRepository {
  private readonly recordsById = new Map<string, PublishRecordSnapshot>()

  seed(record: PublishRecordSnapshot): void {
    this.recordsById.set(record.id, record)
  }

  findById(publishRecordId: string): Promise<PublishRecordSnapshot | null> {
    return Promise.resolve(this.recordsById.get(publishRecordId) ?? null)
  }
}
