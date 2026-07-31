"use client"

import { Card, CardContent, CardHeader, CardTitle, Skeleton } from "@/components/ui"
import { useChannelInsights } from "../../hooks/useChannelInsights"
import { formatDurationMs } from "./formatDurationMs"
import { formatPublishHours } from "./formatPublishHours"

export function ChannelInsightsPanel({ channelId }: { channelId: string }) {
  const { data, isLoading, isError } = useChannelInsights(channelId)

  if (isLoading) {
    return <Skeleton className="h-40" />
  }

  if (isError) {
    return (
      <p className="text-sm text-red-600 dark:text-red-400">
        Não foi possível carregar os insights.
      </p>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>O que a IA está aprendendo</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-600 dark:text-slate-400">
          Ainda não há histórico suficiente para gerar insights deste canal. Publique mais vídeos
          para que a IA comece a aprender os padrões que funcionam melhor.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>O que a IA está aprendendo</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm text-slate-700 dark:text-slate-300">
        <div>
          <span className="font-medium">Melhores horários: </span>
          {formatPublishHours(data.bestPublishHours)}
        </div>
        <div>
          <span className="font-medium">Padrões de título: </span>
          {data.topTitlePatterns.join(", ")}
        </div>
        <div>
          <span className="font-medium">Hashtags que performam: </span>
          {data.topHashtags.join(", ")}
        </div>
        <div>
          <span className="font-medium">Duração ideal: </span>
          {formatDurationMs(data.avgOptimalDurationMs)}
        </div>
      </CardContent>
    </Card>
  )
}
