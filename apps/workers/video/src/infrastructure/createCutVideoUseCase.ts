import { createQueueProducer } from "@clip-flow/worker-kit"
import { createClient } from "@supabase/supabase-js"
import path from "node:path"
import { CutVideoUseCase } from "../application/use-cases/CutVideoUseCase"
import { BullMqVideoNotificationPublisher } from "./BullMqVideoNotificationPublisher"
import { BullMqVideoReadyPublisher } from "./BullMqVideoReadyPublisher"
import { ChannelPrismaRepository } from "./ChannelPrismaRepository"
import { FfmpegVideoProcessingService } from "./FfmpegVideoProcessingService"
import { GeneratedVideoPrismaRepository } from "./GeneratedVideoPrismaRepository"
import { NodeTempWorkspace } from "./NodeTempWorkspace"
import { OpenCvFocusDetector } from "./OpenCvFocusDetector"
import { SourceVideoPrismaRepository } from "./SourceVideoPrismaRepository"
import { SupabaseObjectStorageAdapter } from "./SupabaseObjectStorageAdapter"
import { TranscriptPrismaRepository } from "./TranscriptPrismaRepository"

const OPENCV_TIMEOUT_MS = 2 * 60 * 1_000

/** Composition root helper — wires the real FFmpeg/OpenCV/Supabase/Prisma/BullMQ-backed pipeline.
 * Paths are relative to process.cwd() (the package root both in `pnpm dev` and in the Docker
 * image, where scripts/ and models/ are copied alongside dist/ — see Dockerfile). */
export function createCutVideoUseCase(): CutVideoUseCase {
  const supabaseClient = createClient(
    process.env.SUPABASE_URL ?? "",
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  )

  return new CutVideoUseCase({
    generatedVideoRepository: new GeneratedVideoPrismaRepository(),
    sourceVideoRepository: new SourceVideoPrismaRepository(),
    channelRepository: new ChannelPrismaRepository(),
    transcriptRepository: new TranscriptPrismaRepository(),
    videoProcessingService: new FfmpegVideoProcessingService(),
    focusDetector: new OpenCvFocusDetector(
      process.env.PYTHON_BINARY ?? "python3",
      path.join(process.cwd(), "scripts", "analyze_frames.py"),
      path.join(process.cwd(), "models", "face_detection_yunet_2023mar.onnx"),
      OPENCV_TIMEOUT_MS,
    ),
    objectStorage: new SupabaseObjectStorageAdapter(
      supabaseClient,
      process.env.SUPABASE_STORAGE_BUCKET_GENERATED ?? "",
    ),
    tempWorkspace: new NodeTempWorkspace(),
    videoReadyPublisher: new BullMqVideoReadyPublisher(createQueueProducer("upload")),
    notificationPublisher: new BullMqVideoNotificationPublisher(
      createQueueProducer("notification"),
    ),
  })
}
