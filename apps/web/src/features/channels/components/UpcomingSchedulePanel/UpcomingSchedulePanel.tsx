"use client"

import { Badge, Card, CardContent, CardHeader, CardTitle, Skeleton } from "@/components/ui"
import { useChannel } from "../../hooks/useChannel"

export function UpcomingSchedulePanel({ channelId }: { channelId: string }) {
  const { data: channel, isLoading } = useChannel(channelId)

  if (isLoading) return <Skeleton className="h-24" />
  if (!channel || channel.status !== "ACTIVE") return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Próximos agendamentos</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Geração diária às {channel.generationTime}
        </p>
        <div className="flex flex-wrap gap-2">
          {channel.publishTimes.map((time) => (
            <Badge key={time}>{time}</Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
