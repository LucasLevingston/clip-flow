/** FA3 — sensitive-content flags route the video to PENDING_MODERATION, not to a failure. */
export function shouldFlagForModeration(contentFlags: string[]): boolean {
  return contentFlags.length > 0
}
