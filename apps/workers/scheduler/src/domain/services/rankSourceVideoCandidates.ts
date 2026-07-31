import type { ChannelSnapshot } from "../repositories/ChannelReadRepository"
import type { SourceVideoCandidate } from "../repositories/SourceVideoPoolRepository"

const NEUTRAL_SCORE = 50
const IDEAL_DURATION_MIN_SECONDS = 180
const IDEAL_DURATION_MAX_SECONDS = 1200
const DURATION_FLOOR_SECONDS = 60
const DURATION_CEILING_SECONDS = 3600
const RECENCY_FLOOR_SCORE = 20
const RECENCY_DECAY_DAYS = 90
const LANGUAGE_MATCH_SCORE = 100
const LANGUAGE_MISMATCH_SCORE = 20
const MS_PER_DAY = 1000 * 60 * 60 * 24

const WEIGHT_QUALITY = 0.4
const WEIGHT_DURATION = 0.25
const WEIGHT_RECENCY = 0.2
const WEIGHT_LANGUAGE = 0.15

/**
 * EPIC-02 (AI Ranking) — scores each candidate on signals actually derivable before selection:
 * admin-assessed quality, duration fit for short-form source material, freshness and channel
 * language match. Niche relevance is guaranteed 100% by the pool query's own WHERE clause, so
 * it isn't scored here. "Potencial viral" has no real signal pre-publish (no engagement data
 * exists yet for an unused SourceVideo) — folded into the admin quality score rather than
 * fabricated as its own number. Missing per-candidate data scores neutral, never disqualifying.
 */
export function rankSourceVideoCandidates(
  candidates: SourceVideoCandidate[],
  channel: Pick<ChannelSnapshot, "language">,
  now: Date,
): SourceVideoCandidate[] {
  return candidates
    .map((candidate) => ({ candidate, score: scoreCandidate(candidate, channel, now) }))
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.candidate)
}

function scoreCandidate(
  candidate: SourceVideoCandidate,
  channel: Pick<ChannelSnapshot, "language">,
  now: Date,
): number {
  return (
    (candidate.qualityScore ?? NEUTRAL_SCORE) * WEIGHT_QUALITY +
    scoreDurationFit(candidate.durationSeconds) * WEIGHT_DURATION +
    scoreRecency(candidate.createdAt, now) * WEIGHT_RECENCY +
    scoreLanguageMatch(candidate.language, channel.language) * WEIGHT_LANGUAGE
  )
}

function scoreDurationFit(durationSeconds: number | undefined): number {
  if (durationSeconds === undefined) return NEUTRAL_SCORE
  if (
    durationSeconds >= IDEAL_DURATION_MIN_SECONDS &&
    durationSeconds <= IDEAL_DURATION_MAX_SECONDS
  ) {
    return 100
  }

  const tooShort = durationSeconds < IDEAL_DURATION_MIN_SECONDS
  const distance = tooShort
    ? IDEAL_DURATION_MIN_SECONDS - durationSeconds
    : durationSeconds - IDEAL_DURATION_MAX_SECONDS
  const range = tooShort
    ? IDEAL_DURATION_MIN_SECONDS - DURATION_FLOOR_SECONDS
    : DURATION_CEILING_SECONDS - IDEAL_DURATION_MAX_SECONDS
  const fraction = Math.min(Math.max(distance / range, 0), 1)
  return 100 * (1 - fraction)
}

function scoreRecency(createdAt: Date | undefined, now: Date): number {
  if (!createdAt) return NEUTRAL_SCORE
  const ageDays = Math.max(0, (now.getTime() - createdAt.getTime()) / MS_PER_DAY)
  const fraction = Math.min(ageDays / RECENCY_DECAY_DAYS, 1)
  return 100 - fraction * (100 - RECENCY_FLOOR_SCORE)
}

function scoreLanguageMatch(
  candidateLanguage: string | null | undefined,
  channelLanguage: string,
): number {
  if (!candidateLanguage) return NEUTRAL_SCORE
  const normalize = (value: string) => value.trim().toLowerCase().slice(0, 2)
  return normalize(candidateLanguage) === normalize(channelLanguage)
    ? LANGUAGE_MATCH_SCORE
    : LANGUAGE_MISMATCH_SCORE
}
