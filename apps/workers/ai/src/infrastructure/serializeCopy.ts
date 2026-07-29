import type { VideoCopy } from "../domain/value-objects/VideoCopy"

export function serializeCopy(copy: VideoCopy) {
  return {
    title: copy.title,
    description: copy.description,
    hashtags: copy.hashtags,
    cta: copy.cta,
  }
}
