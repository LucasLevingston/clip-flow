import { generateVideoContent, type GenerateVideoContentDeps } from "./generateVideoContent"

export class GenerateVideoContentUseCase {
  constructor(private readonly deps: GenerateVideoContentDeps) {}

  async execute(generatedVideoId: string): Promise<void> {
    await generateVideoContent(generatedVideoId, this.deps)
  }
}
