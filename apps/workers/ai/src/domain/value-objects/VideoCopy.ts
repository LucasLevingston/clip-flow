import { InvalidVideoCopyError } from "../errors/InvalidVideoCopyError"

const MAX_TITLE_LENGTH = 100
const MAX_HASHTAGS = 10
const MAX_CTA_LENGTH = 140

/** Generated title/description/hashtags/CTA — one AI completion, not separate steps (docs/architecture/ai-flow.md). */
export class VideoCopy {
  private constructor(
    private readonly titleValue: string,
    private readonly descriptionValue: string,
    private readonly hashtagsValue: string[],
    private readonly ctaValue: string,
  ) {}

  static create(title: string, description: string, hashtags: string[], cta: string): VideoCopy {
    if (title.length === 0 || title.length > MAX_TITLE_LENGTH) {
      throw new InvalidVideoCopyError(`title must be 1-${MAX_TITLE_LENGTH} characters`)
    }
    if (hashtags.length > MAX_HASHTAGS) {
      throw new InvalidVideoCopyError(`hashtags must have at most ${MAX_HASHTAGS} items`)
    }
    if (cta.length === 0 || cta.length > MAX_CTA_LENGTH) {
      throw new InvalidVideoCopyError(`cta must be 1-${MAX_CTA_LENGTH} characters`)
    }
    return new VideoCopy(title, description, hashtags, cta)
  }

  get title(): string {
    return this.titleValue
  }

  get description(): string {
    return this.descriptionValue
  }

  get hashtags(): string[] {
    return this.hashtagsValue
  }

  get cta(): string {
    return this.ctaValue
  }
}
