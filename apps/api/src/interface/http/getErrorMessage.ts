/** Narrows an unknown catch value to a safe message string for error envelopes. */
export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unexpected error"
}
