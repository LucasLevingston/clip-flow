import type { BadgeTone } from "@/components/ui"
import type { GeneratedVideoStatus, SocialPlatform } from "./types"

export const STATUS_LABEL: Record<GeneratedVideoStatus, string> = {
  SOURCING: "Buscando fonte",
  TRANSCRIBING: "Transcrevendo",
  PENDING_MODERATION: "Em moderação",
  CONTENT_READY: "Conteúdo pronto",
  CUTTING: "Cortando",
  READY_TO_PUBLISH: "Pronto para publicar",
  PUBLISHED: "Publicado",
  FAILED: "Falhou",
  REJECTED: "Rejeitado",
}

export const STATUS_TONE: Record<GeneratedVideoStatus, BadgeTone> = {
  SOURCING: "neutral",
  TRANSCRIBING: "neutral",
  PENDING_MODERATION: "warning",
  CONTENT_READY: "neutral",
  CUTTING: "neutral",
  READY_TO_PUBLISH: "neutral",
  PUBLISHED: "success",
  FAILED: "danger",
  REJECTED: "danger",
}

export const PLATFORM_LABEL: Record<SocialPlatform, string> = {
  YOUTUBE: "YouTube",
  TIKTOK: "TikTok",
}
