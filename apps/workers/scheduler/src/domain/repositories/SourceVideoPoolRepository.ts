export interface SourceVideoCandidate {
  id: string
  durationSeconds?: number
  createdAt?: Date
  language?: string | null
  qualityScore?: number | null
}

/**
 * APPROVED SourceVideo in a niche, not yet used by a given channel (RNF-34, reduces intra-channel
 * repetition). `limit` is the candidate POOL size fed into ranking (rankSourceVideoCandidates),
 * not the final selection count — callers slice after ranking.
 */
export interface SourceVideoPoolRepository {
  findAvailableForChannel(
    nicheId: string,
    channelId: string,
    limit: number,
  ): Promise<SourceVideoCandidate[]>
}
