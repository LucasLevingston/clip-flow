import { Badge } from "@/components/ui"
import { STATUS_LABEL, STATUS_TONE } from "../../constants"
import type { VideoSummary } from "../../types"

export function PipelineQueueList({ videos }: { videos: VideoSummary[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {videos.map((video, index) => (
        <li
          key={video.id}
          className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-sm dark:border-slate-800"
        >
          <span className="text-slate-600 dark:text-slate-400">
            #{index + 1} · {new Date(video.createdAt).toLocaleTimeString("pt-BR")}
          </span>
          <Badge tone={STATUS_TONE[video.status]}>{STATUS_LABEL[video.status]}</Badge>
        </li>
      ))}
    </ul>
  )
}
