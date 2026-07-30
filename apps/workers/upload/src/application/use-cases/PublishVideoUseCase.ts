import { publishVideo, type PublishVideoUseCaseDeps } from "./publishVideo"

export class PublishVideoUseCase {
  constructor(private readonly deps: PublishVideoUseCaseDeps) {}

  async execute(generatedVideoId: string): Promise<void> {
    await publishVideo(generatedVideoId, this.deps)
  }
}
