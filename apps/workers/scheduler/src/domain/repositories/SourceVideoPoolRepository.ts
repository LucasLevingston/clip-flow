export interface SourceVideoCandidate {
  id: string
}

/** APPROVED SourceVideo in a niche, not yet used by a given channel (RNF-34, reduces intra-channel repetition). */
export interface SourceVideoPoolRepository {
  findAvailableForChannel(
    nicheId: string,
    channelId: string,
    limit: number,
  ): Promise<SourceVideoCandidate[]>
}
