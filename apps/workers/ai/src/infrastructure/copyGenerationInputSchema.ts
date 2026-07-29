export const copyGenerationInputSchema = {
  type: "object" as const,
  properties: {
    title: { type: "string", description: "Video title, at most 100 characters" },
    description: { type: "string", description: "Video description" },
    hashtags: {
      type: "array",
      items: { type: "string" },
      description: "At most 10 hashtags, without the leading #",
    },
    cta: { type: "string", description: "Call to action, at most 140 characters" },
    contentFlags: {
      type: "array",
      items: { type: "string" },
      description: "Sensitive-content flags, empty when the content is safe",
    },
  },
  required: ["title", "description", "hashtags", "cta", "contentFlags"],
}
