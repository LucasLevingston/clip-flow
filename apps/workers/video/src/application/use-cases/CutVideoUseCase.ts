import { cutVideo, type CutVideoUseCaseDeps } from "./cutVideo"

export class CutVideoUseCase {
  constructor(private readonly deps: CutVideoUseCaseDeps) {}

  async execute(generatedVideoId: string): Promise<void> {
    await cutVideo(generatedVideoId, this.deps)
  }
}
