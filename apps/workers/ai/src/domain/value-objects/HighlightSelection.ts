import { InvalidHighlightSelectionError } from "../errors/InvalidHighlightSelectionError"

const MIN_DURATION_MS = 15_000
const MAX_DURATION_MS = 90_000

/** 15–90s window — the Shorts/TikTok duration limits (docs/architecture/ai-flow.md). */
export class HighlightSelection {
  private constructor(
    private readonly startMsValue: number,
    private readonly endMsValue: number,
    private readonly transcriptSegmentIdsValue: string[],
  ) {}

  static create(
    startMs: number,
    endMs: number,
    transcriptSegmentIds: string[],
  ): HighlightSelection {
    const durationMs = endMs - startMs
    if (durationMs < MIN_DURATION_MS || durationMs > MAX_DURATION_MS) {
      throw new InvalidHighlightSelectionError(durationMs)
    }
    return new HighlightSelection(startMs, endMs, transcriptSegmentIds)
  }

  get startMs(): number {
    return this.startMsValue
  }

  get endMs(): number {
    return this.endMsValue
  }

  get transcriptSegmentIds(): string[] {
    return this.transcriptSegmentIdsValue
  }
}
