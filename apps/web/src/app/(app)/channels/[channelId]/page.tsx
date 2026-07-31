import Link from "next/link"
import { AnalyticsSummary } from "@/features/analytics"
import { ChannelInsightsPanel, UpcomingSchedulePanel } from "@/features/channels"
import { ExportButton, VideoList } from "@/features/videos"

export default async function ChannelDetailPage({
  params,
}: {
  params: Promise<{ channelId: string }>
}) {
  const { channelId } = await params

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Vídeos do canal
        </h1>
        <div className="flex items-center gap-3">
          <ExportButton filters={{ channelId }} />
          <Link
            href={`/channels/${channelId}/settings`}
            className="text-sm text-brand-600 hover:underline"
          >
            Configurações
          </Link>
        </div>
      </div>
      <AnalyticsSummary channelId={channelId} />
      <UpcomingSchedulePanel channelId={channelId} />
      <ChannelInsightsPanel channelId={channelId} />
      <VideoList channelId={channelId} />
    </main>
  )
}
