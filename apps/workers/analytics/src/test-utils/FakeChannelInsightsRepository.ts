import type {
  ChannelInsightsRepository,
  ChannelInsightsUpsertInput,
} from "../domain/repositories/ChannelInsightsRepository"

export class FakeChannelInsightsRepository implements ChannelInsightsRepository {
  readonly upserted: ChannelInsightsUpsertInput[] = []

  upsert(input: ChannelInsightsUpsertInput): Promise<void> {
    this.upserted.push(input)
    return Promise.resolve()
  }
}
