"use client"

import { Card, CardContent, CardHeader, CardTitle, Skeleton } from "@/components/ui"
import { useChannelPipeline } from "../../hooks/useChannelPipeline"
import { PipelineQueueList } from "./PipelineQueueList"
import { PipelineStageBreakdown } from "./PipelineStageBreakdown"

export function PipelinePanel({ channelId }: { channelId: string }) {
  const { data: videos, isLoading } = useChannelPipeline(channelId)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pipeline em andamento</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {isLoading && <Skeleton className="h-16" />}
        {videos && videos.length === 0 && (
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Nenhum vídeo em processamento no momento.
          </p>
        )}
        {videos && videos.length > 0 && (
          <>
            <PipelineStageBreakdown videos={videos} />
            <PipelineQueueList videos={videos} />
          </>
        )}
      </CardContent>
    </Card>
  )
}
