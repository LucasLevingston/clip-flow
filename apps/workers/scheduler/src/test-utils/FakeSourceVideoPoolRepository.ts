import type {
  SourceVideoCandidate,
  SourceVideoPoolRepository,
} from "../domain/repositories/SourceVideoPoolRepository"

export class FakeSourceVideoPoolRepository implements SourceVideoPoolRepository {
  private pool: SourceVideoCandidate[] = []

  seed(candidates: SourceVideoCandidate[]): void {
    this.pool = candidates
  }

  findAvailableForChannel(
    _nicheId: string,
    _channelId: string,
    limit: number,
  ): Promise<SourceVideoCandidate[]> {
    return Promise.resolve(this.pool.slice(0, limit))
  }
}
