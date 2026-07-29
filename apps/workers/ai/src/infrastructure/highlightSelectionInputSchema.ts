export const highlightSelectionInputSchema = {
  type: "object" as const,
  properties: {
    startMs: { type: "integer", description: "Start of the highlight, in milliseconds" },
    endMs: { type: "integer", description: "End of the highlight, in milliseconds" },
    transcriptSegmentIds: {
      type: "array",
      items: { type: "string" },
      description: "Indices (as strings) of the transcript segments covered by the highlight",
    },
  },
  required: ["startMs", "endMs", "transcriptSegmentIds"],
}
