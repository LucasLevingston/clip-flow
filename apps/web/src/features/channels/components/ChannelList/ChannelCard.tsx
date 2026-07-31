import Link from "next/link"
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import type { BadgeTone } from "@/components/ui"
import type { ChannelSummary } from "../../types"

const STATUS_LABEL: Record<ChannelSummary["status"], string> = {
  DRAFT: "Rascunho",
  ACTIVE: "Ativo",
  PAUSED: "Pausado",
}

const STATUS_TONE: Record<ChannelSummary["status"], BadgeTone> = {
  DRAFT: "neutral",
  ACTIVE: "success",
  PAUSED: "warning",
}

const PLATFORMS_LABEL: Record<ChannelSummary["platforms"], string> = {
  SHORTS_ONLY: "YouTube Shorts",
  TIKTOK_ONLY: "TikTok",
  BOTH: "YouTube + TikTok",
}

export function ChannelCard({ channel }: { channel: ChannelSummary }) {
  return (
    <Link href={`/channels/${channel.id}/settings`} className="block cursor-pointer">
      <Card className="transition-shadow duration-150 hover:shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle>{channel.name}</CardTitle>
            <Badge tone={STATUS_TONE[channel.status]}>{STATUS_LABEL[channel.status]}</Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-400">
          <span>{channel.nicheName}</span>
          <span>{PLATFORMS_LABEL[channel.platforms]}</span>
          <span>{channel.videosPerDay} vídeo(s)/dia</span>
        </CardContent>
      </Card>
    </Link>
  )
}
