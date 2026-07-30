import { mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import { OpenCvAnalysisError } from "../domain/errors/OpenCvAnalysisError"
import { OpenCvFocusDetector } from "./OpenCvFocusDetector"

async function writeFakeScript(dir: string, code: string): Promise<string> {
  const scriptPath = path.join(dir, "fake-script.js")
  await writeFile(scriptPath, code, "utf8")
  return scriptPath
}

describe("OpenCvFocusDetector", () => {
  let dir: string

  beforeEach(async () => {
    dir = await mkdtemp(path.join(tmpdir(), "opencv-focus-"))
  })

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true })
  })

  it("should resolve with an empty array without spawning a process when there are no frames", async () => {
    const detector = new OpenCvFocusDetector(
      "does-not-matter",
      "does-not-matter",
      "model.onnx",
      5_000,
    )

    await expect(detector.analyzeFrames([])).resolves.toEqual([])
  })

  it("should parse the JSON array printed to stdout by the analysis script", async () => {
    const payload = JSON.stringify([
      { framePath: "a.jpg", faceCenterX: 10, faceCenterY: 20, sharpness: 5 },
    ])
    const scriptPath = await writeFakeScript(
      dir,
      `process.stdout.write(${JSON.stringify(payload)})`,
    )
    const detector = new OpenCvFocusDetector(process.execPath, scriptPath, "model.onnx", 5_000)

    const result = await detector.analyzeFrames(["a.jpg"])

    expect(result).toEqual([{ framePath: "a.jpg", faceCenterX: 10, faceCenterY: 20, sharpness: 5 }])
  })

  it("should reject with OpenCvAnalysisError when the process exits with a nonzero code", async () => {
    const scriptPath = await writeFakeScript(
      dir,
      "process.stderr.write('model failed to load'); process.exit(1)",
    )
    const detector = new OpenCvFocusDetector(process.execPath, scriptPath, "model.onnx", 5_000)

    await expect(detector.analyzeFrames(["a.jpg"])).rejects.toThrow(OpenCvAnalysisError)
  })

  it("should fall back to the process error message when stderr is empty", async () => {
    const scriptPath = await writeFakeScript(dir, "process.exit(1)")
    const detector = new OpenCvFocusDetector(process.execPath, scriptPath, "model.onnx", 5_000)

    await expect(detector.analyzeFrames(["a.jpg"])).rejects.toThrow(OpenCvAnalysisError)
  })

  it("should reject with OpenCvAnalysisError when stdout is not valid JSON", async () => {
    const scriptPath = await writeFakeScript(dir, "process.stdout.write('not json')")
    const detector = new OpenCvFocusDetector(process.execPath, scriptPath, "model.onnx", 5_000)

    await expect(detector.analyzeFrames(["a.jpg"])).rejects.toThrow(OpenCvAnalysisError)
  })
})
