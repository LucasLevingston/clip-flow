export class OpenCvAnalysisError extends Error {
  constructor(details: string) {
    super(`OpenCV frame analysis failed: ${details}`)
    this.name = "OpenCvAnalysisError"
  }
}
